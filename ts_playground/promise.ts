function isPromise(value: any): value is PromiseLike<any> {
    return value && typeof value.then === 'function'
}

// 实现Promise.all
function all<T>(promises: (Promise<T> | T)[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            resolve([])
            return
        }

        const results: T[] = []
        let count = 0

        for (let i = 0; i < promises.length; i++) {
            const promise = promises[i]
            if (!isPromise(promise)) {
                results[i] = promise as T
                count++
                if (count === promises.length) {
                    resolve(results)
                }
            } else {
                (promise as Promise<T>).then((res) => {
                    results[i] = res
                    count++
                    if (count === promises.length) {
                        resolve(results)
                    }
                }).catch((err) => {
                    reject(err)
                })
            }
        }
    })
}

// 实现Promise.race
function race<T>(promises: (Promise<T> | T)[]): Promise<T> {
    return new Promise((resolve, reject) => {
        for (const promise of promises) {
            if (!isPromise(promise)) {
                resolve(promise as T)
                return
            } else {
                (promise as Promise<T>).then((res) => {
                    resolve(res)
                }).catch((err) => {
                    reject(err)
                })
            }
        }
    })
}

// 实现Promise.allSettled
function allSettled<T>(promises: (Promise<T> | T)[]): Promise<({ status: 'fulfilled', value: T } | { status: 'rejected', reason: any })[]> {
    return new Promise((resolve) => {
        const results: ({ status: 'fulfilled', value: T } | { status: 'rejected', reason: any })[] = []
        let count = 0

        if (promises.length === 0) {
            resolve([])
            return
        }

        for (let i = 0; i < promises.length; i++) {
            const promise = promises[i]
            if (!isPromise(promise)) {
                results[i] = {
                    status: 'fulfilled',
                    value: promise as T
                }
                count++
                if (count === promises.length) {
                    resolve(results)
                }
            } else {
                (promise as Promise<T>).then((res) => {
                    results[i] = {
                        status: 'fulfilled',
                        value: res
                    }
                    count++
                    if (count === promises.length) {
                        resolve(results)
                    }
                }).catch((err) => {
                    results[i] = {
                        status: 'rejected',
                        reason: err
                    }
                    count++
                    if (count === promises.length) {
                        resolve(results)
                    }
                })
            }
        }
    })
}

// 实现Promise.any
function any<T>(promises: (Promise<T> | T)[]): Promise<T> {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            reject(new Error('All promises were rejected'))
            return
        }

        let rejectedCount = 0
        const errors: any[] = []

        for (let i = 0; i < promises.length; i++) {
            const promise = promises[i]
            if (!isPromise(promise)) {
                resolve(promise as T)
                return
            } else {
                (promise as Promise<T>).then((res) => {
                    resolve(res)
                }).catch((err) => {
                    errors[i] = err
                    rejectedCount++
                    if (rejectedCount === promises.length) {
                        reject(new Error('All promises were rejected'))
                    }
                })
            }
        }
    })
}

// 实现withResolver
function withResolver<T>(): { resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, promise: Promise<T> } {
    let resolve: (value: T | PromiseLike<T>) => void
    let reject: (reason?: any) => void
    const p = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { resolve: resolve!, reject: reject!, promise: p }
}

// 实现Promise.withResolvers
function withResolvers<T>(): { resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, promise: Promise<T> } {
    const { resolve, reject, promise } = withResolver<T>()
    return { resolve, reject, promise }
}


// 实现Promise A+规范
class MyPromise<T = any> {
    private state: 'pending' | 'fulfilled' | 'rejected' = 'pending'
    private value: T | undefined
    private reason: any
    private onFulfilledCallbacks: Array<(value: T) => void> = []
    private onRejectedCallbacks: Array<(reason: any) => void> = []
    static deferred: () => any
    static defer: () => any

    constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        const resolve = (value: T | PromiseLike<T>) => {
            if (this.state !== 'pending') {
                return
            }

            if (value && typeof (value as any).then === 'function') {
                // 如果value是thenable对象，需要等待其resolve
                (value as PromiseLike<T>).then(resolve, reject)
                return
            }
            this.state = 'fulfilled'
            this.value = value as T
            this.onFulfilledCallbacks.forEach(callback => callback(this.value!))
            this.onFulfilledCallbacks = []
            this.onRejectedCallbacks = []
        }

        const reject = (reason?: any) => {
            if (this.state !== 'pending') {
                return
            }

            this.state = 'rejected'
            this.reason = reason
            this.onRejectedCallbacks.forEach(callback => callback(this.reason))

        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): MyPromise<TResult1 | TResult2> {
        return new MyPromise<TResult1 | TResult2>((resolve, reject) => {
            const handleFulfilled = (value: T) => {
                try {
                    if (typeof onFulfilled === 'function') {
                        const result = onFulfilled(value)
                        resolve(result)
                    } else {
                        resolve(value as any)
                    }
                } catch (error) {
                    reject(error)
                }
            }

            const handleRejected = (reason: any) => {
                try {
                    if (typeof onRejected === 'function') {
                        const result = onRejected(reason)
                        resolve(result)
                    } else {
                        reject(reason)
                    }
                } catch (error) {
                    reject(error)
                }
            }

            if (this.state === 'fulfilled') {
                setTimeout(() => handleFulfilled(this.value!), 0)
            } else if (this.state === 'rejected') {
                setTimeout(() => handleRejected(this.reason), 0)
            } else {
                this.onFulfilledCallbacks.push(handleFulfilled)
                this.onRejectedCallbacks.push(handleRejected)
            }
        })
    }

    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): MyPromise<T | TResult> {
        return this.then(null, onRejected)
    }

    finally(onFinally?: (() => void) | null): MyPromise<T> {
        return this.then(
            value => {
                if (onFinally) onFinally()
                return value
            },
            reason => {
                if (onFinally) onFinally()
                throw reason
            }
        )
    }

    // 静态方法
    static resolve<T>(value: T | PromiseLike<T>): MyPromise<T> {
        return new MyPromise<T>(resolve => resolve(value))
    }

    static reject<T = never>(reason?: any): MyPromise<T> {
        return new MyPromise<T>((_, reject) => reject(reason))
    }

    static all<T>(promises: Array<T | PromiseLike<T>>): MyPromise<T[]> {
        return new MyPromise<T[]>((resolve, reject) => {
            if (promises.length === 0) {
                resolve([])
                return
            }

            const results: T[] = []
            let completedCount = 0

            promises.forEach((promise, index) => {
                MyPromise.resolve(promise).then(
                    value => {
                        results[index] = value
                        completedCount++
                        if (completedCount === promises.length) {
                            resolve(results)
                        }
                    },
                    reject
                )
            })
        })
    }

    static race<T>(promises: Array<T | PromiseLike<T>>): MyPromise<T> {
        return new MyPromise<T>((resolve, reject) => {
            promises.forEach(promise => {
                MyPromise.resolve(promise).then(resolve, reject)
            })
        })
    }
}


// 使用示例
const testPromise = () => {
    console.log('=== 测试 MyPromise ===');

    // 测试基本功能
    const p1 = new MyPromise<number>((resolve, reject) => {
        setTimeout(() => {
            resolve(42);
        }, 1000);
    });

    p1.then(value => {
        console.log('Promise resolved with:', value);
        return value * 2;
    }).then(value => {
        console.log('Chained then:', value);
    }).catch(error => {
        console.log('Error:', error);
    });

    // 测试静态方法
    MyPromise.resolve('Hello World')
        .then(value => console.log('Static resolve:', value));

    MyPromise.reject('Error occurred')
        .catch(error => console.log('Static reject:', error));

    // 测试 Promise.all
    MyPromise.all([
        MyPromise.resolve(1),
        MyPromise.resolve(2),
        MyPromise.resolve(3)
    ]).then(values => {
        console.log('Promise.all result:', values);
    });

    // 测试 Promise.race
    MyPromise.race([
        new MyPromise(resolve => setTimeout(() => resolve('fast'), 100)),
        new MyPromise(resolve => setTimeout(() => resolve('slow'), 200))
    ]).then(value => {
        console.log('Promise.race result:', value);
    });
};

// 取消注释下面这行来运行测试
// testPromise();

MyPromise.defer = MyPromise.deferred = function () {
    let dfd = {} as any
    dfd.promise = new MyPromise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}

export default MyPromise