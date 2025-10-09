// TS官方内置的方法
type Parameters<T> = T extends (...args: infer P) => void ? P : never;
type ParametersTest = Parameters<(a: number, b: string) => void>; // [a: number, b: string]

type ReturnType<T> = T extends (...args: any) => infer R ? R : never;
type ReturnTypeTest = ReturnType<(a: string, b: string) => number>; // number

type ConstructorParameters<T> = T extends new (...args: infer P) => any
  ? P
  : never;
type ConstructorParametersTest = ConstructorParameters<typeof Promise>;

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Person = { name: string; age: number; address?: string };
type PersonNameAge = MyPick<Person, "name" | "age">;

type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
type PersonName = MyOmit<Person, "age">;

export {};

class Animal {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}
export class Dog extends Animal {
  constructor(name: string) {
    super(name);
  }
  bark() {
    console.log(this.name + " and bark");
  }
}
