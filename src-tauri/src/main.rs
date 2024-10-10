// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod spotify;
mod routes;

fn main() {
    // spotify_lite_lib::run()
    // spotify::request_test();    
    routes::main();
}
