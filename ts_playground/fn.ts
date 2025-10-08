// TS官方内置的方法
type Parameters<T> = T extends (...args: infer P) => void ? P : never;
type ParametersTest = Parameters<(a: number, b: string) => void>; // [a: number, b: string]

type ReturnType<T> = T extends (...args: any) => infer R ? R : never;
type ReturnTypeTest = ReturnType<(a: string, b: string) => number>; // number

type ConstructorParameters<T> = T extends new (...args: infer P) => any
  ? P
  : never;
type ConstructorParametersTest = ConstructorParameters<typeof Promise>;

export {};
