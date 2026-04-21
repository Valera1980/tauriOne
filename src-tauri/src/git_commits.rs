use git2::Repository;
#[tauri::command]
pub async fn commit_list(path: String, branch: String) -> Result<Vec<String>, String> {
   let repo = Repository::open(&path).map_err(|e| e.to_string())?;
   let revwalk = repo.revwalk().map_err(|e| e.to_string())?;

   Ok(vec![path])
}