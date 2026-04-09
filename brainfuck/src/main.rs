mod instruction;
mod interpreter;
mod scan;

fn main() {
    let path = "hello.txt";
    let (code, bmap) = scan::scan(path).unwrap();

    let mut vm = interpreter::Interpreter::new(code, bmap);
    // println!("{vm:?}");

    while vm.exec().is_some() {}
    println!();
}
