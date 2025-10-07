type Original = {
  readonly name?: string;
  readonly age?: number;
};

// 移除可选性
type Required<T> = {
  [K in keyof T]-?: T[K];
};

// 移除只读性
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// 移除可选性和只读性
type RequiredMutable<T> = {
  -readonly [K in keyof T]-?: T[K];
};

type Result1 = Required<Original>;
// { readonly name: string; readonly age: number; }

type Result2 = Mutable<Original>;
// { name?: string; age?: number; }

type Result3 = RequiredMutable<Original>;
// { name: string; age: number; }

// ========== 添加修饰符示例 ==========

type PlainType = {
  name: string;
  age: number;
  email: string;
};

// +? 示例：添加可选修饰符
type AddOptional<T> = {
  [K in keyof T]+?: T[K]; // +? 将所有属性变为可选
};

// +readonly 示例：添加只读修饰符
type AddReadonly<T> = {
  +readonly [K in keyof T]: T[K]; // +readonly 将所有属性变为只读
};

// 组合使用：同时添加可选和只读
type AddOptionalAndReadonly<T> = {
  +readonly [K in keyof T]+?: T[K]; // 同时添加两个修饰符
};

type OptionalResult = AddOptional<PlainType>;
// { name?: string; age?: number; email?: string; }

type ReadonlyResult = AddReadonly<PlainType>;
// { readonly name: string; readonly age: number; readonly email: string; }

type OptionalReadonlyResult = AddOptionalAndReadonly<PlainType>;
// { readonly name?: string; readonly age?: number; readonly email?: string; }

// ========== 对比：添加 vs 移除 ==========

type MixedType = {
  readonly id: string; // 只读必需
  name?: string; // 可选可变
  readonly age?: number; // 只读可选
  email: string; // 必需可变
};

// 全部变为可选
type AllOptional = AddOptional<MixedType>;
// { readonly id?: string; name?: string; readonly age?: number; email?: string; }

// 全部变为只读
type AllReadonly = AddReadonly<MixedType>;
// { readonly id: string; readonly name?: string; readonly age?: number; readonly email: string; }

// 全部变为必需
type AllRequired = Required<MixedType>;
// { readonly id: string; name: string; readonly age: number; email: string; }

// 全部变为可变
type AllMutable = Mutable<MixedType>;
// { id: string; name?: string; age?: number; email: string; }

export {};
