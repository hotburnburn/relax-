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
    pub fn new(code: Vec<u8>, bmap: HashMap<usize, usize>) -> Self {
        let code = code.into_iter().map(Instruction::parse).collect();

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
            Instruction::Add => self.mem[self.dp] = self.mem[self.dp].wrapping_add(1),
            Instruction::Sub => self.mem[self.dp] = self.mem[self.dp].wrapping_sub(1),
            Instruction::In => (),
            Instruction::Out => print!("{}", self.mem[self.dp] as char),
            Instruction::Left => {
                if self.dp == 0 {
                    return None;
                }
                self.dp -= 1;
            }
            Instruction::Right => {
                self.dp += 1;
                if self.dp >= self.mem.len() {
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

#[derive(Clone, Copy, Debug)]
enum Instruction {
    Add,
    Sub,
    Left,
    Right,
    Go,
    Break,
    In,
    Out,
}

impl Instruction {
    fn parse(x: u8) -> Self {
        match x {
            b'+' => Self::Add,
            b',' => Self::In,
            b'-' => Self::Sub,
            b'.' => Self::Out,
            b'<' => Self::Left,
            b'>' => Self::Right,
            b'[' => Self::Break,
            b']' => Self::Go,
            _ => unreachable!(),
        }
    }
}
