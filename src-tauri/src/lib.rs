// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod spotify;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tokio::spawn(async {
        run_axum_server().await;
    });
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![spotify::request_test, spotify::get_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
