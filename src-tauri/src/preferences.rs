use serde::{Serialize, Deserialize};
use serde_json::{to_string, from_str};
use std::io::{self, Write, Read};
use std::fs::File;

#[derive(Serialize, Deserialize, Debug)]
pub struct UserPreferences {
    pub refresh_token: Option<String>,
    pub theme: String,
    pub language: String,
}

impl UserPreferences {
    pub fn default() -> Self {
        UserPreferences {
            refresh_token: None,
            theme: "dark".to_string(),
            language: "EN".to_string(),
        }
    }
}

pub fn save_preferences(prefrences: &UserPreferences, file_path: &str) -> io::Result<()> {
    let json = to_string(prefrences)?;
    let mut file = File::create(file_path)?;
    file.write_all(json.as_bytes())?;
    Ok(())
}

pub fn load_preferences(file_path: &str) -> io::Result<UserPreferences> {
    let mut file = File::open(file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let preferences: UserPreferences = from_str(&contents)?;

    Ok(preferences)
}

pub fn clear_preferences(file_path: &str) -> io::Result<()> {
    let default_preferences = UserPreferences::default();
    save_preferences(&default_preferences, file_path);
    Ok(())
}
