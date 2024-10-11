use axum::{Router, routing::get};
use axum::extract::Query;
use std::collections::HashMap;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tauri::AppHandle;
use std::sync::Arc;
use axum::extract::State;
use tauri::Emitter;

#[derive(Clone, serde::Serialize)]
struct Payload {
    logged_in: bool,
    token: String
}

pub async fn backend_server(app_handle: Arc<AppHandle>) -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/callback", get(handle_spotify_callback))
        .with_state(app_handle);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn handle_spotify_callback(
    State(app_handle): State<Arc<AppHandle>>,
    Query(params): Query<HashMap<String, String>>
) -> &'static str {
    if let Some(code) = params.get("code") {
        if let Err(e) = app_handle.emit("loaded", Payload { logged_in: true, token: code.to_string() }) {
            eprint!("failed to emit event: {}", e)
        }

        "Authorization successful! You can close this window."
        //redirect to frontend 
    } else {
        "Authorization failed. No code found."
    }
}
