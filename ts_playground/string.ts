// infer的规则：
type A = "hello,world";
type FirstChar<T extends string> = T extends `${infer L}${infer _}` ? L : never;

type FirstCharTest = FirstChar<A>; // "h" R = ello,world
// 一个infer 可以匹配到字符串的第一个字符
// 两个infer 第二个为剩下的所有字符
// 所以firstchar好理解，但是lastChar需要递归
/*
function lastChar(s, res) {
    const [l, ...rest] = [...s];
    if (rest.length === 0) {
        return l
    }
    return lastChar(rest, l[0])
}
lastChar('hello') // "o"
*/
type LastChar<
  T extends string,
  Result extends string = never
> = T extends `${infer L}${infer R}` ? LastChar<R, L> : Result;

type LastCharTest = LastChar<A>; // "d"
type LastCharTest2 = LastChar<"test a">; // "a"
// 当T = '' 的时候 才满足 T extends `${infer L}${infer R}`
// 所以当T = '' 的时候 Result 就是最后一个字符

type test<T extends string> = T extends `${infer L}` ? L : 2;
type test2<T extends string> = T extends `${infer L}${infer R}` ? 1 : 2;
type res1 = test<"1">; // "1"
type res2 = test<"">; // 一个infer L 可以匹配到空字符串
type res3 = test2<"1">;
type res4 = test2<"">; // 不能匹配到空字符串

type StringToTuple<
  T extends string,
  Result extends any[] = []
> = T extends `${infer L}${infer R}`
  ? [...Result, L, ...StringToTuple<R>]
  : Result;

type StringToTupleTest = StringToTuple<"hello, world.nihao">;

type TupleToString<T extends any[], Result extends string = ""> = T extends [
  infer L,
  ...infer R
]
  ? TupleToString<R, `${Result}${L & string}`>
  : Result;

type TupleToStringTest = TupleToString<StringToTupleTest>; // "hello, world.nihao"

type RepeatString<
  T extends string,
  N extends number,
  Result extends string = "",
  NC extends any[] = []
> = T extends `${infer L}`
  ? NC["length"] extends N
    ? Result
    : RepeatString<T, N, `${Result}${L}`, [...NC, 1]>
  : Result;

type RepeatStringTest = RepeatString<"a", 3>; // "aaa"
type RepeatStringTest2 = RepeatString<"ab", 2>; // "abab"

type SplitString<
  T extends string,
  S extends string,
  Result extends any[] = []
> = T extends `${infer L}${S}${infer R}` // 这里不能infer S 不然是一个新的变量
  ? SplitString<R, S, [...Result, L]>
  : [...Result, T];

type SplitStringTest = SplitString<"www.nihao.test", ".">; // ["www", "nihao", "test"]

type RemoveFirstChar<
  T extends string,
  S extends string
> = T extends `${S}${infer R}` ? R : T;

type KebabCase<
  T extends string,
  Result extends string = ""
> = T extends `${infer L}${infer R}`
  ? Uppercase<L> extends L
    ? KebabCase<R, `${Result}-${Lowercase<L>}`>
    : KebabCase<R, `${Result}${L}`>
  : RemoveFirstChar<Result, "-">;

type KebabCaseTest = KebabCase<"HelloWorld">; // "hello-world"

type CamelCase<
  T extends string,
  Result extends string = ""
> = T extends `${infer L}-${infer R}`
  ? CamelCase<R, `${Result}${L}${Capitalize<R>}`>
  : Result;

type CamelCaseTest = CamelCase<"hello-world">; // "helloWorld"

type ObjectToPath<
  T extends object,
  U extends string = "",
  K = keyof T
> = K extends keyof T
  ? T[K] extends object
    ? RemoveFirstChar<ObjectToPath<T[K], `${U}.${K & string}`>, ".">
    : `${U}.${K & string}`
  : any;

type ObjectToPathTest = ObjectToPath<{
  a: {
    b: {
      c: number;
      d: string;
    };
  };
  a1: {
    b1: { a: 1 };
    c1: string;
  };
}>;

type Include<
  T extends string,
  U extends string
> = T extends `${infer _}${U}${infer __}` ? true : false;

// 如果T=U=空字符串 需要true 需要特殊判断，这里没有做处理
type IncludeTest = Include<"hello", "e">; // true

type TrimLeft<T extends string> = T extends ` ${infer L}` ? TrimLeft<L> : T;
type TrimLeftTest = TrimLeft<" hello ">; // "hello"
type TrimRight<T extends string> = T extends `${infer L} ` ? TrimRight<L> : T;
type TrimRightTest = TrimRight<" hello ">; // "hello"

type Trim<T extends string> = TrimLeft<TrimRight<T>>;
type TrimTest = Trim<" hello ">; // "hello"
