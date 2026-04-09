#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Instruction {
    Add(u8),
    Sub(u8),
    Left(usize),
    Right(usize),
    Go,    // ]
    Break, // [
    In,
    Out,
}
