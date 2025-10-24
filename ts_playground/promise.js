"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPromise(value) {
    return value && typeof value.then === 'function';
}
// 实现Promise.all
function all(promises) {
    return new Promise(function (resolve, reject) {
        if (promises.length === 0) {
            resolve([]);
            return;
        }
        var results = [];
        var count = 0;
        var _loop_1 = function (i) {
            var promise = promises[i];
            if (!isPromise(promise)) {
                results[i] = promise;
                count++;
                if (count === promises.length) {
                    resolve(results);
                }
            }
            else {
                promise.then(function (res) {
                    results[i] = res;
                    count++;
                    if (count === promises.length) {
                        resolve(results);
                    }
                }).catch(function (err) {
                    reject(err);
                });
            }
        };
        for (var i = 0; i < promises.length; i++) {
            _loop_1(i);
        }
    });
}
// 实现Promise.race
function race(promises) {
    return new Promise(function (resolve, reject) {
        for (var _i = 0, promises_1 = promises; _i < promises_1.length; _i++) {
            var promise = promises_1[_i];
            if (!isPromise(promise)) {
                resolve(promise);
                return;
            }
            else {
                promise.then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            }
        }
    });
}
// 实现Promise.allSettled
function allSettled(promises) {
    return new Promise(function (resolve) {
        var results = [];
        var count = 0;
        if (promises.length === 0) {
            resolve([]);
            return;
        }
        var _loop_2 = function (i) {
            var promise = promises[i];
            if (!isPromise(promise)) {
                results[i] = {
                    status: 'fulfilled',
                    value: promise
                };
                count++;
                if (count === promises.length) {
                    resolve(results);
                }
            }
            else {
                promise.then(function (res) {
                    results[i] = {
                        status: 'fulfilled',
                        value: res
                    };
                    count++;
                    if (count === promises.length) {
                        resolve(results);
                    }
                }).catch(function (err) {
                    results[i] = {
                        status: 'rejected',
                        reason: err
                    };
                    count++;
                    if (count === promises.length) {
                        resolve(results);
                    }
                });
            }
        };
        for (var i = 0; i < promises.length; i++) {
            _loop_2(i);
        }
    });
}
// 实现Promise.any
function any(promises) {
    return new Promise(function (resolve, reject) {
        if (promises.length === 0) {
            reject(new Error('All promises were rejected'));
            return;
        }
        var rejectedCount = 0;
        var errors = [];
        var _loop_3 = function (i) {
            var promise = promises[i];
            if (!isPromise(promise)) {
                resolve(promise);
                return { value: void 0 };
            }
            else {
                promise.then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    errors[i] = err;
                    rejectedCount++;
                    if (rejectedCount === promises.length) {
                        reject(new Error('All promises were rejected'));
                    }
                });
            }
        };
        for (var i = 0; i < promises.length; i++) {
            var state_1 = _loop_3(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    });
}
// 实现withResolver
function withResolver() {
    var resolve;
    var reject;
    var p = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    return { resolve: resolve, reject: reject, promise: p };
}
// 实现Promise.withResolvers
function withResolvers() {
    var _a = withResolver(), resolve = _a.resolve, reject = _a.reject, promise = _a.promise;
    return { resolve: resolve, reject: reject, promise: promise };
}
// 实现Promise A+规范
var MyPromise = /** @class */ (function () {
    function MyPromise(executor) {
        var _this = this;
        this.state = 'pending';
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        var resolve = function (value) {
            if (_this.state !== 'pending') {
                return;
            }
            if (value && typeof value.then === 'function') {
                // 如果value是thenable对象，需要等待其resolve
                value.then(resolve, reject);
                return;
            }
            _this.state = 'fulfilled';
            _this.value = value;
            _this.onFulfilledCallbacks.forEach(function (callback) { return callback(_this.value); });
            _this.onFulfilledCallbacks = [];
            _this.onRejectedCallbacks = [];
        };
        var reject = function (reason) {
            if (_this.state !== 'pending') {
                return;
            }
            _this.state = 'rejected';
            _this.reason = reason;
            _this.onRejectedCallbacks.forEach(function (callback) { return callback(_this.reason); });
        };
        try {
            executor(resolve, reject);
        }
        catch (error) {
            reject(error);
        }
    }
    MyPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        return new MyPromise(function (resolve, reject) {
            var handleFulfilled = function (value) {
                try {
                    if (typeof onFulfilled === 'function') {
                        var result = onFulfilled(value);
                        resolve(result);
                    }
                    else {
                        resolve(value);
                    }
                }
                catch (error) {
                    reject(error);
                }
            };
            var handleRejected = function (reason) {
                try {
                    if (typeof onRejected === 'function') {
                        var result = onRejected(reason);
                        resolve(result);
                    }
                    else {
                        reject(reason);
                    }
                }
                catch (error) {
                    reject(error);
                }
            };
            if (_this.state === 'fulfilled') {
                setTimeout(function () { return handleFulfilled(_this.value); }, 0);
            }
            else if (_this.state === 'rejected') {
                setTimeout(function () { return handleRejected(_this.reason); }, 0);
            }
            else {
                _this.onFulfilledCallbacks.push(handleFulfilled);
                _this.onRejectedCallbacks.push(handleRejected);
            }
        });
    };
    MyPromise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };
    MyPromise.prototype.finally = function (onFinally) {
        return this.then(function (value) {
            if (onFinally)
                onFinally();
            return value;
        }, function (reason) {
            if (onFinally)
                onFinally();
            throw reason;
        });
    };
    // 静态方法
    MyPromise.resolve = function (value) {
        return new MyPromise(function (resolve) { return resolve(value); });
    };
    MyPromise.reject = function (reason) {
        return new MyPromise(function (_, reject) { return reject(reason); });
    };
    MyPromise.all = function (promises) {
        return new MyPromise(function (resolve, reject) {
            if (promises.length === 0) {
                resolve([]);
                return;
            }
            var results = [];
            var completedCount = 0;
            promises.forEach(function (promise, index) {
                MyPromise.resolve(promise).then(function (value) {
                    results[index] = value;
                    completedCount++;
                    if (completedCount === promises.length) {
                        resolve(results);
                    }
                }, reject);
            });
        });
    };
    MyPromise.race = function (promises) {
        return new MyPromise(function (resolve, reject) {
            promises.forEach(function (promise) {
                MyPromise.resolve(promise).then(resolve, reject);
            });
        });
    };
    return MyPromise;
}());
// 使用示例
var testPromise = function () {
    console.log('=== 测试 MyPromise ===');
    // 测试基本功能
    var p1 = new MyPromise(function (resolve, reject) {
        setTimeout(function () {
            resolve(42);
        }, 1000);
    });
    p1.then(function (value) {
        console.log('Promise resolved with:', value);
        return value * 2;
    }).then(function (value) {
        console.log('Chained then:', value);
    }).catch(function (error) {
        console.log('Error:', error);
    });
    // 测试静态方法
    MyPromise.resolve('Hello World')
        .then(function (value) { return console.log('Static resolve:', value); });
    MyPromise.reject('Error occurred')
        .catch(function (error) { return console.log('Static reject:', error); });
    // 测试 Promise.all
    MyPromise.all([
        MyPromise.resolve(1),
        MyPromise.resolve(2),
        MyPromise.resolve(3)
    ]).then(function (values) {
        console.log('Promise.all result:', values);
    });
    // 测试 Promise.race
    MyPromise.race([
        new MyPromise(function (resolve) { return setTimeout(function () { return resolve('fast'); }, 100); }),
        new MyPromise(function (resolve) { return setTimeout(function () { return resolve('slow'); }, 200); })
    ]).then(function (value) {
        console.log('Promise.race result:', value);
    });
};
// 取消注释下面这行来运行测试
// testPromise();
MyPromise.defer = MyPromise.deferred = function () {
    var dfd = {};
    dfd.promise = new MyPromise(function (resolve, reject) {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};
module.exports = MyPromise;
