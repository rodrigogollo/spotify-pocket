mod spotify;
mod routes;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = Arc::new(app.handle().clone());
            tauri::async_runtime::spawn(async move {
                let app_handle = Arc::clone(&app_handle);
                if let Err(e) = routes::backend_server(app_handle).await {
                    eprintln!("failed to run backend server: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            spotify::request_test, 
            spotify::get_token, 
            spotify::initiate_spotify_auth
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
