
type Func<Args extends any[], Ret> = (...args: Args) => Ret;
type Hash<U extends string, V extends Func<any, any>> = { [k in U]: V};

type Extend<U extends Hash<any, any>, V> = { [k in keyof U]: U[k] extends Func<infer Args, infer Ret> ? (...args: Args) => Extend<Ret & V, V> : U[k] };

const extFn = <T, U>(t: T, u: U): Extend<T & U, U> => { return '' as any; }


const c = extFn({}, { foo: () => {} })
const d2 = extFn(c, { bar: () => c });

d2.foo().foo().bar().foo().foo().bar();


