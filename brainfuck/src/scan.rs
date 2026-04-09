use crate::instruction::Instruction;
use std::collections::HashMap;

fn parse_ins(code: Vec<u8>) -> Vec<Instruction> {
    let mut rec = Vec::new();
    for x in code {
        match x {
            b'+' => {
                if let Some(Instruction::Add(n)) = rec.last_mut() {
                    *n += 1;
                } else {
                    rec.push(Instruction::Add(1))
                }
            }
            b'-' => {
                if let Some(Instruction::Sub(n)) = rec.last_mut() {
                    *n += 1;
                } else {
                    rec.push(Instruction::Sub(1))
                }
            }
            b'<' => {
                if let Some(Instruction::Left(n)) = rec.last_mut() {
                    *n += 1;
                } else {
                    rec.push(Instruction::Left(1))
                }
            }
            b'>' => {
                if let Some(Instruction::Right(n)) = rec.last_mut() {
                    *n += 1;
                } else {
                    rec.push(Instruction::Right(1))
                }
            }
            b',' => rec.push(Instruction::In),
            b'.' => rec.push(Instruction::Out),
            b'[' => rec.push(Instruction::Break),
            b']' => rec.push(Instruction::Go),
            _ => unreachable!(),
        }
    }

    rec
}

#[allow(dead_code)]
pub fn scan(path: &str) -> Result<(Vec<Instruction>, HashMap<usize, usize>), String> {
    let code = std::fs::read(path).map_err(|e| e.to_string())?;
    let code: Vec<u8> = code
        .into_iter()
        .filter(|b| matches!(b, b'+' | b'-' | b'>' | b'<' | b'.' | b',' | b'[' | b']'))
        .collect();

    let code = parse_ins(code);

    let mut b = HashMap::new();
    let mut stk = Vec::new();
    for (idx, x) in code.iter().enumerate() {
        if *x == Instruction::Break {
            stk.push(idx);
        } else if *x == Instruction::Go {
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
