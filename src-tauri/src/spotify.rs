use reqwest::blocking::Client;
use serde_json::Value;
use dotenvy::dotenv;
use std::env;
use tauri::command;
use rand::Rng;
use rand::distributions::Alphanumeric;
use tauri_plugin_shell::open;

#[tauri::command]
pub fn initiate_spotify_auth() {
  let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
  let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");
  let redirect_uri = "https://localhost:5000/redirect";
  let state = generate_random_state();

  let params = [
    ("client_id", client_id),
    ("client_secret", client_secret),
    ("response-type", "code".to_string()),
    ("redirect_uri", redirect_uri.to_string()),
    ("scope", "user-read-private user-read-email user-modify-playback-state".to_string()),
    ("state", state.clone()),
  ];

  let auth_url = format!(
      "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope={}&state={}",
      client_id, redirect_uri, scope, state
  );

    // Launch the authorization URL in the user's default browser
    shell::open(&auth_url).expect("Failed to open authorization URL");
}

fn generate_random_state() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect()
}

#[tauri::command]
pub fn request_test() -> String {
  dotenv().ok();
  let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
  let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

  let token = access_token(&client_id, &client_secret);
  println!("{}", token);
  let artist= get_artist(token);
  println!("{}", artist);
  artist
}

#[tauri::command]
pub fn get_token() -> String {
  dotenv().ok();
  let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
  let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

  let token = access_token(&client_id, &client_secret);
  println!("{}", token);
  token
}

fn get_artist(token: String) -> String {
  let http_client = Client::new();

  let response = http_client.get("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb")
    .header("Authorization", format!("Bearer {}", token))
    .send()
    .expect("failed to get response")
    .text()
    .expect("failed to get payload");

  let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");

  let pretty_json = serde_json::to_string_pretty(&response)
    .expect("Failed to format JSON");

  println!("{}", pretty_json);

  let artist_name = json["name"]
    .as_str()
    .expect("No access token found")
    .to_string();
  
   artist_name
}

#[tauri::command]
fn access_token(client_id: &str, client_secret: &str) -> String {
  let http_client = Client::new();    
  let params = [
    ("grant_type", "client_credentials"),
    ("client_id", client_id),
    ("client_secret", client_secret),
  ];
  let url = "https://accounts.spotify.com/api/token";

  let response = http_client.post(url) 
  .form(&params)
  .send()
  .expect("failed to get response")
  .text()
  .expect("failed to get payload");

  let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
  let access_token = json["access_token"]
    .as_str()
    .expect("No access token found")
    .to_string();

  access_token
}
