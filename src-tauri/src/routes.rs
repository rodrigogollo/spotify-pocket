use axum::Router;

async fn backend_server() {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/callback", get(handle_spotify_callback()));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_spotify_callback() {
    if let Some(code) = params.get("code") {
        // Here, you can process the authorization code
        println!("Received authorization code: {}", code);

        // Now you can exchange the code for an access token
        // You can send this code back to your frontend using Tauri's invoke method

        "Authorization successful! You can close this window."
    } else {
        "Authorization failed. No code found."
    }
}
