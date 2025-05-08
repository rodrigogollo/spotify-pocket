use axum::extract::Query;
use axum::extract::State;
use base64::{engine::general_purpose, Engine as _};
use rand::distributions::Alphanumeric;
use rand::Rng;
use reqwest::Client;
use serde_json::{json, Value};
use tauri::utils::acl::Number;
use std::collections::HashMap;
use std::env;
use dotenv;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::ShellExt;
use pref::{UserPreferences, save_preferences, load_preferences, clear_preferences};

mod pref {
    use serde::{Serialize, Deserialize};
    use serde_json::{to_string, from_str};
    use std::io::{self, Write, Read};
    use std::fs::File;

    const FILE_PATH: &str = "../preferences.json";

    #[derive(Serialize, Deserialize, Debug)]
    pub struct UserPreferences {
        pub refresh_token: Option<String>,
        pub theme: String,
        pub language: String,
    }

    impl UserPreferences {
        pub fn default() -> Self {
            UserPreferences {
                refresh_token: None,
                theme: "dark".to_string(),
                language: "EN".to_string(),
            }
        }
    }

    pub fn save_preferences(prefrences: &UserPreferences) -> io::Result<()> {
        let json = to_string(prefrences)?;
        let mut file = File::create(FILE_PATH)?;
        file.write_all(json.as_bytes())?;
        Ok(())
    }

    pub fn load_preferences() -> io::Result<UserPreferences> {
        let mut file = File::open(FILE_PATH)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        let preferences: UserPreferences = from_str(&contents)?;

        Ok(preferences)
    }

    pub fn clear_preferences() -> io::Result<()> {
        let default_preferences = UserPreferences::default();
        save_preferences(&default_preferences);
        Ok(())
    }
}

#[tauri::command]
pub fn initiate_spotify_auth(app_handle: AppHandle) {
    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap();
    let redirect_uri = "http://localhost:3000/callback";
    let state = generate_random_state();
    let scope_list: [&str; 10] = [
        "user-read-private", 
        "user-read-email", 
        "user-modify-playback-state", 
        "streaming", 
        "user-read-playback-state", 
        "user-library-read", 
        "playlist-read-private",
        "playlist-read-collaborative",
        "user-top-read",
        "user-library-modify",
    ];
    
    let scope = scope_list.join(" ");

    let auth_url = format!(
      "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope={}&state={}",
      client_id, redirect_uri, scope, state
    );

    if let Err(e) = app_handle.shell().open(&auth_url, None) {
        eprintln!("Failed to open authorization URL.");
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    logged: bool,
    access_token: String,
}

pub async fn handle_spotify_callback(
    State(app_handle): State<Arc<AppHandle>>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<String, String> {
    println!("handle_spotify_callback");
    dotenv::load().ok();

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
        let mut preferences = load_preferences().unwrap_or_else(|_| {
            UserPreferences::default()
        });

        preferences.refresh_token = json.get("refresh_token")
            .and_then(|v| v.as_str()) 
            .map(|s| s.to_string());

        // save preferences
        save_preferences(&preferences);

        // emit event to frontend
        app_handle.emit(
            "loaded",
            Payload {
                logged: true,
                access_token: json["access_token"].as_str().unwrap_or("").to_string(),
            },
        )
        .map_err(|e| e.to_string())?; // Handle event emission errors 

        println!("Authorization success.");
        Ok("Authorized, you can close this window.".to_string())
    } else {
        println!("Authorization failed. No code found.");
        Err("Authorization failed. No code found.".to_string())
    }
}


#[tauri::command]
pub async fn user_log_out() -> bool {
    println!("Logging out the current user.");

    let loaded_preferences = load_preferences();
    println!("Loaded Preferences: {:?}", loaded_preferences);
    clear_preferences();

    let cleared_preferences = load_preferences();
    println!("Cleared Preferences: {:?}", cleared_preferences);

    true
}

#[tauri::command]
pub async fn check_user_saved_tracks(access_token: String, ids: Vec<String>) -> String {
    let url = "https://api.spotify.com/v1/me/tracks/contains".to_owned();
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("ids", ids.join(","));

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
pub async fn refresh_token() -> String {
    println!("refreshing token");
    dotenv::load().ok();

    let url = "https://accounts.spotify.com/api/token".to_owned();
    let client_id = env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID not found in .env");
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET not found in .env");

    let loaded_preferences: UserPreferences = load_preferences()
        .unwrap_or_else(|_| UserPreferences::default());
    
    let stored_refresh_token = loaded_preferences.refresh_token.clone();

    println!("refresh token from store {}", stored_refresh_token.as_deref().unwrap_or("no refresh token"));

    let refresh_token = match stored_refresh_token {
        Some(ref token) => token.as_str(),
        None => "No token vailable",
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
pub async fn toggle_shuffle(access_token: String, state: bool) -> bool {
    println!("token: {}, shuffle: {}", access_token, state);

    let url = format!("https://api.spotify.com/v1/me/player/shuffle");
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("state", state);

    let http_client = Client::new();
    let response = http_client
        .put(url)
        .header("Authorization", authorization)
        .header("Content-Length", 0)
        .query(&params)
        .send()
        .await
        .unwrap();

    println!("Toggle Shuffle Json: {:?}", response);

    match response.error_for_status() {
        Ok(_response) => {
            // println!("Toggled shuffle {}", response.state);
            true
            // response.state
        }
        Err(err) => {
            println!("Error shuffling: {}", err);
            false
        }
    }
}

#[tauri::command]
pub async fn toggle_repeat(access_token: String, state: i32) -> bool {
    println!("token: {}, repeat: {}", access_token, state);
    
    let options: [&str; 3] = ["off", "context", "track"];
    print!("{}", options[state as usize]);

    let url = format!("https://api.spotify.com/v1/me/player/repeat");
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("state", options[state as usize]);

    let http_client = Client::new();
    let response = http_client
        .put(url)
        .header("Authorization", authorization)
        .header("Content-Length", 0)
        .query(&params)
        .send()
        .await
        .unwrap();

    // let json: Value = serde_json::from_str(&response).expect("Failed to parse JSON");
    println!("Toggle Repeat Json: {:?}", response);

    match response.error_for_status() {
        Ok(_response) => {
            true
        }
        Err(err) => {
            println!("Error shuffling: {}", err);
            false
        }
    }
}

#[tauri::command]
pub async fn get_user_top_items(access_token: String) -> String {
    let url = "https://api.spotify.com/v1/me/top/artists";
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("offset", 0.to_string());
    params.insert("limit", 10.to_string());
    params.insert("market", "US".to_string());

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
pub async fn get_user_saved_tracks(access_token: String, offset: i32, limit: i32) -> String {
    let url = "https://api.spotify.com/v1/me/tracks";
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("offset", offset.to_string());
    params.insert("limit", limit.to_string());
    params.insert("market", "US".to_string());

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
pub async fn get_playlist_tracks(access_token: String, offset: i32, limit: i32, playlist_id: String) -> String {
    let url = format!("https://api.spotify.com/v1/playlists/{}/tracks", playlist_id);
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("offset", offset.to_string());
    params.insert("limit", limit.to_string());
    params.insert("market", "US".to_string());

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
pub async fn get_album_tracks(access_token: String, offset: i32, limit: i32, album_id: String) -> String {
    let url = format!("https://api.spotify.com/v1/albums/{}/tracks", album_id);
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("offset", offset.to_string());
    params.insert("limit", limit.to_string());
    params.insert("market", "US".to_string());

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
pub async fn search(access_token: String, offset: i32, limit: i32, query: String, media_type: String) -> String {
    let url = format!("https://api.spotify.com/v1/search");
    let authorization = format!("Bearer {}", access_token);

    //let media_type: String = "album,track".to_string();

    let mut params = HashMap::new();
    params.insert("q", query);
    params.insert("offset", offset.to_string());
    params.insert("limit", limit.to_string());
    params.insert("type", media_type);

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
pub async fn get_playlist(access_token: String, playlist_id: String) -> String {
    let url = format!("https://api.spotify.com/v1/playlists/{}", playlist_id);
    let authorization = format!("Bearer {}", access_token);

    // let mut params = HashMap::new();
    // // params.insert("market", "ES");
    // params.insert("offset", offset);
    // params.insert("limit", limit);

    let http_client = Client::new();
    let response = http_client
        .get(url)
        .header("Authorization", authorization)
        .header("Content-Type", "application/json")
        // .query(&params)
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
pub async fn get_album(access_token: String, album_id: String) -> String {
    let url = format!("https://api.spotify.com/v1/albums/{}", album_id);
    let authorization = format!("Bearer {}", access_token);

    // let mut params = HashMap::new();
    // // params.insert("market", "ES");
    // params.insert("offset", offset);
    // params.insert("limit", limit);

    let http_client = Client::new();
    let response = http_client
        .get(url)
        .header("Authorization", authorization)
        .header("Content-Type", "application/json")
        // .query(&params)
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
pub async fn get_user_playlists(access_token: String, offset: i32, limit: i32) -> String {
    let url = "https://api.spotify.com/v1/me/playlists";
    let authorization = format!("Bearer {}", access_token);

    let mut params = HashMap::new();
    params.insert("offset", offset);
    params.insert("limit", limit);

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
pub async fn like_songs(access_token: String, ids: Vec<String>) -> bool {
    println!("token: {}, tracks: {:?}", access_token, ids);

    let url = "https://api.spotify.com/v1/me/tracks";
    let authorization = format!("Bearer {}", access_token);

    let payload = json!({
      "ids": ids
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
            println!("Track successfully saved");
            true
        }
        Err(err) => {
            println!("Error saving tracks {:?}: {}", ids, err);
            false
        }
    }
}

#[tauri::command]
pub async fn unlike_songs(access_token: String, ids: Vec<String>) -> bool {
    println!("token: {}, tracks: {:?}", access_token, ids);

    let url = "https://api.spotify.com/v1/me/tracks";
    let authorization = format!("Bearer {}", access_token);

    let payload = json!({
      "ids": ids
    });

    let http_client = Client::new();
    let response = http_client
        .delete(url)
        .header("Authorization", authorization)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .unwrap();

    match response.error_for_status() {
        Ok(_response) => {
            println!("Track successfully saved");
            true
        }
        Err(err) => {
            println!("Error saving tracks {:?}: {}", ids, err);
            false
        }
    }
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
