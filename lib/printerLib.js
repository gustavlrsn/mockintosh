var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.createTemplateTagFirstArg = function (a) {
  return (a.raw = a);
};
$jscomp.createTemplateTagFirstArgWithRaw = function (a, b) {
  a.raw = b;
  return a;
};
$jscomp.arrayIteratorImpl = function (a) {
  var b = 0;
  return function () {
    return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (a) {
  return { next: $jscomp.arrayIteratorImpl(a) };
};
$jscomp.makeIterator = function (a) {
  var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
  return b ? b.call(a) : $jscomp.arrayIterator(a);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, b, e) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = e.value;
        return a;
      };
$jscomp.getGlobal = function (a) {
  a = [
    "object" == typeof globalThis && globalThis,
    a,
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
  ];
  for (var b = 0; b < a.length; ++b) {
    var e = a[b];
    if (e && e.Math == Math) return e;
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.IS_SYMBOL_NATIVE =
  "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS =
  !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (a, b) {
  var e = $jscomp.propertyToPolyfillSymbol[b];
  if (null == e) return a[b];
  e = a[e];
  return void 0 !== e ? e : a[b];
};
$jscomp.polyfill = function (a, b, e, d) {
  b &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(a, b, e, d)
      : $jscomp.polyfillUnisolated(a, b, e, d));
};
$jscomp.polyfillUnisolated = function (a, b, e, d) {
  e = $jscomp.global;
  a = a.split(".");
  for (d = 0; d < a.length - 1; d++) {
    var c = a[d];
    if (!(c in e)) return;
    e = e[c];
  }
  a = a[a.length - 1];
  d = e[a];
  b = b(d);
  b != d &&
    null != b &&
    $jscomp.defineProperty(e, a, { configurable: !0, writable: !0, value: b });
};
$jscomp.polyfillIsolated = function (a, b, e, d) {
  var c = a.split(".");
  a = 1 === c.length;
  d = c[0];
  d = !a && d in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var h = 0; h < c.length - 1; h++) {
    var f = c[h];
    if (!(f in d)) return;
    d = d[f];
  }
  c = c[c.length - 1];
  e = $jscomp.IS_SYMBOL_NATIVE && "es6" === e ? d[c] : null;
  b = b(e);
  null != b &&
    (a
      ? $jscomp.defineProperty($jscomp.polyfills, c, {
          configurable: !0,
          writable: !0,
          value: b,
        })
      : b !== e &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[c] &&
          ((e = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[c] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(c)
            : $jscomp.POLYFILL_PREFIX + e + "$" + c)),
        $jscomp.defineProperty(d, $jscomp.propertyToPolyfillSymbol[c], {
          configurable: !0,
          writable: !0,
          value: b,
        })));
};
$jscomp.underscoreProtoCanBeSet = function () {
  var a = { a: !0 },
    b = {};
  try {
    return (b.__proto__ = a), b.a;
  } catch (e) {}
  return !1;
};
$jscomp.setPrototypeOf =
  $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.setPrototypeOf
    ? Object.setPrototypeOf
    : $jscomp.underscoreProtoCanBeSet()
    ? function (a, b) {
        a.__proto__ = b;
        if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
        return a;
      }
    : null;
$jscomp.generator = {};
$jscomp.generator.ensureIteratorResultIsObject_ = function (a) {
  if (!(a instanceof Object))
    throw new TypeError("Iterator result " + a + " is not an object");
};
$jscomp.generator.Context = function () {
  this.isRunning_ = !1;
  this.yieldAllIterator_ = null;
  this.yieldResult = void 0;
  this.nextAddress = 1;
  this.finallyAddress_ = this.catchAddress_ = 0;
  this.finallyContexts_ = this.abruptCompletion_ = null;
};
$jscomp.generator.Context.prototype.start_ = function () {
  if (this.isRunning_) throw new TypeError("Generator is already running");
  this.isRunning_ = !0;
};
$jscomp.generator.Context.prototype.stop_ = function () {
  this.isRunning_ = !1;
};
$jscomp.generator.Context.prototype.jumpToErrorHandler_ = function () {
  this.nextAddress = this.catchAddress_ || this.finallyAddress_;
};
$jscomp.generator.Context.prototype.next_ = function (a) {
  this.yieldResult = a;
};
$jscomp.generator.Context.prototype.throw_ = function (a) {
  this.abruptCompletion_ = { exception: a, isException: !0 };
  this.jumpToErrorHandler_();
};
$jscomp.generator.Context.prototype.return = function (a) {
  this.abruptCompletion_ = { return: a };
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function (a) {
  this.abruptCompletion_ = { jumpTo: a };
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.yield = function (a, b) {
  this.nextAddress = b;
  return { value: a };
};
$jscomp.generator.Context.prototype.yieldAll = function (a, b) {
  a = $jscomp.makeIterator(a);
  var e = a.next();
  $jscomp.generator.ensureIteratorResultIsObject_(e);
  if (e.done) (this.yieldResult = e.value), (this.nextAddress = b);
  else return (this.yieldAllIterator_ = a), this.yield(e.value, b);
};
$jscomp.generator.Context.prototype.jumpTo = function (a) {
  this.nextAddress = a;
};
$jscomp.generator.Context.prototype.jumpToEnd = function () {
  this.nextAddress = 0;
};
$jscomp.generator.Context.prototype.setCatchFinallyBlocks = function (a, b) {
  this.catchAddress_ = a;
  void 0 != b && (this.finallyAddress_ = b);
};
$jscomp.generator.Context.prototype.setFinallyBlock = function (a) {
  this.catchAddress_ = 0;
  this.finallyAddress_ = a || 0;
};
$jscomp.generator.Context.prototype.leaveTryBlock = function (a, b) {
  this.nextAddress = a;
  this.catchAddress_ = b || 0;
};
$jscomp.generator.Context.prototype.enterCatchBlock = function (a) {
  this.catchAddress_ = a || 0;
  a = this.abruptCompletion_.exception;
  this.abruptCompletion_ = null;
  return a;
};
$jscomp.generator.Context.prototype.enterFinallyBlock = function (a, b, e) {
  e
    ? (this.finallyContexts_[e] = this.abruptCompletion_)
    : (this.finallyContexts_ = [this.abruptCompletion_]);
  this.catchAddress_ = a || 0;
  this.finallyAddress_ = b || 0;
};
$jscomp.generator.Context.prototype.leaveFinallyBlock = function (a, b) {
  b = this.finallyContexts_.splice(b || 0)[0];
  if ((b = this.abruptCompletion_ = this.abruptCompletion_ || b)) {
    if (b.isException) return this.jumpToErrorHandler_();
    void 0 != b.jumpTo && this.finallyAddress_ < b.jumpTo
      ? ((this.nextAddress = b.jumpTo), (this.abruptCompletion_ = null))
      : (this.nextAddress = this.finallyAddress_);
  } else this.nextAddress = a;
};
$jscomp.generator.Context.prototype.forIn = function (a) {
  return new $jscomp.generator.Context.PropertyIterator(a);
};
$jscomp.generator.Context.PropertyIterator = function (a) {
  this.object_ = a;
  this.properties_ = [];
  for (var b in a) this.properties_.push(b);
  this.properties_.reverse();
};
$jscomp.generator.Context.PropertyIterator.prototype.getNext = function () {
  for (; 0 < this.properties_.length; ) {
    var a = this.properties_.pop();
    if (a in this.object_) return a;
  }
  return null;
};
$jscomp.generator.Engine_ = function (a) {
  this.context_ = new $jscomp.generator.Context();
  this.program_ = a;
};
$jscomp.generator.Engine_.prototype.next_ = function (a) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_)
    return this.yieldAllStep_(
      this.context_.yieldAllIterator_.next,
      a,
      this.context_.next_
    );
  this.context_.next_(a);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.return_ = function (a) {
  this.context_.start_();
  var b = this.context_.yieldAllIterator_;
  if (b)
    return this.yieldAllStep_(
      "return" in b
        ? b["return"]
        : function (e) {
            return { value: e, done: !0 };
          },
      a,
      this.context_.return
    );
  this.context_.return(a);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.throw_ = function (a) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_)
    return this.yieldAllStep_(
      this.context_.yieldAllIterator_["throw"],
      a,
      this.context_.next_
    );
  this.context_.throw_(a);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.yieldAllStep_ = function (a, b, e) {
  try {
    var d = a.call(this.context_.yieldAllIterator_, b);
    $jscomp.generator.ensureIteratorResultIsObject_(d);
    if (!d.done) return this.context_.stop_(), d;
    var c = d.value;
  } catch (h) {
    return (
      (this.context_.yieldAllIterator_ = null),
      this.context_.throw_(h),
      this.nextStep_()
    );
  }
  this.context_.yieldAllIterator_ = null;
  e.call(this.context_, c);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.nextStep_ = function () {
  for (; this.context_.nextAddress; )
    try {
      var a = this.program_(this.context_);
      if (a) return this.context_.stop_(), { value: a.value, done: !1 };
    } catch (b) {
      (this.context_.yieldResult = void 0), this.context_.throw_(b);
    }
  this.context_.stop_();
  if (this.context_.abruptCompletion_) {
    a = this.context_.abruptCompletion_;
    this.context_.abruptCompletion_ = null;
    if (a.isException) throw a.exception;
    return { value: a.return, done: !0 };
  }
  return { value: void 0, done: !0 };
};
$jscomp.generator.Generator_ = function (a) {
  this.next = function (b) {
    return a.next_(b);
  };
  this.throw = function (b) {
    return a.throw_(b);
  };
  this.return = function (b) {
    return a.return_(b);
  };
  this[Symbol.iterator] = function () {
    return this;
  };
};
$jscomp.generator.createGenerator = function (a, b) {
  b = new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(b));
  $jscomp.setPrototypeOf &&
    a.prototype &&
    $jscomp.setPrototypeOf(b, a.prototype);
  return b;
};
$jscomp.asyncExecutePromiseGenerator = function (a) {
  function b(d) {
    return a.next(d);
  }
  function e(d) {
    return a.throw(d);
  }
  return new Promise(function (d, c) {
    function h(f) {
      f.done ? d(f.value) : Promise.resolve(f.value).then(b, e).then(h, c);
    }
    h(a.next());
  });
};
$jscomp.asyncExecutePromiseGeneratorFunction = function (a) {
  return $jscomp.asyncExecutePromiseGenerator(a());
};
$jscomp.asyncExecutePromiseGeneratorProgram = function (a) {
  return $jscomp.asyncExecutePromiseGenerator(
    new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(a))
  );
};
$jscomp.initSymbol = function () {};
$jscomp.polyfill(
  "Symbol",
  function (a) {
    if (a) return a;
    var b = function (h, f) {
      this.$jscomp$symbol$id_ = h;
      $jscomp.defineProperty(this, "description", {
        configurable: !0,
        writable: !0,
        value: f,
      });
    };
    b.prototype.toString = function () {
      return this.$jscomp$symbol$id_;
    };
    var e = "jscomp_symbol_" + ((1e9 * Math.random()) >>> 0) + "_",
      d = 0,
      c = function (h) {
        if (this instanceof c)
          throw new TypeError("Symbol is not a constructor");
        return new b(e + (h || "") + "_" + d++, h);
      };
    return c;
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Symbol.iterator",
  function (a) {
    if (a) return a;
    a = Symbol("Symbol.iterator");
    for (
      var b =
          "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(
            " "
          ),
        e = 0;
      e < b.length;
      e++
    ) {
      var d = $jscomp.global[b[e]];
      "function" === typeof d &&
        "function" != typeof d.prototype[a] &&
        $jscomp.defineProperty(d.prototype, a, {
          configurable: !0,
          writable: !0,
          value: function () {
            return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
          },
        });
    }
    return a;
  },
  "es6",
  "es3"
);
$jscomp.iteratorPrototype = function (a) {
  a = { next: a };
  a[Symbol.iterator] = function () {
    return this;
  };
  return a;
};
$jscomp.polyfill(
  "Promise",
  function (a) {
    function b() {
      this.batch_ = null;
    }
    function e(f) {
      return f instanceof c
        ? f
        : new c(function (g, l) {
            g(f);
          });
    }
    if (
      a &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          "undefined" === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf("[native code]"))
    )
      return a;
    b.prototype.asyncExecute = function (f) {
      if (null == this.batch_) {
        this.batch_ = [];
        var g = this;
        this.asyncExecuteFunction(function () {
          g.executeBatch_();
        });
      }
      this.batch_.push(f);
    };
    var d = $jscomp.global.setTimeout;
    b.prototype.asyncExecuteFunction = function (f) {
      d(f, 0);
    };
    b.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var f = this.batch_;
        this.batch_ = [];
        for (var g = 0; g < f.length; ++g) {
          var l = f[g];
          f[g] = null;
          try {
            l();
          } catch (m) {
            this.asyncThrow_(m);
          }
        }
      }
      this.batch_ = null;
    };
    b.prototype.asyncThrow_ = function (f) {
      this.asyncExecuteFunction(function () {
        throw f;
      });
    };
    var c = function (f) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var g = this.createResolveAndReject_();
      try {
        f(g.resolve, g.reject);
      } catch (l) {
        g.reject(l);
      }
    };
    c.prototype.createResolveAndReject_ = function () {
      function f(m) {
        return function (n) {
          l || ((l = !0), m.call(g, n));
        };
      }
      var g = this,
        l = !1;
      return { resolve: f(this.resolveTo_), reject: f(this.reject_) };
    };
    c.prototype.resolveTo_ = function (f) {
      if (f === this)
        this.reject_(new TypeError("A Promise cannot resolve to itself"));
      else if (f instanceof c) this.settleSameAsPromise_(f);
      else {
        a: switch (typeof f) {
          case "object":
            var g = null != f;
            break a;
          case "function":
            g = !0;
            break a;
          default:
            g = !1;
        }
        g ? this.resolveToNonPromiseObj_(f) : this.fulfill_(f);
      }
    };
    c.prototype.resolveToNonPromiseObj_ = function (f) {
      var g = void 0;
      try {
        g = f.then;
      } catch (l) {
        this.reject_(l);
        return;
      }
      "function" == typeof g
        ? this.settleSameAsThenable_(g, f)
        : this.fulfill_(f);
    };
    c.prototype.reject_ = function (f) {
      this.settle_(2, f);
    };
    c.prototype.fulfill_ = function (f) {
      this.settle_(1, f);
    };
    c.prototype.settle_ = function (f, g) {
      if (0 != this.state_)
        throw Error(
          "Cannot settle(" +
            f +
            ", " +
            g +
            "): Promise already settled in state" +
            this.state_
        );
      this.state_ = f;
      this.result_ = g;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    c.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var f = this;
      d(function () {
        if (f.notifyUnhandledRejection_()) {
          var g = $jscomp.global.console;
          "undefined" !== typeof g && g.error(f.result_);
        }
      }, 1);
    };
    c.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var f = $jscomp.global.CustomEvent,
        g = $jscomp.global.Event,
        l = $jscomp.global.dispatchEvent;
      if ("undefined" === typeof l) return !0;
      "function" === typeof f
        ? (f = new f("unhandledrejection", { cancelable: !0 }))
        : "function" === typeof g
        ? (f = new g("unhandledrejection", { cancelable: !0 }))
        : ((f = $jscomp.global.document.createEvent("CustomEvent")),
          f.initCustomEvent("unhandledrejection", !1, !0, f));
      f.promise = this;
      f.reason = this.result_;
      return l(f);
    };
    c.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var f = 0; f < this.onSettledCallbacks_.length; ++f)
          h.asyncExecute(this.onSettledCallbacks_[f]);
        this.onSettledCallbacks_ = null;
      }
    };
    var h = new b();
    c.prototype.settleSameAsPromise_ = function (f) {
      var g = this.createResolveAndReject_();
      f.callWhenSettled_(g.resolve, g.reject);
    };
    c.prototype.settleSameAsThenable_ = function (f, g) {
      var l = this.createResolveAndReject_();
      try {
        f.call(g, l.resolve, l.reject);
      } catch (m) {
        l.reject(m);
      }
    };
    c.prototype.then = function (f, g) {
      function l(r, p) {
        return "function" == typeof r
          ? function (t) {
              try {
                m(r(t));
              } catch (u) {
                n(u);
              }
            }
          : p;
      }
      var m,
        n,
        q = new c(function (r, p) {
          m = r;
          n = p;
        });
      this.callWhenSettled_(l(f, m), l(g, n));
      return q;
    };
    c.prototype.catch = function (f) {
      return this.then(void 0, f);
    };
    c.prototype.callWhenSettled_ = function (f, g) {
      function l() {
        switch (m.state_) {
          case 1:
            f(m.result_);
            break;
          case 2:
            g(m.result_);
            break;
          default:
            throw Error("Unexpected state: " + m.state_);
        }
      }
      var m = this;
      null == this.onSettledCallbacks_
        ? h.asyncExecute(l)
        : this.onSettledCallbacks_.push(l);
      this.isRejectionHandled_ = !0;
    };
    c.resolve = e;
    c.reject = function (f) {
      return new c(function (g, l) {
        l(f);
      });
    };
    c.race = function (f) {
      return new c(function (g, l) {
        for (
          var m = $jscomp.makeIterator(f), n = m.next();
          !n.done;
          n = m.next()
        )
          e(n.value).callWhenSettled_(g, l);
      });
    };
    c.all = function (f) {
      var g = $jscomp.makeIterator(f),
        l = g.next();
      return l.done
        ? e([])
        : new c(function (m, n) {
            function q(t) {
              return function (u) {
                r[t] = u;
                p--;
                0 == p && m(r);
              };
            }
            var r = [],
              p = 0;
            do
              r.push(void 0),
                p++,
                e(l.value).callWhenSettled_(q(r.length - 1), n),
                (l = g.next());
            while (!l.done);
          });
    };
    return c;
  },
  "es6",
  "es3"
);
var UsbDevice = function () {
  this.usbDevice = null;
  this.endpointBulk = 1;
  this.endpointIn = 129;
};
UsbDevice.prototype.connectPrinter = function () {
  var a = this,
    b,
    e;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (d) {
    if (1 == d.nextAddress)
      return (
        (b = [
          { vendorId: 1155, productId: 22339 },
          { vendorId: 1208, productId: 3616 },
        ]),
        (e = a),
        d.yield(
          navigator.usb
            .requestDevice({ filters: b })
            .then(function (c) {
              console.log("Product name: " + c.productName);
              alert(multilang.get("connectSuccess"));
            })
            .catch(function (c) {
              console.log("There is no device. " + c);
            }),
          2
        )
      );
    if (3 != d.nextAddress)
      return (
        (e.usbDevice = d.yieldResult),
        d.yield(
          navigator.usb.getDevices().then(function (c) {
            0 < c.length
              ? ((a.usbDevice = c[0]),
                console.log("Product name: " + a.usbDevice.productName),
                a.usbDevice
                  .open()
                  .then(function () {
                    return a.usbDevice.selectConfiguration(1);
                  })
                  .then(function () {
                    return a.usbDevice.claimInterface(
                      a.usbDevice.configuration.interfaces[0].interfaceNumber
                    );
                  })
                  .catch(function (h) {
                    console.log(h);
                  })
                  .then(function () {
                    for (
                      var h = $jscomp.makeIterator(
                          a.usbDevice.configuration.interfaces[0].alternates[0]
                            .endpoints
                        ),
                        f = h.next();
                      !f.done;
                      f = h.next()
                    )
                      switch (((f = f.value), f.direction)) {
                        case "out":
                          a.endpointBulk = f.endpointNumber;
                          break;
                        case "in":
                          a.endpointIn = f.endpointNumber;
                      }
                  }))
              : (alert(multilang.get("connectFirst")),
                window.open("index.html", "_blank").focus());
          }),
          3
        )
      );
    navigator.usb.addEventListener("connect", function (c) {
      console.log("usb printer connect");
    });
    navigator.usb.addEventListener("disconnect", function (c) {
      console.log("usb printer disconnect");
    });
    d.jumpToEnd();
  });
};
UsbDevice.prototype.connectPrinterReq = function () {
  var a = this,
    b,
    e;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (d) {
    if (1 == d.nextAddress)
      return (
        (b = [
          { vendorId: 1155, productId: 22339 },
          { vendorId: 1208, productId: 3616 },
        ]),
        (e = a),
        d.yield(
          navigator.usb
            .requestDevice({ filters: b })
            .then(function (c) {
              console.log("Product name: " + c.productName);
              alert(multilang.get("connectSuccess"));
            })
            .catch(function (c) {
              console.log("There is no device. " + c);
            }),
          2
        )
      );
    if (3 != d.nextAddress)
      return (
        (e.usbDevice = d.yieldResult),
        d.yield(
          navigator.usb.getDevices().then(function (c) {
            a.usbDevice = c[0];
          }),
          3
        )
      );
    navigator.usb.addEventListener("connect", function (c) {});
    navigator.usb.addEventListener("disconnect", function (c) {});
    d.jumpToEnd();
  });
};
UsbDevice.prototype.sendBytes = function (a) {
  var b = this;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (e) {
    null != b.usbDevice &&
      (b.usbDevice.opened
        ? b.usbDevice.transferOut(b.endpointBulk, a).catch(function (d) {
            console.log(d);
          })
        : b.usbDevice
            .open()
            .then(function () {
              return b.usbDevice.selectConfiguration(1);
            })
            .then(function () {
              return b.usbDevice.claimInterface(
                b.usbDevice.configuration.interfaces[0].interfaceNumber
              );
            })
            .then(function () {
              for (
                var d = $jscomp.makeIterator(
                    b.usbDevice.configuration.interfaces[0].alternates[0]
                      .endpoints
                  ),
                  c = d.next();
                !c.done;
                c = d.next()
              )
                switch (((c = c.value), c.direction)) {
                  case "out":
                    b.endpointBulk = c.endpointNumber;
                    break;
                  case "in":
                    b.endpointIn = c.endpointNumber;
                }
            })
            .then(function () {
              return b.usbDevice.transferOut(b.endpointBulk, a);
            })
            .catch(function (d) {
              console.log(d);
              window.localStorage.setItem(printResult, printFailed);
              -1 !== d.toString().indexOf("The device was disconnected") &&
                alert(multilang.get("connectFirst"));
            }));
    e.jumpToEnd();
  });
};
UsbDevice.prototype.sendString = function (a) {
  var b = this;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (e) {
    b.usbDevice.opened && b.usbDevice.transferOut(b.endpointBulk, str2ab(a));
    e.jumpToEnd();
  });
};
UsbDevice.prototype.disconnect = function () {
  if (this.usbDevice) {
    var a = this.usbDevice;
    setTimeout(function () {
      a.close()
        .then(function (b) {
          console.log(b);
        })
        .catch(function (b) {
          console.log(b);
        }, 50);
    });
  }
};
var BleDevice = function () {
  this.printer = this.printCharacteristic = null;
};
BleDevice.prototype.handleError = function (a) {
  console.log(a);
};
BleDevice.prototype.connectPrinter = function () {
  var a = this;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (b) {
    navigator.bluetooth
      .getDevices()
      .then(function (e) {
        for (
          var d = $jscomp.makeIterator(e), c = d.next();
          !c.done;
          c = d.next()
        );
        e = e[0];
        null != e
          ? e.gatt
              .connect()
              .then(function (h) {
                return h.getPrimaryService(
                  "000018f0-0000-1000-8000-00805f9b34fb"
                );
              })
              .then(function (h) {
                return h.getCharacteristic(
                  "00002af1-0000-1000-8000-00805f9b34fb"
                );
              })
              .then(function (h) {
                a.printCharacteristic = h;
              })
          : (alert(multilang.get("connectFirst")),
            window.open("index.html", "_blank").focus());
      })
      .catch(a.handleError);
    b.jumpToEnd();
  });
};
BleDevice.prototype.connectPrinterWithReq = function () {
  var a = this;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (b) {
    navigator.bluetooth
      .requestDevice({
        filters: [
          { services: ["000018f0-0000-1000-8000-00805f9b34fb"] },
          { services: ["9fa480e0-4967-4542-9390-d343dc5d04ae"] },
        ],
      })
      .then(function (e) {
        a.printer = e;
        console.log("> Found " + e.name);
        e.addEventListener("gattserverdisconnected", a.onDisconnected);
        return e.gatt.connect();
      })
      .then(function (e) {
        return e.getPrimaryService(
          "000018f0-0000-1000-8000-00805f9b34fb",
          "9fa480e0-4967-4542-9390-d343dc5d04ae",
          "d0611e78-bbb4-4591-a5f8-487910ae4366"
        );
      })
      .then(function (e) {
        return e.getCharacteristic(
          "00002af1-0000-1000-8000-00805f9b34fb",
          "af0badb1-5b99-43cd-917a-a77bc549e3cc",
          "8667556c-9a37-4c91-84ed-54ee27d90049"
        );
      })
      .then(function (e) {
        a.printCharacteristic = e;
        alert(multilang.get("connectSuccess"));
      })
      .catch(a.handleError);
    b.jumpToEnd();
  });
};
BleDevice.prototype.onDisconnected = function (a) {
  console.log("Device " + a.target.name + " is disconnected.");
};
BleDevice.prototype.sendBytes = function (a) {
  var b = this,
    e,
    d;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (c) {
    e = b.printCharacteristic;
    d = new TextEncoder("utf-8");
    d.encode(
      "Don't you see, the water of the Yellow River comes from the sky and rushes to the sea never to \n"
    );
    b.printCharacteristic.writeValue(a).catch(function (h) {
      console.log(h);
      setTimeout(function () {
        e.writeValue(a);
      }, 500);
    });
    c.jumpToEnd();
  });
};
var WifiDevice = function () {
  this.socket = null;
};
WifiDevice.prototype.connectPrinter = function (a) {
  var b = this;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (e) {
    b.socket = new WebSocket("ws://192.168.3.108:8080");
    b.socket.onopen = function () {
      console.info("connected");
    };
    b.socket.addEventListener("open", function (d) {});
    b.socket.addEventListener("message", function (d) {
      console.info("Message from server ", d.data);
    });
    e.jumpToEnd();
  });
};
WifiDevice.prototype.sendBytes = function (a) {
  var b = this;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (e) {
    b.socket.send(a);
    e.jumpToEnd();
  });
};
function connectPrinter(a, b) {
  var e, d, c, h, f, g, l;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (m) {
    "-1" != a
      ? ((e = window.localStorage), e.setItem(portType_str, a))
      : ((d = window.localStorage),
        (a = d.getItem(portType_str) ? d.getItem(portType_str) : 0),
        (c = d.getItem(cutType_str)),
        null != c && (cutType_lib = c),
        (h = d.getItem(cashDrawer_str)),
        null != h && (cashDrawerType_lib = h),
        (f = d.getItem(printerDensity)),
        null != f && (pDensity_lib = f),
        (g = d.getItem(imageDensity)),
        null != g && (imgDensity_lib = g),
        (l = d.getItem(boldFont_str)),
        null != l && (boldFont_lib = "true" === l ? !0 : !1));
    printerType = a;
    printerPortInfo = b;
    switch (a) {
      case "0":
        "1" == b
          ? ((printer = new UsbDevice()), printer.connectPrinterReq())
          : ((printer = new UsbDevice()), printer.connectPrinter());
        break;
      case "1":
        "1" == b
          ? ((printer = new BleDevice()), printer.connectPrinterWithReq())
          : ((printer = new BleDevice()), printer.connectPrinter());
        break;
      case "2":
        printer = new WifiDevice();
        printer.connectPrinter(b);
        break;
      default:
        "1" == b
          ? ((printer = new UsbDevice()), printer.connectPrinterReq())
          : ((printer = new UsbDevice()), printer.connectPrinter());
    }
    m.jumpToEnd();
  });
}
var printer,
  printerType = "0",
  printerPortInfo,
  cutType_lib = "1",
  cashDrawerType_lib = "0",
  pDensity_lib = 5,
  imgDensity_lib = 200,
  bleData,
  index = 0,
  oneTimeBytes = 100,
  delWhite = 0,
  boldFont_lib = !1;
function send(a) {
  var b, e;
  return $jscomp.asyncExecutePromiseGeneratorProgram(function (d) {
    if (1 == d.nextAddress) {
      if ("1" != printerType) return printer.sendBytes(a), d.jumpTo(0);
      b = sliceData(a);
      e = 0;
    }
    if (6 != d.nextAddress)
      return e < b.length
        ? d.yield(
            new Promise(function (c) {
              return setTimeout(c, 1e3);
            }),
            6
          )
        : d.jumpTo(0);
    printer.sendBytes(b[e]);
    e++;
    return d.jumpTo(3);
  });
}
function read() {}
function disconnectPrinter() {
  switch (printerType) {
    case "0":
      printer.disconnect();
  }
}
function bytesToStr(a) {
  return String.fromCharCode.apply(null, new Uint16Array(a));
}
function strToBytes(a) {
  for (
    var b = new ArrayBuffer(2 * a.length),
      e = new Uint16Array(b),
      d = 0,
      c = a.length;
    d < c;
    d++
  )
    e[d] = a.charCodeAt(d);
  return b;
}
function printImageBuffer(a, b, e) {
  var d = a / 8,
    c = b,
    h = new Uint8Array(d * c + 8);
  h[0] = 29;
  h[1] = 118;
  h[2] = 48;
  h[3] = 0;
  h[4] = d % 256;
  h[5] = d / 256;
  h[6] = c % 256;
  h[7] = c / 256;
  for (var f = 8, g = [], l = 0; l < b; l++)
    for (var m = 0; m < a; m++) {
      var n = new Uint8Array(4),
        q = 4 * (a * l + m);
      for (k = 0; 4 > k; k++) n[k] = e[q + k];
      g.push(n);
    }
  e = imgDensity_lib;
  for (l = 0; l < b; l++) {
    n = m = 0;
    q = a;
    var r = 0;
    if (!boldFont_lib) {
      for (var p = 0; p < a; p++)
        if (l * a + p < g.length) {
          var t = g[l * a + p];
          null !== t &&
            735 > parseInt(t[0] + t[1] + t[2]) &&
            (q > p && (q = p),
            r < p && (r = p),
            (m += parseInt(0.3 * t[0] + 0.59 * t[1] + 0.11 * t[2])),
            n++);
        }
      m /= n;
      imgDensity_lib = e;
      255 > m && 0 < m && imgDensity_lib < m && (imgDensity_lib = m);
    }
    for (m = 0; m < a; m += 8) {
      h[f] = 255;
      for (n = 0; 8 > n; n++)
        l * a + m + n < g.length &&
          ((q = g[l * a + m + n]),
          null != q &&
            (parseInt(0.3 * q[0] + 0.59 * q[1] + 0.11 * q[2]) <=
              imgDensity_lib ||
              (h[f] &= ~(1 << (7 - n)))));
      f++;
    }
  }
  a = f - 1;
  if (0 === delWhite)
    for (; 0 <= a; a--)
      if (0 !== h[a]) {
        c = a / d;
        0 !== a % d &&
          ((c = Math.ceil(a / d) < c ? Math.ceil(a / d) < c : c),
          c + 2 < b && (c += 2),
          (a = c * d));
        break;
      }
  h[4] = d % 256;
  h[5] = d / 256;
  h[6] = c % 256;
  h[7] = c / 256;
  return h.slice(0, a);
}
function sliceData(a) {
  for (
    var b = [], e = a.length, d = Math.floor(e / oneTimeBytes) + 1, c = 0;
    c < d;
    c++
  )
    if (c < d - 1) {
      new Uint8Array(oneTimeBytes);
      var h = a.slice(c * oneTimeBytes, c * oneTimeBytes + oneTimeBytes);
      b.push(h);
    } else
      new Uint8Array(e % oneTimeBytes),
        (h = a.slice(c * oneTimeBytes, c * oneTimeBytes + (e % oneTimeBytes))),
        b.push(h);
  return b;
}
function initPrinter() {
  return new Uint8Array([27, 64]);
}
function printSelftest() {
  return new Uint8Array([31, 27, 31, 103]);
}
function cutPaper() {
  return new Uint8Array([27, 64, 29, 86, 66, 48]);
}
function openCashDrawer() {
  return new Uint8Array([27, 112, 0, 30, 255, 0]);
}
function setDensity() {
  return new Uint8Array([31, 27, 31, 19, 20, pDensity_lib]);
}
function clearPrinterBuffer() {
  return new Uint8Array(10);
}
function sendString(a) {
  return str2ab(a);
}
function ab2str(a) {
  return String.fromCharCode.apply(null, new Uint16Array(a));
}
function str2ab(a) {
  for (
    var b = new ArrayBuffer(2 * a.length),
      e = new Uint16Array(b),
      d = 0,
      c = a.length;
    d < c;
    d++
  )
    e[d] = a.charCodeAt(d);
  return b;
}
