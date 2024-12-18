mod routes;
mod spotify;
use std::sync::Arc;
use tauri_plugin_store::StoreExt;
use tauri::Wry;
use serde_json::json;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = Arc::new(app.handle().clone());

            tauri::async_runtime::spawn(async move {
                let app = Arc::clone(&app_handle);
                if let Err(e) = routes::backend_server(app).await {
                    eprintln!("failed to run backend server: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            spotify::initiate_spotify_auth,
            spotify::transfer_playback,
            spotify::refresh_token,
            spotify::get_user_saved_tracks,
            spotify::set_playback,
            spotify::toggle_shuffle,
            spotify::toggle_repeat,
            spotify::get_user_playlists,
            spotify::get_playlist_tracks,
            spotify::get_playlist,
            spotify::search,
            spotify::get_user_top_items
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
