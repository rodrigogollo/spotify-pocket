use crate::spotify::handle_spotify_callback;
use crate::spotify::handle_spotify_token;
use axum::{routing::get, Router};
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::AppHandle;
use tokio::net::TcpListener;

pub async fn backend_server(app_handle: Arc<AppHandle>) -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/callback", get(handle_spotify_callback))
        .with_state(app_handle)
        .route("/token", get(handle_spotify_token));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
