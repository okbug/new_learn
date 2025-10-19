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

// 更多内置工具类型示例
type Partial<T> = {
  [P in keyof T]?: T[P];
};
type PartialPerson = Partial<Person>; // { name?: string; age?: number; address?: string }

type Required<T> = {
  [P in keyof T]-?: T[P];
};
type RequiredPerson = Required<Person>; // { name: string; age: number; address: string }

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
type ReadonlyPerson = Readonly<Person>;

type Record<K extends keyof any, T> = {
  [P in K]: T;
};
type StringRecord = Record<"name" | "age", string>; // { name: string; age: string }

// 高级工具类型
type Awaited<T> = T extends Promise<infer U> ? U : T;
type AwaitedTest = Awaited<Promise<string>>; // string

type NonNullable<T> = T extends null | undefined ? never : T;
type NonNullableTest = NonNullable<string | null | undefined>; // string

// 自定义工具类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type GetReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : never;

type PromiseType<T> = T extends Promise<infer U> ? U : T;

// 函数重载示例
function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: any, b: any): any {
  return a + b;
}

const num = add(1, 2); // number
const str = add("hello", "world"); // string

// 泛型约束示例
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30 };
const personName = getProperty(person, "name"); // string
const personAge = getProperty(person, "age"); // number

// 条件类型示例
type IsString<T> = T extends string ? true : false;
type IsStringTest1 = IsString<string>; // true
type IsStringTest2 = IsString<number>; // false

// 映射类型示例
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; getAddress: () => string | undefined }

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">; // "onClick"
type HoverEvent = EventName<"hover">; // "onHover"

// 递归类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 联合类型转交叉类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>; // { a: string } & { b: number }

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
