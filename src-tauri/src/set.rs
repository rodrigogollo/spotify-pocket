#[tauri::command]
pub async fn like_songs(access_token: String, uris: Vec<String>) -> bool {
    println!("token: {}, track: {}", access_token, uri);

    let url = "https://api.spotify.com/v1/me/tracks";
    let authorization = format!("Bearer {}", access_token);

    let payload = json!({
      "ids": uris
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
            println!("Error saving track {}: {}", uri, err);
            false
        }
    }
}
