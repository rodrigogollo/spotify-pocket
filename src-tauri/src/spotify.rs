use reqwest::blocking::Client;
use serde_json::Value;
use dotenvy::dotenv;
use std::env;
use tauri::command;


#[tauri::command]
pub fn request_test() -> String{
  dotenv().ok();
  let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
  let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

  let token = access_token(&client_id, &client_secret);
  println!("{}", token);
  let artist= get_artist(token);
  println!("{}", artist);
  artist
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