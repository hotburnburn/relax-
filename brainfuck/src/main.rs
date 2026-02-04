mod interpreter;
mod preprocess;

fn main() {
    let path = "hello.txt";
    let (code, bmap) = preprocess::preprocess(path).unwrap();

    let mut vm = interpreter::Interpreter::new(code, bmap);
    // println!("{vm:?}");

    while let Some(_) = vm.exec() {}
    println!();
}
