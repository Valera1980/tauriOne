use git2::Repository;
use serde::Serialize;

#[derive(Serialize)]
pub struct Branch {
    name: String,
    is_head: bool,
      commit_id: String,      // latest commit hash
    commit_message: String, // latest commit message
}

#[tauri::command]
pub fn branches_list(path: String) -> Result<Vec<Branch>, String> {
    let repo = Repository::open(path).map_err(|e| e.to_string())?;
    let branches = repo.branches(None).map_err(|e| e.to_string())?;

    let result = branches
        .filter_map(|b| b.ok())
        .filter_map(|(branch, _)| {
            let name = branch.name().ok()??.to_string();
            let is_head = branch.is_head();
            let commit = branch.get().peel_to_commit().ok()?;
            let commit_id = commit.id().to_string();
            let commit_message = commit.message().unwrap_or("").to_string();
            Some(Branch { name, is_head, commit_id, commit_message })
        })
        .collect();

    Ok(result)
}
