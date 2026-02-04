use std::collections::HashMap;

#[allow(dead_code)]
pub fn preprocess(path: &str) -> Result<(Vec<u8>, HashMap<usize, usize>), String> {
    let code = std::fs::read(path).map_err(|e| e.to_string())?;
    let code: Vec<u8> = code
        .into_iter()
        .filter(|b| matches!(b, 43..=46 | 60 | 62 | 91 | 93))
        .collect();

    let mut b = HashMap::new();
    let mut stk = Vec::new();
    for (idx, x) in code.iter().enumerate() {
        if *x == 91 {
            stk.push(idx);
        } else if *x == 93 {
            if stk.is_empty() {
                return Err("too much ]".to_string());
            }

            let pop = stk.pop().unwrap();
            b.insert(pop, idx);
            b.insert(idx, pop);
        }
    }

    if !stk.is_empty() {
        Err("too much [".to_string())
    } else {
        Ok((code, b))
    }
}
