use git2::{Repository, BranchType};
use serde::Serialize;

#[derive(Serialize)]
pub struct CommitInfo {
   id: String,
   hash: String,
   author: String,
   message: String,
   time: String
}

#[tauri::command]
pub fn commit_list(path: String, branch: String) -> Result<Vec<CommitInfo>, String> {
    let repo = Repository::open(&path).map_err(|e| e.to_string())?;

    let branch_ref = repo
        .find_branch(&branch, BranchType::Local)
        .map_err(|e| e.to_string())?;

    let start_oid = branch_ref
        .get()
        .target()
        .ok_or("branch has no commits")?;

    let mut revwalk = repo.revwalk().map_err(|e| e.to_string())?;
    revwalk.push(start_oid).map_err(|e| e.to_string())?;

    let mut commits = Vec::new();
    for oid in revwalk {
        let oid = oid.map_err(|e| e.to_string())?;
        let commit = repo.find_commit(oid).map_err(|e| e.to_string())?;
        let message = commit.summary().unwrap_or("no message").to_string();
        let author = commit.author().name().unwrap_or("unknown").to_string();
        let hash = commit.id().to_string();
        let time = commit.time().seconds().to_string();
        println!("commit: {}", message);
        commits.push(CommitInfo { id: hash.clone(), hash, author, message, time });
    }

    println!("total commits: {}", commits.len());
    Ok(commits)
}
