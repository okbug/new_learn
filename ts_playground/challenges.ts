type Push<T extends any[], U> = [...T, U];
type PushTest = Push<[1, 2, 3, 4, 5], 6>;
type Pop<T extends any[]> = T extends [...infer L, infer R] ? L : never;
type PopTest = Pop<[1, 2, 3, 4, 5]>;

type Shift<T extends any[]> = T extends [infer L, ...infer R] ? L : never;
type ShiftTest = Shift<[1, 2, 3, 4, 5]>;

// 递归反转数组
type ReverseTuple<T extends any[], F extends any[] = []> = T extends [
  ...infer L,
  infer R
]
  ? [...ReverseTuple<L, [...F, R]>]
  : F;
type ReverseTupleTest = ReverseTuple<[1, 2, 3, 4, 5]>;

type Flat<T extends any[]> = T extends [infer L, ...infer R]
  ? [...(L extends any[] ? Flat<L> : [L]), ...Flat<R>]
  : T;

type FlatTest = Flat<[1, 2, [3, 4], [[[[5]]], [6]]]>;

type Repeat<A, N extends number, E extends any[] = []> = N extends E["length"]
  ? E
  : [...Repeat<A, N, [...E, A]>];

type RepeatTest = Repeat<1, 5>;
type RepeatTest2 = Repeat<"a", 3>;

type Filter<T extends any[], U, E extends any[] = []> = T extends [
  infer L,
  ...infer R
]
  ? [...E, ...(L extends U ? [L] : []), ...Filter<R, U, E>]
  : [];

type FilterTest = Filter<[1, 2, "3", "4", 5, any], number>;
// 如果 L 是 any 的话 会走三元的两边(分发) type FilterTest = [1, 2, 5] | [1, 2, 5, any]
//  ==== L extends U ? [L] : []  ===== 改写成 ==== [L] extends [U] ? [L] : []  ====
// 来判断是否非any 类型
//  L & {} extends U  不可以 因为L=any的时候 any & {} 还是等于any

type IsEqual<T, K, S, F> = [T] extends [K]
  ? [K] extends [T]
    ? keyof T extends keyof K
      ? keyof K extends keyof T
        ? S
        : F
      : F
    : F
  : F;

type FindIndex<T extends any[], U, E extends any[] = []> = T extends [
  infer L,
  ...infer R
]
  ? IsEqual<L, U, E["length"], FindIndex<R, U, [...E, 1]>>
  : never;

type FindIndexTest = FindIndex<[1, 2, "3", "4", any, 5], 5>; // 5
// isEqual考虑到了any的场景，如果这里不考虑any  结果会变成4 因为 4 extends any

// type test = 4 extends any ? true : false; // true
// type test = any extends 4 ? true : false; // boolean 因为any会走三元的两边（分发）

type TupleToEnum<T extends any[], I = false> = {
  readonly [K in T[number]]: IsEqual<I, true, FindIndex<T, K>, K>;
};

type TupleToEnumTest = TupleToEnum<["hello", "world"]>;
type TupleToEnumsTest2 = TupleToEnum<["hello", "world"], true>;

/*
function slice(t, s, e, sa, ea, result) {
const [L, ...R] = t
if (sa["length"] === s) {
  // 如果start和end都到了 就返回result
  if (ea["length"] === e) {
    return result
  } else {
    // 如果start到了但是end不到，end 数组push个null，并且slice result 递归调用
    return slice(r, s, e, sa, [...ea, null], [...result, l])
  }
} else {
  // 如果start还不到，就继续传入R
  return slice(R, s, e, [...sa, null], ea, result)
}
}
*/
type Slice<
  T extends any[],
  S extends number,
  E extends number = T["length"],
  SA extends any[] = [],
  EA extends any[] = [],
  Result extends any[] = []
> = T extends [infer L, ...infer R]
  ? SA["length"] extends S
    ? EA["length"] extends E
      ? [...Result, L] // sa.length === s && ea.length === e
      : Slice<R, S, E, SA, [...EA, null], [...Result, L]> // sa.length === s && ea.length !== e sa.length 不动,ea.length + 1, result.push(L)
    : Slice<R, S, E, [...SA, null], [...EA, null], Result> // sa.length !== s  sa和ea都push个null, result不动
  : Result;

type SliceTest = Slice<[1, 2, 3, 4, 5], 0, 2>; // [1, 2, 3]
type SliceTest2 = Slice<[1, 2, 3, 4, 5], 2, 4>; // [3, 4, 5]

type GetOptions<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? never : K]: T[K];
};

type GetOptionsTest = GetOptions<{
  a: string;
  b?: number;
  c?: boolean;
}>;

type Arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Item = Arr[number];

type GenerateNumber<
  T extends number,
  R extends number[] = []
> = T extends R["length"] ? R : GenerateNumber<T, [...R, R["length"]]>;

type GenerateNumberTest = GenerateNumber<10>; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
type GenerateNumberTest2 = GenerateNumber<10>[number]; // 0 | 5 | 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9
