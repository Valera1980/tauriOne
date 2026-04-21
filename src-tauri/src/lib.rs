mod commands;
mod dropdown_options;
mod  git_branches;
mod test;
mod  git_commits;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::greet, dropdown_options::dropdown_options, git_branches::branches_list, test::test, git_commits::commit_list])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
