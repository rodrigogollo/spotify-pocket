use axum::extract::Query;
use axum::extract::State;
use base64::{engine::general_purpose, Engine as _};
use dotenvy::dotenv;
use rand::distributions::Alphanumeric;
use rand::Rng;
use reqwest::Client;
use serde_json::{json, Value};
use tauri::utils::acl::Number;
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, WindowEvent};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_store::StoreBuilder;

#[tauri::command]
pub fn initiate_spotify_auth(app_handle: AppHandle) {
    dotenv().ok();
    let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
    let redirect_uri = "http://localhost:3000/callback";
    let state = generate_random_state();
    let scope = "user-read-private user-read-email user-modify-playback-state streaming user-read-playback-state user-library-read";

    let auth_url = format!(
      "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope={}&state={}",
      client_id, redirect_uri, scope, state
  );

    app_handle
        .shell()
        .open(&auth_url, None)
        .expect("Failed to open authorization URL");
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    logged: bool,
    access_token: String,
}

pub async fn handle_spotify_callback(
    State(app_handle): State<Arc<AppHandle>>,
    Query(params): Query<HashMap<String, String>>,
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
        let client_secret =
            env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

        let credentials = format!("{}:{}", client_id, client_secret);
        let encoded = general_purpose::STANDARD.encode(credentials);
        let authorization = format!("Basic {}", encoded);
        println!("auth: {}", authorization);

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


        // save refresh token
        let app_handle_ref = app_handle.as_ref();
        let store = StoreBuilder::new(app_handle_ref, "store.json").build();

        store.set("REFRESH_TOKEN", json!({ "value": json["refresh_token"] }));
        store.save();
        // let refresh = store.get("REFRESH_TOKEN").expect("Failed to get value from store");
        // println!("refresh token from store {}", refresh);

        // emit event to frontend
        if let Err(e) = app_handle.emit(
            "loaded",
            Payload {
                logged: true,
                access_token: json["access_token"].as_str().unwrap_or("").to_string(), // get the raw string
            },
        ) {
            eprint!("failed to emit event: {}", e)
        }

        "Authorized, you can close this window."
    } else {
        println!("Authorization failed. No code found.");
        "Authorization failed. No code found."
    }
}

#[tauri::command]
pub async fn refresh_token(app_handle: AppHandle) -> String {
    dotenv().ok();
    println!("refreshing token");
    let url = "https://accounts.spotify.com/api/token".to_owned();
    let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

    let store = StoreBuilder::new(&app_handle, "store.json").build();
    let store_result = store.get("REFRESH_TOKEN").expect("Failed to get token from store");

    let stored_refresh_token = &store_result["value"];
    println!("refresh token from store {}", stored_refresh_token);

    let refresh_token = match stored_refresh_token.as_str() {
        Some(s) => s,
        None => {
            eprintln!("REFRESH_TOKEN is not a string");
            return "".to_string();
        }
    };

    let mut params = HashMap::new();
    params.insert("grant_type", "refresh_token");
    params.insert("refresh_token", refresh_token);
    params.insert("client_id", client_id.as_str());
    
    let credentials = format!("{}:{}", client_id, client_secret);
    let encoded = general_purpose::STANDARD.encode(credentials);
    let authorization = format!("Basic {}", encoded);

    let http_client = Client::new();
    let response = http_client
      .post(url)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("Authorization", authorization)
      .form(&params)
      .send()
      .await
      .unwrap()
      .text()
      .await
      .unwrap();

    let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
    println!("Refreshed Json: {:?}", json);
    let access_token = json["access_token"].as_str().expect("Token not found or not a string");
    return access_token.to_string();
}

#[tauri::command]
pub async fn transfer_playback(access_token: String, device_id: String) -> bool {
    println!("token: {}, device: {}", access_token, device_id);

    let url = "https://api.spotify.com/v1/me/player";
    let authorization = format!("Bearer {}", access_token);

    let payload = json!({
      "device_ids": [device_id]
    });
    let http_client = Client::new();
    let response = http_client
        .put(url)
        .header("Authorization", authorization)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .unwrap();

    match response.error_for_status() {
        Ok(_response) => {
            println!("Device successfully transfered");
            true
        }
        Err(err) => {
            println!("Error transfering device {}: {}", device_id, err);
            false
        }
    }
}

#[tauri::command]
pub async fn get_user_saved_tracks(access_token: String) -> String {
    let url = "https://api.spotify.com/v1/me/tracks";
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    // params.insert("market", "ES");
    params.insert("limit", 50);
    params.insert("offset", 0);

    let http_client = Client::new();
    let response = http_client
        .get(url)
        .header("Authorization", authorization)
        .header("Content-Type", "application/json")
        .query(&params)
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();

    let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
    return json.to_string();
}

#[tauri::command]
pub async fn set_playback(access_token: String, uris: Vec<String>, offset: Number) -> bool {
    // context_uri = albums, artists and playlists
    // uris = spotify tracks 
    // offset = where in the context playback should start (album/playlist). Ex: 5
    // position_ms = where song starts.

    let url = "https://api.spotify.com/v1/me/player/play";
    let authorization = format!("Bearer {}", access_token);

    let payload = json!({
        "uris": uris,
        "offset": {
            "position": offset
        },
        "position_ms": 0
    });

    let http_client = Client::new();
    let response = http_client
        .put(url)
        .header("Authorization", authorization)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .unwrap();
        // .text()
        // .await
        // .unwrap();

    // let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
    // println!("set playback {}", json);
    // return json.to_string();

    match response.error_for_status() {
        Ok(_response) => {
            println!("Song successfully changed.");
            true
        }
        Err(err) => {
            println!("Error changing song {}", err);
            false
        }
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
