(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define('tile', factory) :
            (global = global || self, global.tile = factory());
}(this, function () { 'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            // shim for using process in browser
            // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            var cachedSetTimeout = defaultSetTimout;
            var cachedClearTimeout = defaultClearTimeout;
            if (typeof global$1.setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            }
            if (typeof global$1.clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            }

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            function nextTick(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            }
            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            var title = 'browser';
            var platform = 'browser';
            var browser = true;
            var env = {};
            var argv = [];
            var version = ''; // empty string to avoid regexp issues
            var versions = {};
            var release = {};
            var config = {};

            function noop() {}

            var on = noop;
            var addListener = noop;
            var once = noop;
            var off = noop;
            var removeListener = noop;
            var removeAllListeners = noop;
            var emit = noop;

            function binding(name) {
                throw new Error('process.binding is not supported');
            }

            function cwd () { return '/' }
            function chdir (dir) {
                throw new Error('process.chdir is not supported');
            }function umask() { return 0; }

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            // generate timestamp or delta
            // see http://nodejs.org/api/process.html#process_process_hrtime
            function hrtime(previousTimestamp){
              var clocktime = performanceNow.call(performance)*1e-3;
              var seconds = Math.floor(clocktime);
              var nanoseconds = Math.floor((clocktime%1)*1e9);
              if (previousTimestamp) {
                seconds = seconds - previousTimestamp[0];
                nanoseconds = nanoseconds - previousTimestamp[1];
                if (nanoseconds<0) {
                  seconds--;
                  nanoseconds += 1e9;
                }
              }
              return [seconds,nanoseconds]
            }

            var startTime = new Date();
            function uptime() {
              var currentTime = new Date();
              var dif = currentTime - startTime;
              return dif / 1000;
            }

            var process = {
              nextTick: nextTick,
              title: title,
              browser: browser,
              env: env,
              argv: argv,
              version: version,
              versions: versions,
              on: on,
              addListener: addListener,
              once: once,
              off: off,
              removeListener: removeListener,
              removeAllListeners: removeAllListeners,
              emit: emit,
              binding: binding,
              cwd: cwd,
              chdir: chdir,
              umask: umask,
              hrtime: hrtime,
              platform: platform,
              release: release,
              config: config,
              uptime: uptime
            };

            function createCommonjsModule(fn, module) {
            	return module = { exports: {} }, fn(module, module.exports), module.exports;
            }

            /*
            object-assign
            (c) Sindre Sorhus
            @license MIT
            */
            /* eslint-disable no-unused-vars */
            var getOwnPropertySymbols = Object.getOwnPropertySymbols;
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var propIsEnumerable = Object.prototype.propertyIsEnumerable;

            function toObject(val) {
            	if (val === null || val === undefined) {
            		throw new TypeError('Object.assign cannot be called with null or undefined');
            	}

            	return Object(val);
            }

            function shouldUseNative() {
            	try {
            		if (!Object.assign) {
            			return false;
            		}

            		// Detect buggy property enumeration order in older V8 versions.

            		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
            		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
            		test1[5] = 'de';
            		if (Object.getOwnPropertyNames(test1)[0] === '5') {
            			return false;
            		}

            		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
            		var test2 = {};
            		for (var i = 0; i < 10; i++) {
            			test2['_' + String.fromCharCode(i)] = i;
            		}
            		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
            			return test2[n];
            		});
            		if (order2.join('') !== '0123456789') {
            			return false;
            		}

            		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
            		var test3 = {};
            		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
            			test3[letter] = letter;
            		});
            		if (Object.keys(Object.assign({}, test3)).join('') !==
            				'abcdefghijklmnopqrst') {
            			return false;
            		}

            		return true;
            	} catch (err) {
            		// We don't expect any of the above to throw, but better to be safe.
            		return false;
            	}
            }

            var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
            	var from;
            	var to = toObject(target);
            	var symbols;

            	for (var s = 1; s < arguments.length; s++) {
            		from = Object(arguments[s]);

            		for (var key in from) {
            			if (hasOwnProperty.call(from, key)) {
            				to[key] = from[key];
            			}
            		}

            		if (getOwnPropertySymbols) {
            			symbols = getOwnPropertySymbols(from);
            			for (var i = 0; i < symbols.length; i++) {
            				if (propIsEnumerable.call(from, symbols[i])) {
            					to[symbols[i]] = from[symbols[i]];
            				}
            			}
            		}
            	}

            	return to;
            };

            var n="function"===typeof Symbol&&Symbol.for,p=n?Symbol.for("react.element"):60103,q=n?Symbol.for("react.portal"):60106,r=n?Symbol.for("react.fragment"):60107,t=n?Symbol.for("react.strict_mode"):60108,u=n?Symbol.for("react.profiler"):60114,v=n?Symbol.for("react.provider"):60109,w=n?Symbol.for("react.context"):60110,x=n?Symbol.for("react.concurrent_mode"):60111,y=n?Symbol.for("react.forward_ref"):60112,z=n?Symbol.for("react.suspense"):60113,A=n?Symbol.for("react.memo"):
            60115,B=n?Symbol.for("react.lazy"):60116,C="function"===typeof Symbol&&Symbol.iterator;function aa(a,b,e,c,d,g,h,f){if(!a){a=void 0;if(void 0===b)a=Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var l=[e,c,d,g,h,f],m=0;a=Error(b.replace(/%s/g,function(){return l[m++]}));a.name="Invariant Violation";}a.framesToPop=1;throw a;}}
            function D(a){for(var b=arguments.length-1,e="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=0;c<b;c++)e+="&args[]="+encodeURIComponent(arguments[c+1]);aa(!1,"Minified React error #"+a+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",e);}var E={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},F={};
            function G(a,b,e){this.props=a;this.context=b;this.refs=F;this.updater=e||E;}G.prototype.isReactComponent={};G.prototype.setState=function(a,b){"object"!==typeof a&&"function"!==typeof a&&null!=a?D("85"):void 0;this.updater.enqueueSetState(this,a,b,"setState");};G.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};function H(){}H.prototype=G.prototype;function I(a,b,e){this.props=a;this.context=b;this.refs=F;this.updater=e||E;}var J=I.prototype=new H;
            J.constructor=I;objectAssign(J,G.prototype);J.isPureReactComponent=!0;var K={current:null,currentDispatcher:null},L=Object.prototype.hasOwnProperty,M={key:!0,ref:!0,__self:!0,__source:!0};
            function N(a,b,e){var c=void 0,d={},g=null,h=null;if(null!=b)for(c in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(g=""+b.key),b)L.call(b,c)&&!M.hasOwnProperty(c)&&(d[c]=b[c]);var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){for(var l=Array(f),m=0;m<f;m++)l[m]=arguments[m+2];d.children=l;}if(a&&a.defaultProps)for(c in f=a.defaultProps,f)void 0===d[c]&&(d[c]=f[c]);return {$$typeof:p,type:a,key:g,ref:h,props:d,_owner:K.current}}
            function ba(a,b){return {$$typeof:p,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function O(a){return "object"===typeof a&&null!==a&&a.$$typeof===p}function escape(a){var b={"=":"=0",":":"=2"};return "$"+(""+a).replace(/[=:]/g,function(a){return b[a]})}var P=/\/+/g,Q=[];function R(a,b,e,c){if(Q.length){var d=Q.pop();d.result=a;d.keyPrefix=b;d.func=e;d.context=c;d.count=0;return d}return {result:a,keyPrefix:b,func:e,context:c,count:0}}
            function S(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>Q.length&&Q.push(a);}
            function T(a,b,e,c){var d=typeof a;if("undefined"===d||"boolean"===d)a=null;var g=!1;if(null===a)g=!0;else switch(d){case "string":case "number":g=!0;break;case "object":switch(a.$$typeof){case p:case q:g=!0;}}if(g)return e(c,a,""===b?"."+U(a,0):b),1;g=0;b=""===b?".":b+":";if(Array.isArray(a))for(var h=0;h<a.length;h++){d=a[h];var f=b+U(d,h);g+=T(d,f,e,c);}else if(null===a||"object"!==typeof a?f=null:(f=C&&a[C]||a["@@iterator"],f="function"===typeof f?f:null),"function"===typeof f)for(a=f.call(a),h=
            0;!(d=a.next()).done;)d=d.value,f=b+U(d,h++),g+=T(d,f,e,c);else"object"===d&&(e=""+a,D("31","[object Object]"===e?"object with keys {"+Object.keys(a).join(", ")+"}":e,""));return g}function V(a,b,e){return null==a?0:T(a,"",b,e)}function U(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape(a.key):b.toString(36)}function ca(a,b){a.func.call(a.context,b,a.count++);}
            function da(a,b,e){var c=a.result,d=a.keyPrefix;a=a.func.call(a.context,b,a.count++);Array.isArray(a)?W(a,c,e,function(a){return a}):null!=a&&(O(a)&&(a=ba(a,d+(!a.key||b&&b.key===a.key?"":(""+a.key).replace(P,"$&/")+"/")+e)),c.push(a));}function W(a,b,e,c,d){var g="";null!=e&&(g=(""+e).replace(P,"$&/")+"/");b=R(b,g,c,d);V(a,da,b);S(b);}
            var X={Children:{map:function(a,b,e){if(null==a)return a;var c=[];W(a,c,null,b,e);return c},forEach:function(a,b,e){if(null==a)return a;b=R(null,null,b,e);V(a,ca,b);S(b);},count:function(a){return V(a,function(){return null},null)},toArray:function(a){var b=[];W(a,b,null,function(a){return a});return b},only:function(a){O(a)?void 0:D("143");return a}},createRef:function(){return {current:null}},Component:G,PureComponent:I,createContext:function(a,b){void 0===b&&(b=null);a={$$typeof:w,_calculateChangedBits:b,
            _currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null};a.Provider={$$typeof:v,_context:a};return a.Consumer=a},forwardRef:function(a){return {$$typeof:y,render:a}},lazy:function(a){return {$$typeof:B,_ctor:a,_status:-1,_result:null}},memo:function(a,b){return {$$typeof:A,type:a,compare:void 0===b?null:b}},Fragment:r,StrictMode:t,Suspense:z,createElement:N,cloneElement:function(a,b,e){null===a||void 0===a?D("267",a):void 0;var c=void 0,d=objectAssign({},a.props),g=a.key,h=a.ref,f=a._owner;
            if(null!=b){void 0!==b.ref&&(h=b.ref,f=K.current);void 0!==b.key&&(g=""+b.key);var l=void 0;a.type&&a.type.defaultProps&&(l=a.type.defaultProps);for(c in b)L.call(b,c)&&!M.hasOwnProperty(c)&&(d[c]=void 0===b[c]&&void 0!==l?l[c]:b[c]);}c=arguments.length-2;if(1===c)d.children=e;else if(1<c){l=Array(c);for(var m=0;m<c;m++)l[m]=arguments[m+2];d.children=l;}return {$$typeof:p,type:a.type,key:g,ref:h,props:d,_owner:f}},createFactory:function(a){var b=N.bind(null,a);b.type=a;return b},isValidElement:O,version:"16.6.3",
            __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:K,assign:objectAssign}};X.unstable_ConcurrentMode=x;X.unstable_Profiler=u;var Y={default:X},Z=Y&&X||Y;var react_production_min=Z.default||Z;

            /**
             * Copyright (c) 2013-present, Facebook, Inc.
             *
             * This source code is licensed under the MIT license found in the
             * LICENSE file in the root directory of this source tree.
             */

            var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

            var ReactPropTypesSecret_1 = ReactPropTypesSecret;

            var printWarning = function() {};

            {
              var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
              var loggedTypeFailures = {};

              printWarning = function(text) {
                var message = 'Warning: ' + text;
                if (typeof console !== 'undefined') {
                  console.error(message);
                }
                try {
                  // --- Welcome to debugging React ---
                  // This error was thrown as a convenience so that you can use this stack
                  // to find the callsite that caused this warning to fire.
                  throw new Error(message);
                } catch (x) {}
              };
            }

            /**
             * Assert that the values match with the type specs.
             * Error messages are memorized and will only be shown once.
             *
             * @param {object} typeSpecs Map of name to a ReactPropType
             * @param {object} values Runtime values that need to be type-checked
             * @param {string} location e.g. "prop", "context", "child context"
             * @param {string} componentName Name of the component for error messages.
             * @param {?Function} getStack Returns the component stack.
             * @private
             */
            function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
              {
                for (var typeSpecName in typeSpecs) {
                  if (typeSpecs.hasOwnProperty(typeSpecName)) {
                    var error;
                    // Prop type validation may throw. In case they do, we don't want to
                    // fail the render phase where it didn't fail before. So we log it.
                    // After these have been cleaned up, we'll let them throw.
                    try {
                      // This is intentionally an invariant that gets caught. It's the same
                      // behavior as without this statement except with a better message.
                      if (typeof typeSpecs[typeSpecName] !== 'function') {
                        var err = Error(
                          (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
                          'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
                        );
                        err.name = 'Invariant Violation';
                        throw err;
                      }
                      error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
                    } catch (ex) {
                      error = ex;
                    }
                    if (error && !(error instanceof Error)) {
                      printWarning(
                        (componentName || 'React class') + ': type specification of ' +
                        location + ' `' + typeSpecName + '` is invalid; the type checker ' +
                        'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
                        'You may have forgotten to pass an argument to the type checker ' +
                        'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
                        'shape all require an argument).'
                      );

                    }
                    if (error instanceof Error && !(error.message in loggedTypeFailures)) {
                      // Only monitor this failure once because there tends to be a lot of the
                      // same error.
                      loggedTypeFailures[error.message] = true;

                      var stack = getStack ? getStack() : '';

                      printWarning(
                        'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
                      );
                    }
                  }
                }
              }
            }

            var checkPropTypes_1 = checkPropTypes;

            var react_development = createCommonjsModule(function (module) {



            if (process.env.NODE_ENV !== "production") {
              (function() {

            var _assign = objectAssign;
            var checkPropTypes = checkPropTypes_1;

            // TODO: this is special because it gets imported during build.

            var ReactVersion = '16.6.3';

            // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
            // nor polyfill, then a plain number is used for performance.
            var hasSymbol = typeof Symbol === 'function' && Symbol.for;

            var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
            var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
            var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
            var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
            var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
            var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
            var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace;

            var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
            var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
            var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
            var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
            var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;

            var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
            var FAUX_ITERATOR_SYMBOL = '@@iterator';

            function getIteratorFn(maybeIterable) {
              if (maybeIterable === null || typeof maybeIterable !== 'object') {
                return null;
              }
              var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
              if (typeof maybeIterator === 'function') {
                return maybeIterator;
              }
              return null;
            }

            /**
             * Use invariant() to assert state which your program assumes to be true.
             *
             * Provide sprintf-style format (only %s is supported) and arguments
             * to provide information about what broke and what you were
             * expecting.
             *
             * The invariant message will be stripped in production, but the invariant
             * will remain to ensure logic does not differ in production.
             */

            var validateFormat = function () {};

            {
              validateFormat = function (format) {
                if (format === undefined) {
                  throw new Error('invariant requires an error message argument');
                }
              };
            }

            function invariant(condition, format, a, b, c, d, e, f) {
              validateFormat(format);

              if (!condition) {
                var error = void 0;
                if (format === undefined) {
                  error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
                } else {
                  var args = [a, b, c, d, e, f];
                  var argIndex = 0;
                  error = new Error(format.replace(/%s/g, function () {
                    return args[argIndex++];
                  }));
                  error.name = 'Invariant Violation';
                }

                error.framesToPop = 1; // we don't care about invariant's own frame
                throw error;
              }
            }

            // Relying on the `invariant()` implementation lets us
            // preserve the format and params in the www builds.

            /**
             * Forked from fbjs/warning:
             * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
             *
             * Only change is we use console.warn instead of console.error,
             * and do nothing when 'console' is not supported.
             * This really simplifies the code.
             * ---
             * Similar to invariant but only logs a warning if the condition is not met.
             * This can be used to log issues in development environments in critical
             * paths. Removing the logging code for production environments will keep the
             * same logic and follow the same code paths.
             */

            var lowPriorityWarning = function () {};

            {
              var printWarning = function (format) {
                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = arguments[_key];
                }

                var argIndex = 0;
                var message = 'Warning: ' + format.replace(/%s/g, function () {
                  return args[argIndex++];
                });
                if (typeof console !== 'undefined') {
                  console.warn(message);
                }
                try {
                  // --- Welcome to debugging React ---
                  // This error was thrown as a convenience so that you can use this stack
                  // to find the callsite that caused this warning to fire.
                  throw new Error(message);
                } catch (x) {}
              };

              lowPriorityWarning = function (condition, format) {
                if (format === undefined) {
                  throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument');
                }
                if (!condition) {
                  for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                    args[_key2 - 2] = arguments[_key2];
                  }

                  printWarning.apply(undefined, [format].concat(args));
                }
              };
            }

            var lowPriorityWarning$1 = lowPriorityWarning;

            /**
             * Similar to invariant but only logs a warning if the condition is not met.
             * This can be used to log issues in development environments in critical
             * paths. Removing the logging code for production environments will keep the
             * same logic and follow the same code paths.
             */

            var warningWithoutStack = function () {};

            {
              warningWithoutStack = function (condition, format) {
                for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  args[_key - 2] = arguments[_key];
                }

                if (format === undefined) {
                  throw new Error('`warningWithoutStack(condition, format, ...args)` requires a warning ' + 'message argument');
                }
                if (args.length > 8) {
                  // Check before the condition to catch violations early.
                  throw new Error('warningWithoutStack() currently supports at most 8 arguments.');
                }
                if (condition) {
                  return;
                }
                if (typeof console !== 'undefined') {
                  var argsWithFormat = args.map(function (item) {
                    return '' + item;
                  });
                  argsWithFormat.unshift('Warning: ' + format);

                  // We intentionally don't use spread (or .apply) directly because it
                  // breaks IE9: https://github.com/facebook/react/issues/13610
                  Function.prototype.apply.call(console.error, console, argsWithFormat);
                }
                try {
                  // --- Welcome to debugging React ---
                  // This error was thrown as a convenience so that you can use this stack
                  // to find the callsite that caused this warning to fire.
                  var argIndex = 0;
                  var message = 'Warning: ' + format.replace(/%s/g, function () {
                    return args[argIndex++];
                  });
                  throw new Error(message);
                } catch (x) {}
              };
            }

            var warningWithoutStack$1 = warningWithoutStack;

            var didWarnStateUpdateForUnmountedComponent = {};

            function warnNoop(publicInstance, callerName) {
              {
                var _constructor = publicInstance.constructor;
                var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
                var warningKey = componentName + '.' + callerName;
                if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
                  return;
                }
                warningWithoutStack$1(false, "Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);
                didWarnStateUpdateForUnmountedComponent[warningKey] = true;
              }
            }

            /**
             * This is the abstract API for an update queue.
             */
            var ReactNoopUpdateQueue = {
              /**
               * Checks whether or not this composite component is mounted.
               * @param {ReactClass} publicInstance The instance we want to test.
               * @return {boolean} True if mounted, false otherwise.
               * @protected
               * @final
               */
              isMounted: function (publicInstance) {
                return false;
              },

              /**
               * Forces an update. This should only be invoked when it is known with
               * certainty that we are **not** in a DOM transaction.
               *
               * You may want to call this when you know that some deeper aspect of the
               * component's state has changed but `setState` was not called.
               *
               * This will not invoke `shouldComponentUpdate`, but it will invoke
               * `componentWillUpdate` and `componentDidUpdate`.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {?function} callback Called after component is updated.
               * @param {?string} callerName name of the calling function in the public API.
               * @internal
               */
              enqueueForceUpdate: function (publicInstance, callback, callerName) {
                warnNoop(publicInstance, 'forceUpdate');
              },

              /**
               * Replaces all of the state. Always use this or `setState` to mutate state.
               * You should treat `this.state` as immutable.
               *
               * There is no guarantee that `this.state` will be immediately updated, so
               * accessing `this.state` after calling this method may return the old value.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {object} completeState Next state.
               * @param {?function} callback Called after component is updated.
               * @param {?string} callerName name of the calling function in the public API.
               * @internal
               */
              enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
                warnNoop(publicInstance, 'replaceState');
              },

              /**
               * Sets a subset of the state. This only exists because _pendingState is
               * internal. This provides a merging strategy that is not available to deep
               * properties which is confusing. TODO: Expose pendingState or don't use it
               * during the merge.
               *
               * @param {ReactClass} publicInstance The instance that should rerender.
               * @param {object} partialState Next partial state to be merged with state.
               * @param {?function} callback Called after component is updated.
               * @param {?string} Name of the calling function in the public API.
               * @internal
               */
              enqueueSetState: function (publicInstance, partialState, callback, callerName) {
                warnNoop(publicInstance, 'setState');
              }
            };

            var emptyObject = {};
            {
              Object.freeze(emptyObject);
            }

            /**
             * Base class helpers for the updating state of a component.
             */
            function Component(props, context, updater) {
              this.props = props;
              this.context = context;
              // If a component has string refs, we will assign a different object later.
              this.refs = emptyObject;
              // We initialize the default updater but the real one gets injected by the
              // renderer.
              this.updater = updater || ReactNoopUpdateQueue;
            }

            Component.prototype.isReactComponent = {};

            /**
             * Sets a subset of the state. Always use this to mutate
             * state. You should treat `this.state` as immutable.
             *
             * There is no guarantee that `this.state` will be immediately updated, so
             * accessing `this.state` after calling this method may return the old value.
             *
             * There is no guarantee that calls to `setState` will run synchronously,
             * as they may eventually be batched together.  You can provide an optional
             * callback that will be executed when the call to setState is actually
             * completed.
             *
             * When a function is provided to setState, it will be called at some point in
             * the future (not synchronously). It will be called with the up to date
             * component arguments (state, props, context). These values can be different
             * from this.* because your function may be called after receiveProps but before
             * shouldComponentUpdate, and this new state, props, and context will not yet be
             * assigned to this.
             *
             * @param {object|function} partialState Next partial state or function to
             *        produce next partial state to be merged with current state.
             * @param {?function} callback Called after state is updated.
             * @final
             * @protected
             */
            Component.prototype.setState = function (partialState, callback) {
              !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : void 0;
              this.updater.enqueueSetState(this, partialState, callback, 'setState');
            };

            /**
             * Forces an update. This should only be invoked when it is known with
             * certainty that we are **not** in a DOM transaction.
             *
             * You may want to call this when you know that some deeper aspect of the
             * component's state has changed but `setState` was not called.
             *
             * This will not invoke `shouldComponentUpdate`, but it will invoke
             * `componentWillUpdate` and `componentDidUpdate`.
             *
             * @param {?function} callback Called after update is complete.
             * @final
             * @protected
             */
            Component.prototype.forceUpdate = function (callback) {
              this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
            };

            /**
             * Deprecated APIs. These APIs used to exist on classic React classes but since
             * we would like to deprecate them, we're not going to move them over to this
             * modern base class. Instead, we define a getter that warns if it's accessed.
             */
            {
              var deprecatedAPIs = {
                isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
                replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
              };
              var defineDeprecationWarning = function (methodName, info) {
                Object.defineProperty(Component.prototype, methodName, {
                  get: function () {
                    lowPriorityWarning$1(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);
                    return undefined;
                  }
                });
              };
              for (var fnName in deprecatedAPIs) {
                if (deprecatedAPIs.hasOwnProperty(fnName)) {
                  defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
                }
              }
            }

            function ComponentDummy() {}
            ComponentDummy.prototype = Component.prototype;

            /**
             * Convenience component with default shallow equality check for sCU.
             */
            function PureComponent(props, context, updater) {
              this.props = props;
              this.context = context;
              // If a component has string refs, we will assign a different object later.
              this.refs = emptyObject;
              this.updater = updater || ReactNoopUpdateQueue;
            }

            var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
            pureComponentPrototype.constructor = PureComponent;
            // Avoid an extra prototype jump for these methods.
            _assign(pureComponentPrototype, Component.prototype);
            pureComponentPrototype.isPureReactComponent = true;

            // an immutable object with a single mutable value
            function createRef() {
              var refObject = {
                current: null
              };
              {
                Object.seal(refObject);
              }
              return refObject;
            }

            /**
             * Keeps track of the current owner.
             *
             * The current owner is the component who should own any components that are
             * currently being constructed.
             */
            var ReactCurrentOwner = {
              /**
               * @internal
               * @type {ReactComponent}
               */
              current: null,
              currentDispatcher: null
            };

            var BEFORE_SLASH_RE = /^(.*)[\\\/]/;

            var describeComponentFrame = function (name, source, ownerName) {
              var sourceInfo = '';
              if (source) {
                var path = source.fileName;
                var fileName = path.replace(BEFORE_SLASH_RE, '');
                {
                  // In DEV, include code for a common special case:
                  // prefer "folder/index.js" instead of just "index.js".
                  if (/^index\./.test(fileName)) {
                    var match = path.match(BEFORE_SLASH_RE);
                    if (match) {
                      var pathBeforeSlash = match[1];
                      if (pathBeforeSlash) {
                        var folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');
                        fileName = folderName + '/' + fileName;
                      }
                    }
                  }
                }
                sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
              } else if (ownerName) {
                sourceInfo = ' (created by ' + ownerName + ')';
              }
              return '\n    in ' + (name || 'Unknown') + sourceInfo;
            };

            var Resolved = 1;


            function refineResolvedLazyComponent(lazyComponent) {
              return lazyComponent._status === Resolved ? lazyComponent._result : null;
            }

            function getWrappedName(outerType, innerType, wrapperName) {
              var functionName = innerType.displayName || innerType.name || '';
              return outerType.displayName || (functionName !== '' ? wrapperName + '(' + functionName + ')' : wrapperName);
            }

            function getComponentName(type) {
              if (type == null) {
                // Host root, text node or just invalid type.
                return null;
              }
              {
                if (typeof type.tag === 'number') {
                  warningWithoutStack$1(false, 'Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
                }
              }
              if (typeof type === 'function') {
                return type.displayName || type.name || null;
              }
              if (typeof type === 'string') {
                return type;
              }
              switch (type) {
                case REACT_CONCURRENT_MODE_TYPE:
                  return 'ConcurrentMode';
                case REACT_FRAGMENT_TYPE:
                  return 'Fragment';
                case REACT_PORTAL_TYPE:
                  return 'Portal';
                case REACT_PROFILER_TYPE:
                  return 'Profiler';
                case REACT_STRICT_MODE_TYPE:
                  return 'StrictMode';
                case REACT_SUSPENSE_TYPE:
                  return 'Suspense';
              }
              if (typeof type === 'object') {
                switch (type.$$typeof) {
                  case REACT_CONTEXT_TYPE:
                    return 'Context.Consumer';
                  case REACT_PROVIDER_TYPE:
                    return 'Context.Provider';
                  case REACT_FORWARD_REF_TYPE:
                    return getWrappedName(type, type.render, 'ForwardRef');
                  case REACT_MEMO_TYPE:
                    return getComponentName(type.type);
                  case REACT_LAZY_TYPE:
                    {
                      var thenable = type;
                      var resolvedThenable = refineResolvedLazyComponent(thenable);
                      if (resolvedThenable) {
                        return getComponentName(resolvedThenable);
                      }
                    }
                }
              }
              return null;
            }

            var ReactDebugCurrentFrame = {};

            var currentlyValidatingElement = null;

            function setCurrentlyValidatingElement(element) {
              {
                currentlyValidatingElement = element;
              }
            }

            {
              // Stack implementation injected by the current renderer.
              ReactDebugCurrentFrame.getCurrentStack = null;

              ReactDebugCurrentFrame.getStackAddendum = function () {
                var stack = '';

                // Add an extra top frame while an element is being validated
                if (currentlyValidatingElement) {
                  var name = getComponentName(currentlyValidatingElement.type);
                  var owner = currentlyValidatingElement._owner;
                  stack += describeComponentFrame(name, currentlyValidatingElement._source, owner && getComponentName(owner.type));
                }

                // Delegate to the injected renderer-specific implementation
                var impl = ReactDebugCurrentFrame.getCurrentStack;
                if (impl) {
                  stack += impl() || '';
                }

                return stack;
              };
            }

            var ReactSharedInternals = {
              ReactCurrentOwner: ReactCurrentOwner,
              // Used by renderers to avoid bundling object-assign twice in UMD bundles:
              assign: _assign
            };

            {
              _assign(ReactSharedInternals, {
                // These should not be included in production.
                ReactDebugCurrentFrame: ReactDebugCurrentFrame,
                // Shim for React DOM 16.0.0 which still destructured (but not used) this.
                // TODO: remove in React 17.0.
                ReactComponentTreeHook: {}
              });
            }

            /**
             * Similar to invariant but only logs a warning if the condition is not met.
             * This can be used to log issues in development environments in critical
             * paths. Removing the logging code for production environments will keep the
             * same logic and follow the same code paths.
             */

            var warning = warningWithoutStack$1;

            {
              warning = function (condition, format) {
                if (condition) {
                  return;
                }
                var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
                var stack = ReactDebugCurrentFrame.getStackAddendum();
                // eslint-disable-next-line react-internal/warning-and-invariant-args

                for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  args[_key - 2] = arguments[_key];
                }

                warningWithoutStack$1.apply(undefined, [false, format + '%s'].concat(args, [stack]));
              };
            }

            var warning$1 = warning;

            var hasOwnProperty = Object.prototype.hasOwnProperty;

            var RESERVED_PROPS = {
              key: true,
              ref: true,
              __self: true,
              __source: true
            };

            var specialPropKeyWarningShown = void 0;
            var specialPropRefWarningShown = void 0;

            function hasValidRef(config) {
              {
                if (hasOwnProperty.call(config, 'ref')) {
                  var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
                  if (getter && getter.isReactWarning) {
                    return false;
                  }
                }
              }
              return config.ref !== undefined;
            }

            function hasValidKey(config) {
              {
                if (hasOwnProperty.call(config, 'key')) {
                  var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
                  if (getter && getter.isReactWarning) {
                    return false;
                  }
                }
              }
              return config.key !== undefined;
            }

            function defineKeyPropWarningGetter(props, displayName) {
              var warnAboutAccessingKey = function () {
                if (!specialPropKeyWarningShown) {
                  specialPropKeyWarningShown = true;
                  warningWithoutStack$1(false, '%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
                }
              };
              warnAboutAccessingKey.isReactWarning = true;
              Object.defineProperty(props, 'key', {
                get: warnAboutAccessingKey,
                configurable: true
              });
            }

            function defineRefPropWarningGetter(props, displayName) {
              var warnAboutAccessingRef = function () {
                if (!specialPropRefWarningShown) {
                  specialPropRefWarningShown = true;
                  warningWithoutStack$1(false, '%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
                }
              };
              warnAboutAccessingRef.isReactWarning = true;
              Object.defineProperty(props, 'ref', {
                get: warnAboutAccessingRef,
                configurable: true
              });
            }

            /**
             * Factory method to create a new React element. This no longer adheres to
             * the class pattern, so do not use new to call it. Also, no instanceof check
             * will work. Instead test $$typeof field against Symbol.for('react.element') to check
             * if something is a React Element.
             *
             * @param {*} type
             * @param {*} key
             * @param {string|object} ref
             * @param {*} self A *temporary* helper to detect places where `this` is
             * different from the `owner` when React.createElement is called, so that we
             * can warn. We want to get rid of owner and replace string `ref`s with arrow
             * functions, and as long as `this` and owner are the same, there will be no
             * change in behavior.
             * @param {*} source An annotation object (added by a transpiler or otherwise)
             * indicating filename, line number, and/or other information.
             * @param {*} owner
             * @param {*} props
             * @internal
             */
            var ReactElement = function (type, key, ref, self, source, owner, props) {
              var element = {
                // This tag allows us to uniquely identify this as a React Element
                $$typeof: REACT_ELEMENT_TYPE,

                // Built-in properties that belong on the element
                type: type,
                key: key,
                ref: ref,
                props: props,

                // Record the component responsible for creating this element.
                _owner: owner
              };

              {
                // The validation flag is currently mutative. We put it on
                // an external backing store so that we can freeze the whole object.
                // This can be replaced with a WeakMap once they are implemented in
                // commonly used development environments.
                element._store = {};

                // To make comparing ReactElements easier for testing purposes, we make
                // the validation flag non-enumerable (where possible, which should
                // include every environment we run tests in), so the test framework
                // ignores it.
                Object.defineProperty(element._store, 'validated', {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: false
                });
                // self and source are DEV only properties.
                Object.defineProperty(element, '_self', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: self
                });
                // Two elements created in two different places should be considered
                // equal for testing purposes and therefore we hide it from enumeration.
                Object.defineProperty(element, '_source', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: source
                });
                if (Object.freeze) {
                  Object.freeze(element.props);
                  Object.freeze(element);
                }
              }

              return element;
            };

            /**
             * Create and return a new ReactElement of the given type.
             * See https://reactjs.org/docs/react-api.html#createelement
             */
            function createElement(type, config, children) {
              var propName = void 0;

              // Reserved names are extracted
              var props = {};

              var key = null;
              var ref = null;
              var self = null;
              var source = null;

              if (config != null) {
                if (hasValidRef(config)) {
                  ref = config.ref;
                }
                if (hasValidKey(config)) {
                  key = '' + config.key;
                }

                self = config.__self === undefined ? null : config.__self;
                source = config.__source === undefined ? null : config.__source;
                // Remaining properties are added to a new props object
                for (propName in config) {
                  if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                    props[propName] = config[propName];
                  }
                }
              }

              // Children can be more than one argument, and those are transferred onto
              // the newly allocated props object.
              var childrenLength = arguments.length - 2;
              if (childrenLength === 1) {
                props.children = children;
              } else if (childrenLength > 1) {
                var childArray = Array(childrenLength);
                for (var i = 0; i < childrenLength; i++) {
                  childArray[i] = arguments[i + 2];
                }
                {
                  if (Object.freeze) {
                    Object.freeze(childArray);
                  }
                }
                props.children = childArray;
              }

              // Resolve default props
              if (type && type.defaultProps) {
                var defaultProps = type.defaultProps;
                for (propName in defaultProps) {
                  if (props[propName] === undefined) {
                    props[propName] = defaultProps[propName];
                  }
                }
              }
              {
                if (key || ref) {
                  var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
                  if (key) {
                    defineKeyPropWarningGetter(props, displayName);
                  }
                  if (ref) {
                    defineRefPropWarningGetter(props, displayName);
                  }
                }
              }
              return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
            }

            /**
             * Return a function that produces ReactElements of a given type.
             * See https://reactjs.org/docs/react-api.html#createfactory
             */


            function cloneAndReplaceKey(oldElement, newKey) {
              var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

              return newElement;
            }

            /**
             * Clone and return a new ReactElement using element as the starting point.
             * See https://reactjs.org/docs/react-api.html#cloneelement
             */
            function cloneElement(element, config, children) {
              !!(element === null || element === undefined) ? invariant(false, 'React.cloneElement(...): The argument must be a React element, but you passed %s.', element) : void 0;

              var propName = void 0;

              // Original props are copied
              var props = _assign({}, element.props);

              // Reserved names are extracted
              var key = element.key;
              var ref = element.ref;
              // Self is preserved since the owner is preserved.
              var self = element._self;
              // Source is preserved since cloneElement is unlikely to be targeted by a
              // transpiler, and the original source is probably a better indicator of the
              // true owner.
              var source = element._source;

              // Owner will be preserved, unless ref is overridden
              var owner = element._owner;

              if (config != null) {
                if (hasValidRef(config)) {
                  // Silently steal the ref from the parent.
                  ref = config.ref;
                  owner = ReactCurrentOwner.current;
                }
                if (hasValidKey(config)) {
                  key = '' + config.key;
                }

                // Remaining properties override existing props
                var defaultProps = void 0;
                if (element.type && element.type.defaultProps) {
                  defaultProps = element.type.defaultProps;
                }
                for (propName in config) {
                  if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                    if (config[propName] === undefined && defaultProps !== undefined) {
                      // Resolve default props
                      props[propName] = defaultProps[propName];
                    } else {
                      props[propName] = config[propName];
                    }
                  }
                }
              }

              // Children can be more than one argument, and those are transferred onto
              // the newly allocated props object.
              var childrenLength = arguments.length - 2;
              if (childrenLength === 1) {
                props.children = children;
              } else if (childrenLength > 1) {
                var childArray = Array(childrenLength);
                for (var i = 0; i < childrenLength; i++) {
                  childArray[i] = arguments[i + 2];
                }
                props.children = childArray;
              }

              return ReactElement(element.type, key, ref, self, source, owner, props);
            }

            /**
             * Verifies the object is a ReactElement.
             * See https://reactjs.org/docs/react-api.html#isvalidelement
             * @param {?object} object
             * @return {boolean} True if `object` is a ReactElement.
             * @final
             */
            function isValidElement(object) {
              return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
            }

            var SEPARATOR = '.';
            var SUBSEPARATOR = ':';

            /**
             * Escape and wrap key so it is safe to use as a reactid
             *
             * @param {string} key to be escaped.
             * @return {string} the escaped key.
             */
            function escape(key) {
              var escapeRegex = /[=:]/g;
              var escaperLookup = {
                '=': '=0',
                ':': '=2'
              };
              var escapedString = ('' + key).replace(escapeRegex, function (match) {
                return escaperLookup[match];
              });

              return '$' + escapedString;
            }

            /**
             * TODO: Test that a single child and an array with one item have the same key
             * pattern.
             */

            var didWarnAboutMaps = false;

            var userProvidedKeyEscapeRegex = /\/+/g;
            function escapeUserProvidedKey(text) {
              return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
            }

            var POOL_SIZE = 10;
            var traverseContextPool = [];
            function getPooledTraverseContext(mapResult, keyPrefix, mapFunction, mapContext) {
              if (traverseContextPool.length) {
                var traverseContext = traverseContextPool.pop();
                traverseContext.result = mapResult;
                traverseContext.keyPrefix = keyPrefix;
                traverseContext.func = mapFunction;
                traverseContext.context = mapContext;
                traverseContext.count = 0;
                return traverseContext;
              } else {
                return {
                  result: mapResult,
                  keyPrefix: keyPrefix,
                  func: mapFunction,
                  context: mapContext,
                  count: 0
                };
              }
            }

            function releaseTraverseContext(traverseContext) {
              traverseContext.result = null;
              traverseContext.keyPrefix = null;
              traverseContext.func = null;
              traverseContext.context = null;
              traverseContext.count = 0;
              if (traverseContextPool.length < POOL_SIZE) {
                traverseContextPool.push(traverseContext);
              }
            }

            /**
             * @param {?*} children Children tree container.
             * @param {!string} nameSoFar Name of the key path so far.
             * @param {!function} callback Callback to invoke with each child found.
             * @param {?*} traverseContext Used to pass information throughout the traversal
             * process.
             * @return {!number} The number of children in this subtree.
             */
            function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
              var type = typeof children;

              if (type === 'undefined' || type === 'boolean') {
                // All of the above are perceived as null.
                children = null;
              }

              var invokeCallback = false;

              if (children === null) {
                invokeCallback = true;
              } else {
                switch (type) {
                  case 'string':
                  case 'number':
                    invokeCallback = true;
                    break;
                  case 'object':
                    switch (children.$$typeof) {
                      case REACT_ELEMENT_TYPE:
                      case REACT_PORTAL_TYPE:
                        invokeCallback = true;
                    }
                }
              }

              if (invokeCallback) {
                callback(traverseContext, children,
                // If it's the only child, treat the name as if it was wrapped in an array
                // so that it's consistent if the number of children grows.
                nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
                return 1;
              }

              var child = void 0;
              var nextName = void 0;
              var subtreeCount = 0; // Count of children found in the current subtree.
              var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

              if (Array.isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                  child = children[i];
                  nextName = nextNamePrefix + getComponentKey(child, i);
                  subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
                }
              } else {
                var iteratorFn = getIteratorFn(children);
                if (typeof iteratorFn === 'function') {
                  {
                    // Warn about using Maps as children
                    if (iteratorFn === children.entries) {
                      !didWarnAboutMaps ? warning$1(false, 'Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.') : void 0;
                      didWarnAboutMaps = true;
                    }
                  }

                  var iterator = iteratorFn.call(children);
                  var step = void 0;
                  var ii = 0;
                  while (!(step = iterator.next()).done) {
                    child = step.value;
                    nextName = nextNamePrefix + getComponentKey(child, ii++);
                    subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
                  }
                } else if (type === 'object') {
                  var addendum = '';
                  {
                    addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + ReactDebugCurrentFrame.getStackAddendum();
                  }
                  var childrenString = '' + children;
                  invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum);
                }
              }

              return subtreeCount;
            }

            /**
             * Traverses children that are typically specified as `props.children`, but
             * might also be specified through attributes:
             *
             * - `traverseAllChildren(this.props.children, ...)`
             * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
             *
             * The `traverseContext` is an optional argument that is passed through the
             * entire traversal. It can be used to store accumulations or anything else that
             * the callback might find relevant.
             *
             * @param {?*} children Children tree object.
             * @param {!function} callback To invoke upon traversing each child.
             * @param {?*} traverseContext Context for traversal.
             * @return {!number} The number of children in this subtree.
             */
            function traverseAllChildren(children, callback, traverseContext) {
              if (children == null) {
                return 0;
              }

              return traverseAllChildrenImpl(children, '', callback, traverseContext);
            }

            /**
             * Generate a key string that identifies a component within a set.
             *
             * @param {*} component A component that could contain a manual key.
             * @param {number} index Index that is used if a manual key is not provided.
             * @return {string}
             */
            function getComponentKey(component, index) {
              // Do some typechecking here since we call this blindly. We want to ensure
              // that we don't block potential future ES APIs.
              if (typeof component === 'object' && component !== null && component.key != null) {
                // Explicit key
                return escape(component.key);
              }
              // Implicit key determined by the index in the set
              return index.toString(36);
            }

            function forEachSingleChild(bookKeeping, child, name) {
              var func = bookKeeping.func,
                  context = bookKeeping.context;

              func.call(context, child, bookKeeping.count++);
            }

            /**
             * Iterates through children that are typically specified as `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
             *
             * The provided forEachFunc(child, index) will be called for each
             * leaf child.
             *
             * @param {?*} children Children tree container.
             * @param {function(*, int)} forEachFunc
             * @param {*} forEachContext Context for forEachContext.
             */
            function forEachChildren(children, forEachFunc, forEachContext) {
              if (children == null) {
                return children;
              }
              var traverseContext = getPooledTraverseContext(null, null, forEachFunc, forEachContext);
              traverseAllChildren(children, forEachSingleChild, traverseContext);
              releaseTraverseContext(traverseContext);
            }

            function mapSingleChildIntoContext(bookKeeping, child, childKey) {
              var result = bookKeeping.result,
                  keyPrefix = bookKeeping.keyPrefix,
                  func = bookKeeping.func,
                  context = bookKeeping.context;


              var mappedChild = func.call(context, child, bookKeeping.count++);
              if (Array.isArray(mappedChild)) {
                mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, function (c) {
                  return c;
                });
              } else if (mappedChild != null) {
                if (isValidElement(mappedChild)) {
                  mappedChild = cloneAndReplaceKey(mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
                }
                result.push(mappedChild);
              }
            }

            function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
              var escapedPrefix = '';
              if (prefix != null) {
                escapedPrefix = escapeUserProvidedKey(prefix) + '/';
              }
              var traverseContext = getPooledTraverseContext(array, escapedPrefix, func, context);
              traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
              releaseTraverseContext(traverseContext);
            }

            /**
             * Maps children that are typically specified as `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenmap
             *
             * The provided mapFunction(child, key, index) will be called for each
             * leaf child.
             *
             * @param {?*} children Children tree container.
             * @param {function(*, int)} func The map function.
             * @param {*} context Context for mapFunction.
             * @return {object} Object containing the ordered map of results.
             */
            function mapChildren(children, func, context) {
              if (children == null) {
                return children;
              }
              var result = [];
              mapIntoWithKeyPrefixInternal(children, result, null, func, context);
              return result;
            }

            /**
             * Count the number of children that are typically specified as
             * `props.children`.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrencount
             *
             * @param {?*} children Children tree container.
             * @return {number} The number of children.
             */
            function countChildren(children) {
              return traverseAllChildren(children, function () {
                return null;
              }, null);
            }

            /**
             * Flatten a children object (typically specified as `props.children`) and
             * return an array with appropriately re-keyed children.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
             */
            function toArray(children) {
              var result = [];
              mapIntoWithKeyPrefixInternal(children, result, null, function (child) {
                return child;
              });
              return result;
            }

            /**
             * Returns the first child in a collection of children and verifies that there
             * is only one child in the collection.
             *
             * See https://reactjs.org/docs/react-api.html#reactchildrenonly
             *
             * The current implementation of this function assumes that a single child gets
             * passed without a wrapper, but the purpose of this helper function is to
             * abstract away the particular structure of children.
             *
             * @param {?object} children Child collection structure.
             * @return {ReactElement} The first and only `ReactElement` contained in the
             * structure.
             */
            function onlyChild(children) {
              !isValidElement(children) ? invariant(false, 'React.Children.only expected to receive a single React element child.') : void 0;
              return children;
            }

            function createContext(defaultValue, calculateChangedBits) {
              if (calculateChangedBits === undefined) {
                calculateChangedBits = null;
              } else {
                {
                  !(calculateChangedBits === null || typeof calculateChangedBits === 'function') ? warningWithoutStack$1(false, 'createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits) : void 0;
                }
              }

              var context = {
                $$typeof: REACT_CONTEXT_TYPE,
                _calculateChangedBits: calculateChangedBits,
                // As a workaround to support multiple concurrent renderers, we categorize
                // some renderers as primary and others as secondary. We only expect
                // there to be two concurrent renderers at most: React Native (primary) and
                // Fabric (secondary); React DOM (primary) and React ART (secondary).
                // Secondary renderers store their context values on separate fields.
                _currentValue: defaultValue,
                _currentValue2: defaultValue,
                // Used to track how many concurrent renderers this context currently
                // supports within in a single renderer. Such as parallel server rendering.
                _threadCount: 0,
                // These are circular
                Provider: null,
                Consumer: null
              };

              context.Provider = {
                $$typeof: REACT_PROVIDER_TYPE,
                _context: context
              };

              var hasWarnedAboutUsingNestedContextConsumers = false;
              var hasWarnedAboutUsingConsumerProvider = false;

              {
                // A separate object, but proxies back to the original context object for
                // backwards compatibility. It has a different $$typeof, so we can properly
                // warn for the incorrect usage of Context as a Consumer.
                var Consumer = {
                  $$typeof: REACT_CONTEXT_TYPE,
                  _context: context,
                  _calculateChangedBits: context._calculateChangedBits
                };
                // $FlowFixMe: Flow complains about not setting a value, which is intentional here
                Object.defineProperties(Consumer, {
                  Provider: {
                    get: function () {
                      if (!hasWarnedAboutUsingConsumerProvider) {
                        hasWarnedAboutUsingConsumerProvider = true;
                        warning$1(false, 'Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
                      }
                      return context.Provider;
                    },
                    set: function (_Provider) {
                      context.Provider = _Provider;
                    }
                  },
                  _currentValue: {
                    get: function () {
                      return context._currentValue;
                    },
                    set: function (_currentValue) {
                      context._currentValue = _currentValue;
                    }
                  },
                  _currentValue2: {
                    get: function () {
                      return context._currentValue2;
                    },
                    set: function (_currentValue2) {
                      context._currentValue2 = _currentValue2;
                    }
                  },
                  _threadCount: {
                    get: function () {
                      return context._threadCount;
                    },
                    set: function (_threadCount) {
                      context._threadCount = _threadCount;
                    }
                  },
                  Consumer: {
                    get: function () {
                      if (!hasWarnedAboutUsingNestedContextConsumers) {
                        hasWarnedAboutUsingNestedContextConsumers = true;
                        warning$1(false, 'Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
                      }
                      return context.Consumer;
                    }
                  }
                });
                // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty
                context.Consumer = Consumer;
              }

              {
                context._currentRenderer = null;
                context._currentRenderer2 = null;
              }

              return context;
            }

            function lazy(ctor) {
              return {
                $$typeof: REACT_LAZY_TYPE,
                _ctor: ctor,
                // React uses these fields to store the result.
                _status: -1,
                _result: null
              };
            }

            function forwardRef(render) {
              {
                if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
                  warningWithoutStack$1(false, 'forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
                } else if (typeof render !== 'function') {
                  warningWithoutStack$1(false, 'forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
                } else {
                  !(
                  // Do not warn for 0 arguments because it could be due to usage of the 'arguments' object
                  render.length === 0 || render.length === 2) ? warningWithoutStack$1(false, 'forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.') : void 0;
                }

                if (render != null) {
                  !(render.defaultProps == null && render.propTypes == null) ? warningWithoutStack$1(false, 'forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?') : void 0;
                }
              }

              return {
                $$typeof: REACT_FORWARD_REF_TYPE,
                render: render
              };
            }

            function isValidElementType(type) {
              return typeof type === 'string' || typeof type === 'function' ||
              // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
              type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
            }

            function memo(type, compare) {
              {
                if (!isValidElementType(type)) {
                  warningWithoutStack$1(false, 'memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
                }
              }
              return {
                $$typeof: REACT_MEMO_TYPE,
                type: type,
                compare: compare === undefined ? null : compare
              };
            }

            /**
             * ReactElementValidator provides a wrapper around a element factory
             * which validates the props passed to the element. This is intended to be
             * used only in DEV and could be replaced by a static type checker for languages
             * that support it.
             */

            var propTypesMisspellWarningShown = void 0;

            {
              propTypesMisspellWarningShown = false;
            }

            function getDeclarationErrorAddendum() {
              if (ReactCurrentOwner.current) {
                var name = getComponentName(ReactCurrentOwner.current.type);
                if (name) {
                  return '\n\nCheck the render method of `' + name + '`.';
                }
              }
              return '';
            }

            function getSourceInfoErrorAddendum(elementProps) {
              if (elementProps !== null && elementProps !== undefined && elementProps.__source !== undefined) {
                var source = elementProps.__source;
                var fileName = source.fileName.replace(/^.*[\\\/]/, '');
                var lineNumber = source.lineNumber;
                return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
              }
              return '';
            }

            /**
             * Warn if there's no key explicitly set on dynamic arrays of children or
             * object keys are not valid. This allows us to keep track of children between
             * updates.
             */
            var ownerHasKeyUseWarning = {};

            function getCurrentComponentErrorInfo(parentType) {
              var info = getDeclarationErrorAddendum();

              if (!info) {
                var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
                if (parentName) {
                  info = '\n\nCheck the top-level render call using <' + parentName + '>.';
                }
              }
              return info;
            }

            /**
             * Warn if the element doesn't have an explicit key assigned to it.
             * This element is in an array. The array could grow and shrink or be
             * reordered. All children that haven't already been validated are required to
             * have a "key" property assigned to it. Error statuses are cached so a warning
             * will only be shown once.
             *
             * @internal
             * @param {ReactElement} element Element that requires a key.
             * @param {*} parentType element's parent's type.
             */
            function validateExplicitKey(element, parentType) {
              if (!element._store || element._store.validated || element.key != null) {
                return;
              }
              element._store.validated = true;

              var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
              if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
                return;
              }
              ownerHasKeyUseWarning[currentComponentErrorInfo] = true;

              // Usually the current owner is the offender, but if it accepts children as a
              // property, it may be the creator of the child that's responsible for
              // assigning it a key.
              var childOwner = '';
              if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
                // Give the component that originally created this child.
                childOwner = ' It was passed a child from ' + getComponentName(element._owner.type) + '.';
              }

              setCurrentlyValidatingElement(element);
              {
                warning$1(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.', currentComponentErrorInfo, childOwner);
              }
              setCurrentlyValidatingElement(null);
            }

            /**
             * Ensure that every element either is passed in a static location, in an
             * array with an explicit keys property defined, or in an object literal
             * with valid key property.
             *
             * @internal
             * @param {ReactNode} node Statically passed child of any type.
             * @param {*} parentType node's parent's type.
             */
            function validateChildKeys(node, parentType) {
              if (typeof node !== 'object') {
                return;
              }
              if (Array.isArray(node)) {
                for (var i = 0; i < node.length; i++) {
                  var child = node[i];
                  if (isValidElement(child)) {
                    validateExplicitKey(child, parentType);
                  }
                }
              } else if (isValidElement(node)) {
                // This element was passed in a valid location.
                if (node._store) {
                  node._store.validated = true;
                }
              } else if (node) {
                var iteratorFn = getIteratorFn(node);
                if (typeof iteratorFn === 'function') {
                  // Entry iterators used to provide implicit keys,
                  // but now we print a separate warning for them later.
                  if (iteratorFn !== node.entries) {
                    var iterator = iteratorFn.call(node);
                    var step = void 0;
                    while (!(step = iterator.next()).done) {
                      if (isValidElement(step.value)) {
                        validateExplicitKey(step.value, parentType);
                      }
                    }
                  }
                }
              }
            }

            /**
             * Given an element, validate that its props follow the propTypes definition,
             * provided by the type.
             *
             * @param {ReactElement} element
             */
            function validatePropTypes(element) {
              var type = element.type;
              var name = void 0,
                  propTypes = void 0;
              if (typeof type === 'function') {
                // Class or function component
                name = type.displayName || type.name;
                propTypes = type.propTypes;
              } else if (typeof type === 'object' && type !== null && type.$$typeof === REACT_FORWARD_REF_TYPE) {
                // ForwardRef
                var functionName = type.render.displayName || type.render.name || '';
                name = type.displayName || (functionName !== '' ? 'ForwardRef(' + functionName + ')' : 'ForwardRef');
                propTypes = type.propTypes;
              } else {
                return;
              }
              if (propTypes) {
                setCurrentlyValidatingElement(element);
                checkPropTypes(propTypes, element.props, 'prop', name, ReactDebugCurrentFrame.getStackAddendum);
                setCurrentlyValidatingElement(null);
              } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
                propTypesMisspellWarningShown = true;
                warningWithoutStack$1(false, 'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
              }
              if (typeof type.getDefaultProps === 'function') {
                !type.getDefaultProps.isReactClassApproved ? warningWithoutStack$1(false, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : void 0;
              }
            }

            /**
             * Given a fragment, validate that it can only be provided with fragment props
             * @param {ReactElement} fragment
             */
            function validateFragmentProps(fragment) {
              setCurrentlyValidatingElement(fragment);

              var keys = Object.keys(fragment.props);
              for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key !== 'children' && key !== 'key') {
                  warning$1(false, 'Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);
                  break;
                }
              }

              if (fragment.ref !== null) {
                warning$1(false, 'Invalid attribute `ref` supplied to `React.Fragment`.');
              }

              setCurrentlyValidatingElement(null);
            }

            function createElementWithValidation(type, props, children) {
              var validType = isValidElementType(type);

              // We warn in this case but don't throw. We expect the element creation to
              // succeed and there will likely be errors in render.
              if (!validType) {
                var info = '';
                if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
                  info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
                }

                var sourceInfo = getSourceInfoErrorAddendum(props);
                if (sourceInfo) {
                  info += sourceInfo;
                } else {
                  info += getDeclarationErrorAddendum();
                }

                var typeString = void 0;
                if (type === null) {
                  typeString = 'null';
                } else if (Array.isArray(type)) {
                  typeString = 'array';
                } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
                  typeString = '<' + (getComponentName(type.type) || 'Unknown') + ' />';
                  info = ' Did you accidentally export a JSX literal instead of a component?';
                } else {
                  typeString = typeof type;
                }

                warning$1(false, 'React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
              }

              var element = createElement.apply(this, arguments);

              // The result can be nullish if a mock or a custom function is used.
              // TODO: Drop this when these are no longer allowed as the type argument.
              if (element == null) {
                return element;
              }

              // Skip key warning if the type isn't valid since our key validation logic
              // doesn't expect a non-string/function type and can throw confusing errors.
              // We don't want exception behavior to differ between dev and prod.
              // (Rendering will throw with a helpful message and as soon as the type is
              // fixed, the key warnings will appear.)
              if (validType) {
                for (var i = 2; i < arguments.length; i++) {
                  validateChildKeys(arguments[i], type);
                }
              }

              if (type === REACT_FRAGMENT_TYPE) {
                validateFragmentProps(element);
              } else {
                validatePropTypes(element);
              }

              return element;
            }

            function createFactoryWithValidation(type) {
              var validatedFactory = createElementWithValidation.bind(null, type);
              validatedFactory.type = type;
              // Legacy hook: remove it
              {
                Object.defineProperty(validatedFactory, 'type', {
                  enumerable: false,
                  get: function () {
                    lowPriorityWarning$1(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');
                    Object.defineProperty(this, 'type', {
                      value: type
                    });
                    return type;
                  }
                });
              }

              return validatedFactory;
            }

            function cloneElementWithValidation(element, props, children) {
              var newElement = cloneElement.apply(this, arguments);
              for (var i = 2; i < arguments.length; i++) {
                validateChildKeys(arguments[i], newElement.type);
              }
              validatePropTypes(newElement);
              return newElement;
            }

            var React = {
              Children: {
                map: mapChildren,
                forEach: forEachChildren,
                count: countChildren,
                toArray: toArray,
                only: onlyChild
              },

              createRef: createRef,
              Component: Component,
              PureComponent: PureComponent,

              createContext: createContext,
              forwardRef: forwardRef,
              lazy: lazy,
              memo: memo,

              Fragment: REACT_FRAGMENT_TYPE,
              StrictMode: REACT_STRICT_MODE_TYPE,
              Suspense: REACT_SUSPENSE_TYPE,

              createElement: createElementWithValidation,
              cloneElement: cloneElementWithValidation,
              createFactory: createFactoryWithValidation,
              isValidElement: isValidElement,

              version: ReactVersion,

              __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternals
            };

            {
              React.unstable_ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
              React.unstable_Profiler = REACT_PROFILER_TYPE;
            }



            var React$2 = Object.freeze({
            	default: React
            });

            var React$3 = ( React$2 && React ) || React$2;

            // TODO: decide on the top-level export form.
            // This is hacky but makes it work with both Rollup and Jest.
            var react = React$3.default || React$3;

            module.exports = react;
              })();
            }
            });

            var react = createCommonjsModule(function (module) {

            if (process.env.NODE_ENV === 'production') {
              module.exports = react_production_min;
            } else {
              module.exports = react_development;
            }
            });
            var react_1 = react.Component;

            var classnames = createCommonjsModule(function (module) {
            /*!
              Copyright (c) 2017 Jed Watson.
              Licensed under the MIT License (MIT), see
              http://jedwatson.github.io/classnames
            */
            /* global define */

            (function () {

            	var hasOwn = {}.hasOwnProperty;

            	function classNames () {
            		var classes = [];

            		for (var i = 0; i < arguments.length; i++) {
            			var arg = arguments[i];
            			if (!arg) continue;

            			var argType = typeof arg;

            			if (argType === 'string' || argType === 'number') {
            				classes.push(arg);
            			} else if (Array.isArray(arg) && arg.length) {
            				var inner = classNames.apply(null, arg);
            				if (inner) {
            					classes.push(inner);
            				}
            			} else if (argType === 'object') {
            				for (var key in arg) {
            					if (hasOwn.call(arg, key) && arg[key]) {
            						classes.push(key);
            					}
            				}
            			}
            		}

            		return classes.join(' ');
            	}

            	if (module.exports) {
            		classNames.default = classNames;
            		module.exports = classNames;
            	} else {
            		window.classNames = classNames;
            	}
            }());
            });

            const _jsxFileName = "/Users/logan/Dev/apps/tiles-max/clock/tile/tile.js";
            const outerSize = 234; //tile size
            const innerSize = 218; //clock size

            //polar to cartesian
            var ptc = function(r, theta) {
              return {
                x: r * Math.cos(theta),
                y: r * Math.sin(theta)
              }
            };

            class Clock extends react_1 {

              constructor(props) {
                super(props);
                this.animate = this.animate.bind(this);
                this.hourHand = this.hourHand.bind(this);
                this.minuteHand = this.minuteHand.bind(this);
                this.secondHand = this.secondHand.bind(this);

              }

              componentDidMount() {
                this.animate();
              }

              dodecagon(ctx) {
                var points = [];
                //first create array of twelve points
                for(var i = 0; i < 12; i++) {
                  var deg = i * (Math.PI / 6);
                  var p = ptc(innerSize/2, deg);
                  p.x += innerSize/2;
                  p.y += innerSize/2;  
                  points[i] = p;
                }
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for(var i = 1; i < points.length; i++) {
                  ctx.lineTo(points[i].x,points[i].y);
                }
                ctx.closePath();
                ctx.fill();
              }

              hourHand(ctx, time) {
                //get number of minutes in the day so far, this is so hour hand moves gradually
                //  rather than in large ticks
                var mins =  time.getMinutes() + (60 * time.getHours());

                //draw the circle thing in the middle
                ctx.fillStyle = "black";
                ctx.beginPath();
                ctx.arc(innerSize/2, innerSize/2, 5, 0, 2 * Math.PI);
                ctx.fill();

                //draw the actual hour hand
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.moveTo(innerSize/2, innerSize/2);
                var angle = (Math.PI/-2.0) + ((2*Math.PI/(12*60)) * mins);   
                var p = ptc(innerSize*.22, angle);
                p.x += innerSize/2; 
                p.y += innerSize/2;
                ctx.lineTo(p.x,p.y);
                ctx.stroke();
              }

              minuteHand(ctx, time) {
                //number of seconds in the hour so far
                var secs =  time.getSeconds() + (60 * time.getMinutes());
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.moveTo(innerSize/2, innerSize/2);
                var angle = (Math.PI/-2.0) + ((2*Math.PI/(60*60)) * secs);   
                var p = ptc(innerSize*.35, angle);
                p.x += innerSize/2; 
                p.y += innerSize/2;
                ctx.lineTo(p.x,p.y);
                ctx.stroke();

              }

              secondHand(ctx, time) {
                //get number of ms in minute so far
                var secs =  time.getSeconds();

                let middle = {x: innerSize/2, y: innerSize*.75};
                //draw the circle thing in the middle
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(middle.x, middle.y, 5, 0, 2 * Math.PI);
                ctx.fill();

                //draw the actual second hand
                ctx.strokeStyle = "red";
                ctx.beginPath();
                var angle = (Math.PI/-2.0) + ((2*Math.PI/(60)) * secs);   
                var p = ptc(30, angle);
                var p2 = ptc(-10, angle ); //starting point is a little bit off center in the opposite direction
                p.x += middle.x; 
                p.y += middle.y;
                p2.x += middle.x;
                p2.y += middle.y;
                ctx.moveTo(p2.x, p2.y);
                ctx.lineTo(p.x,p.y);
                ctx.stroke();
              }

              animate() {
                var time = new Date();
                //continuously animate
                var c = document.getElementById("clock-canvas");
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, c.width, c.height);
                ctx.save();
                ctx.translate(0.5, 0.5); //forces antialias thus smoothing out jagged lines

                //draw the clock itself
                this.dodecagon(ctx);

                //draw the hands
                this.secondHand(ctx, time);

                this.hourHand(ctx, time);
                this.minuteHand(ctx, time);

                ctx.restore();

                window.requestAnimationFrame(this.animate);
              }

              render() {
                return react.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
                  , react.createElement('canvas', { id: "clock-canvas", width: innerSize, height: innerSize, __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}})
                )
              }
            }

            class ClockTile extends react_1 {

              constructor(props) {
                super(props);
              }

              renderWrapper(child) {
                return (
                  react.createElement('div', { className: "pa2 bg-dark-gray" , style: { width: outerSize, height: outerSize }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}
                    , child
                  )
                );
              }

              render() {
                let data = !!this.props.data ? this.props.data : {};

                return this.renderWrapper((
                  react.createElement(Clock, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 162}})
                ));

              }

            }

            window.clockTile = ClockTile;

            return ClockTile;

}));
