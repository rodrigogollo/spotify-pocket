mod routes;
pub mod pref;
pub mod spotify;

use std::sync::Arc;
use std::env;
use dotenv;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if cfg!(debug_assertions) {
        dotenv::from_filename(".env").unwrap().load();
    } else {
        dotenv::from_filename(".env.production").unwrap().load();
    }
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
            spotify::get_album_tracks,
            spotify::get_playlist,
            spotify::get_album,
            spotify::search,
            spotify::get_user_top_items,
            spotify::user_log_out,
            spotify::check_user_saved_tracks,
            spotify::like_songs,
            spotify::unlike_songs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
