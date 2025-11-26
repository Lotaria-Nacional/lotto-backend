interface ILogger {
  log(content: string): string;
}

class A implements ILogger {
  log(content: string): string {
    console.log(content);
    return 'A';
  }
}

class B implements ILogger {
  constructor(private readonly inner: ILogger, private readonly content: string) {}

  log(content: string): string {
    this.inner.log(content);
    return 'B ' + this.content;
  }
}

class C implements ILogger {
  constructor(private readonly inner: ILogger, private readonly content: string) {}

  log(content: string): string {
    this.inner.log(content);
    return 'C' + this.content;
  }
}

let instance: ILogger = new A();
instance = new B(instance, 'paulo');
instance = new C(instance, 'jorge');

console.log(instance.log('teste'));
