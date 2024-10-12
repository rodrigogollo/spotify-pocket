use reqwest::Client;
use serde_json::Value;
use dotenvy::dotenv;
use std::env;
use tauri::AppHandle;
use rand::Rng;
use tauri_plugin_shell::ShellExt; 
use rand::distributions::Alphanumeric;
use axum::extract::Query;
use std::collections::HashMap;
use std::sync::Arc;
use axum::extract::State;
use tauri::Emitter;
use base64::{engine::general_purpose, Engine as _};

#[tauri::command]
pub fn initiate_spotify_auth(app_handle: AppHandle) {
  dotenv().ok();
  let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
  let redirect_uri = "http://localhost:3000/callback";
  let state = generate_random_state();
  let scope = "user-read-private user-read-email user-modify-playback-state streaming user-read-playback-state";

  let auth_url = format!(
      "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope={}&state={}",
      client_id, redirect_uri, scope, state
  );

    app_handle.shell().open(&auth_url, None).expect("Failed to open authorization URL");
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    logged: bool,
    access_token: String,
    refresh_token: String,
}

pub async fn handle_spotify_callback(
    State(app_handle): State<Arc<AppHandle>>,
    Query(params): Query<HashMap<String, String>>
) -> &'static str {
    let code = params.get("code");
    let state = params.get("state");
    if let (Some(code), Some(state_value)) = (code, state) {
    
      println!("code {}", code);
      let redirect_uri = "http://localhost:3000/callback".to_owned();
      let authorization_code = "authorization_code".to_owned();

      let mut params = HashMap::new();
      params.insert("code", code);
      params.insert("redirect_uri", &redirect_uri);
      params.insert("grant_type", &authorization_code);

      let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
      let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

      let credentials = format!("{}:{}", client_id, client_secret);
      let encoded = general_purpose::STANDARD.encode(credentials);
      let authorization = format!("Basic {}", encoded);

      let url = "https://accounts.spotify.com/api/token";

      let http_client = Client::new();    
      let response = http_client
        .post(url) 
        .header("Authorization", authorization)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&params)
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();

      let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
      println!("Json: {:?}", json);


      // emit event to frontend
      if let Err(e) = app_handle.emit("loaded", 
        Payload { 
          logged: true, 
          access_token: json["access_token"].as_str().unwrap_or("").to_string(), // get the raw string
          refresh_token: json["refresh_token"].as_str().unwrap_or("").to_string(),  
        }) {
         eprint!("failed to emit event: {}", e)
      }

      "Authorized"

    } else {
      println!("Authorization failed. No code found.");
      "Authorization failed. No code found."
    }
}

pub async fn handle_spotify_token() -> &'static str {
  println!("handle token");
  "token"
}

fn generate_random_state() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect()
}

// #[tauri::command]
// pub fn request_test() -> String {
//   dotenv().ok();
//   let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
//   let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");
//
//   let token = access_token(&client_id, &client_secret);
//   println!("{}", token);
//   let artist= get_artist(token);
//   println!("{}", artist);
//   artist
// }

// #[tauri::command]
// pub async fn get_token() -> String {
//   dotenv().ok();
//   let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
//   let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");
//
//   let token = access_token(&client_id, &client_secret);
//   println!("{}", token);
//   token.await
// }

// fn get_artist(token: String) -> String {
//   let http_client = Client::new();
//
//   let response = http_client.get("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb")
//     .header("Authorization", format!("Bearer {}", token))
//     .send()
//     .expect("failed to get response")
//     .text()
//     .expect("failed to get payload");
//
//   let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
//
//   let pretty_json = serde_json::to_string_pretty(&response)
//     .expect("Failed to format JSON");
//
//   println!("{}", pretty_json);
//
//   let artist_name = json["name"]
//     .as_str()
//     .expect("No access token found")
//     .to_string();
//   
//    artist_name
// }

// #[tauri::command]
// async fn access_token(client_id: &str, client_secret: &str) -> String {
//   let http_client = Client::new();    
//   let params = [
//     ("grant_type", "client_credentials"),
//     ("client_id", client_id),
//     ("client_secret", client_secret),
//   ];
//   let url = "https://accounts.spotify.com/api/token";
//
//   let response = http_client.post(url) 
//   .form(&params)
//   .send()
//   .await?
//   .json::<Value>()
//   .await?;
//
//   let access_token = response["access_token"]
//     .as_str()
//     .ok_or("No access token found")?
//     .to_string();
//
//   access_token
// }
