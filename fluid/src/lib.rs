use wasm_bindgen::prelude::*;

// This makes the function available to JS/TS
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! This is Rust speaking!", name)
}
