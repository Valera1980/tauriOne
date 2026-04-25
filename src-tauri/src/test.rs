#[tauri::command]
#[specta::specta]
pub fn test(text: String) -> String {
    println!("Hello from Rust! You said: {}", text);

    let arr1 = vec!["Hello".to_string(), "from".to_string()];
    let arr2 = vec!["Hello".to_string(), "from".to_string(), "Rust".to_string()];
    let longest_array = get_longest_array(&arr1, &arr2);
    print_array(&longest_array);
    format!("Hello from Rust! You said: {}", text)
}

fn print_array(arr: &Vec<String>) {
    for item in arr {
        println!("Array item: {}", item);
    }
}

fn get_longest_array<'a>(arr1: &'a Vec<String>, arr2: &'a Vec<String>) -> &'a Vec<String> {
    if arr1.len() > arr2.len() {
        arr1
    } else {
        arr2
    }
}
