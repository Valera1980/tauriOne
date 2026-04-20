
use serde::Serialize;

#[derive(Serialize)]
pub struct DropdownOption {
    value: String,
    label: String,
}
#[tauri::command]
pub fn dropdown_options() -> Vec<DropdownOption> {
   let mut option = Vec::new();
   for i in 0..10 {
    option.push(DropdownOption{
        value: format!("option{}", i),
        label: format!("Option {}", i),
    });
   }
   option
}