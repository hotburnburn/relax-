use crate::instruction::Instruction;
use std::collections::HashMap;

#[derive(Debug)]
pub struct Interpreter {
    code: Vec<Instruction>,
    ip: usize,
    mem: Vec<u8>,
    dp: usize,
    bmap: HashMap<usize, usize>,
}

impl Interpreter {
    pub fn new(code: Vec<Instruction>, bmap: HashMap<usize, usize>) -> Self {
        Self {
            code,
            ip: 0,
            mem: vec![0; 100],
            dp: 0,
            bmap,
        }
    }

    pub fn exec(&mut self) -> Option<()> {
        let cur_ins = self.code.get(self.ip)?;
        // println!("at {}, ins: {:?}", self.ip, cur_ins);

        match cur_ins {
            Instruction::Add(n) => self.mem[self.dp] = self.mem[self.dp].wrapping_add(*n),
            Instruction::Sub(n) => self.mem[self.dp] = self.mem[self.dp].wrapping_sub(*n),
            Instruction::In => (),
            Instruction::Out => print!("{}", self.mem[self.dp] as char),
            Instruction::Left(n) => {
                if self.dp == 0 {
                    // todo maybe
                    return None;
                }
                self.dp -= *n;
            }
            Instruction::Right(n) => {
                self.dp += *n;
                if self.dp >= self.mem.len() {
                    // todo maybe
                    self.mem.push(0);
                }
            }
            Instruction::Break => {
                if self.mem[self.dp] == 0 {
                    self.ip = self.bmap[&self.ip];
                }
            }
            Instruction::Go => {
                if self.mem[self.dp] != 0 {
                    self.ip = self.bmap[&self.ip];
                    return Some(());
                }
            }
        }
        self.ip += 1;

        Some(())
    }
}
