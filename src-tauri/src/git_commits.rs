use git2::{BranchType, Repository, Sort};
use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
pub struct CommitInfo {
    pub id: String,
    pub author: String,
    pub message: String,
    pub time: i64,
    pub parents: Vec<String>,
    pub branches: Vec<String>,
}

#[tauri::command]
#[specta::specta]
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

    let commits = revwalk
        .filter_map(|oid| oid.ok())
        .filter_map(|oid| repo.find_commit(oid).ok())
        .map(|commit| CommitInfo {
            id: commit.id().to_string(),
            author: commit.author().name().unwrap_or("unknown").to_string(),
            message: commit.summary().unwrap_or("").to_string(),
            time: commit.time().seconds(),
            parents: (0..commit.parent_count())
                .map(|i| commit.parent_id(i).unwrap().to_string())
                .collect(),
            branches: vec![],
        })
        .collect();

    Ok(commits)
}

#[tauri::command]
#[specta::specta]
pub fn graph_log(path: String) -> Result<Vec<CommitInfo>, String> {
    let repo = Repository::open(&path).map_err(|e| e.to_string())?;

    // map each commit id -> branch names pointing to it
    let mut branch_map: std::collections::HashMap<String, Vec<String>> =
        std::collections::HashMap::new();
    let branches = repo.branches(None).map_err(|e| e.to_string())?;
    for branch in branches.filter_map(|b| b.ok()) {
        let (branch, _) = branch;
        if let (Some(name), Some(oid)) = (
            branch.name().ok().flatten(),
            branch.get().target(),
        ) {
            branch_map
                .entry(oid.to_string())
                .or_default()
                .push(name.to_string());
        }
    }

    let mut revwalk = repo.revwalk().map_err(|e| e.to_string())?;
    revwalk.set_sorting(Sort::TIME).map_err(|e| e.to_string())?;
    revwalk.push_glob("refs/heads/*").map_err(|e| e.to_string())?;

    let commits = revwalk
        .filter_map(|oid| oid.ok())
        .filter_map(|oid| repo.find_commit(oid).ok())
        .map(|commit| {
            let id = commit.id().to_string();
            let branches = branch_map.remove(&id).unwrap_or_default();
            CommitInfo {
                author: format!(
                    "{} <{}>",
                    commit.author().name().unwrap_or("unknown"),
                    commit.author().email().unwrap_or("")
                ),
                message: commit.summary().unwrap_or("").to_string(),
                time: commit.time().seconds(),
                parents: (0..commit.parent_count())
                    .map(|i| commit.parent_id(i).unwrap().to_string())
                    .collect(),
                branches,
                id,
            }
        })
        .collect();

    Ok(commits)
}