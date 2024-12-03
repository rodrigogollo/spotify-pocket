// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod routes;
mod spotify;

fn main() {
    spotify_pocket_lib::run()
}
