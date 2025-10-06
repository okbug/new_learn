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
