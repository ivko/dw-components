/// TypeScript function for class inheritance
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['jquery', 'knockout', './global', './utils.isEqual', './filteredTemplateEngine'], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var _nextId = 1;
    var isIE = null;

    $.extend(ns('DW.Utils'), {
        isTouch: (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0)),

        isTouchEnabled: function () {
            return DW.Utils.isTouch;
        },

        isIE: (isIE === null ? !!(/trident\/(\d+\.\d+)/i.exec(navigator.userAgent) || [])[1] : isIE),
        isFF: window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,

        EMPTY_GUID: "00000000-0000-0000-0000-000000000000",

        resolvedDeferred: $.Deferred(function (dfd) { dfd.resolve(); }),
        rejectedDeferred: $.Deferred(function (dfd) { dfd.reject(); }),

        resolvedDeferredWithParam: function (param) { return $.Deferred(function (dfd) { dfd.resolve(param); }); },
        rejectedDeferredWithParam: function (param) { return $.Deferred(function (dfd) { dfd.reject(param); }); },

        handleError: function (error, options) {
            if (!error || error.handled) return;

            options = extend({}, {
                show: function (message, html) {
                    if (!toastr)
                        alert(message);
                    else
                        html ? toastr.errorUnsafe("", message) : toastr.error("", message);

                },
                getNoConnectionString: function () {
                    return $R('Error_NoServerConnection');
                }
            },
            options,
            error.displayOptions);

            error.handled = true;

            if (error.statusCode == 0 || error.statusCode >= 403) {
                options.show(options.getNoConnectionString(), options.showHtmlMsg);
            }
            else if (error.message) {
                options.show(error.message, options.showHtmlMsg);
            }
        },

        getPrecision: function (value) {
            var precision = undefined;
            if ($.isNumeric(value)) {
                var isoDec = ".",
                    isoStr = value + "",
                    decPos = isoStr.indexOf(isoDec);
                precision = decPos > 0 ? (isoStr.length - 1 - decPos) : 0;
            }
            return precision;
        },

        // whenAllDone is wrapper around $.when to wait for all tasks, nevertheless if any of the tasks fails.
        // By default $.when rejects, when any of the passed tasks fails and it doesn't wait for the rest to finish.
        // whenAllDone will wait for all tasks. If any fails, whenAllDone will reject, but will wait for the rest and 
        // will pass their results to the reject callbacks, to allow the user to inspect the result according to his wish. 
        // If all tasks finish successfully, resolve callbacks will be executed again passing result from all tasks.
        // whenAllDone also support progress. It will notify any progress callback how many tasks are waited.
        //
        //Input parameters: any amount of deferreds
        //
        whenAllDone: function (/*accept any ammount of deferreds*/) {
            var result = $.Deferred(),
                    failed = false,
                    _arguments = arguments.length && $.isArray(arguments[0]) ? arguments[0] : arguments,
                    num = _arguments.length;

            // wrap all passed tasks to always finish with success, so that $.when waits for all of them
            var deferreds = $.map(_arguments, function (current) {
                var wrapDeferred = $.Deferred();
                current
                    .always(function () {
                        // notify the summary task with progress
                        result.notify(--num);
                    })
                    .done(function (res) {
                        // if done pass the result 
                        wrapDeferred.resolve(res);
                    })
                    .fail(function (error) {
                        // ... respectively if fails, pass the error as result
                        failed = true;
                        wrapDeferred.resolve(error);
                    });
                return wrapDeferred;
            });

            $.when.apply($, deferreds).done(function () {
                // check if any of the tasks has failed and decided if it should reject or resolve
                failed ? result.reject.apply($, arguments) : result.resolve.apply($, arguments);
            });

            return result;
        },

        htmlEncode: function (text) {
            return $('<div />').text(text).html();
        },

        renderTemplate: function (template, context, options) {
            var wrapper = document.createElement('div');
            ko.renderTemplate(template, context, options, wrapper, 'replaceChildren');
            return $(wrapper.children);
        },

        uniqueId: function (postfix) {
            var from = 100000, to = 999999;
            postfix = postfix || '';
            return 'dwuid_' + (new Date()).getTime().toString() + '_' + (from + Math.floor(Math.random() * (to + 1 - from))).toString() + '_' + postfix;
        },

        nextId: function (postfix) {
            postfix = postfix || '';
            return 'dwnid_' + (_nextId++) + '_' + postfix;
        },

        // Returns a function, that, when invoked, will only be triggered at most once
        // during a given window of time. Normally, the throttled function will run
        // as much as it can, without ever going more than once per `wait` duration;
        // but if you'd like to disable the execution on the leading edge, pass
        // `{leading: false}`. To disable execution on the trailing edge, ditto.
        throttle: function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function () {
                var now = Date.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },

        // Returns a function, that, as long as it continues to be invoked, will not
        // be triggered. The function will be called after it stops being called for
        // N milliseconds. If `immediate` is passed, trigger the function on the
        // leading edge, instead of the trailing.
        debounce: function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;

            var later = function () {
                var last = Date.now() - timestamp;

                if (last < wait && last >= 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    }
                }
            };

            return function () {
                context = this;
                args = arguments;
                timestamp = Date.now();
                var callNow = immediate && !timeout;
                if (!timeout) timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }

                return result;
            };
        },

        once: function (func) {
            var ran = false, memo;
            return function () {
                if (ran) return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        },

        wrap: function (func, wrapper) {
            return function () {
                var args = [func];
                Array.prototype.push.apply(args, arguments);
                return wrapper.apply(this, args);
            };
        },

        endsWith: function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        lazyDeferred: function (requestFunction) {
            var dfd = null,
                context;
            return function (/*args*/) {
                context = this;
                var args = Array.prototype.slice.call(arguments);
                if (!dfd) {
                    dfd = $.Deferred(function (defer) {
                        requestFunction.apply(context, [defer].concat(args));
                    }).promise();
                }
                return dfd;
            };
        },

        virtualProxy: function (job, context) {
            var task,
                context = context || this;
            return function (force) {
                if (!task || (force && task.state() != 'pending')) {
                    //create or renew current initializing task 
                    task = $.Deferred();
                    $.when(job.apply(context, Array.prototype.slice.call(arguments)))
                        .then(task.resolve, task.reject);
                }
                return task.promise();
            };
        },

        format: function (source, params) {
            /// <summary>
            /// Replaces {n} placeholders with arguments.
            /// One or more arguments can be passed, in addition to the string template itself, to insert
            /// into the string.
            /// </summary>
            /// <param name="source" type="String">
            /// The string to format.
            /// </param>
            /// <param name="params" type="String">
            /// The first argument to insert, or an array of Strings to insert
            /// </param>
            /// <returns type="String" />
            if (!source) return ""; //make sure there is a string which we'll modify 

            if (!params && params != 0) return source; // if there aren't params to modify the source string, return the source string

            if (arguments.length == 1)
                return function () {
                    var args = $.makeArray(arguments);
                    args.unshift(source);
                    return $.validator.format.apply(this, args);
                };
            if (arguments.length > 2 && params.constructor != Array) {
                params = $.makeArray(arguments).slice(1);
            }

            if ((params || params == 0) && params.constructor != Array) {
                params = [params];
            }
            $.each(params, function (i, n) {
                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
            });
            return source;
        },

        wrapClassParentMethod: function (owner, args) {
            /// <summary>
            /// A helper function which can be used to call 'mootools class' parent method after a delay
            /// </summary>
            /// <param name="owner"></param>
            /// <param name="args"></param>

            //keep initial mootools environment
            var parent = owner.parent,
                initialCaller = owner.caller,
                $initialCaller = owner.$caller;

            return function () {
                //keep current mootools environment since this function could be used in a delay (timeout or deferred)
                var currentCaller = this.caller,
                    $currentCaller = this.$caller;

                //set the initial mootools environment as it was before the delay
                this.caller = initialCaller;
                this.$caller = $initialCaller;

                var result = parent.apply(this, arguments);

                //restore current mootools environment
                this.caller = currentCaller;
                this.$caller = $currentCaller;

                return result;
            }.bind(owner);

            //test: function () {
            //    var parent = DW.Utils.wrapClassParentMethod(this);
            //    return $.Deferred(function (task) {
            //        parent().then(function (res) {
            //            setTimeout(function () {
            //                task.resolve();
            //            }, 1000);
            //        });
            //    }).promise();
            //}
        },

        dateObjectToTimeString: function (dateObject) {
            var d = new Date(dateObject);
            return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();
        },

        //rfc4122 version 4 compliant solution
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        generateIterativeName: function (nameResource, elements) {
            /// <summary>
            ///     Generates iterative names
            /// </summary>
            /// <param name="nameResource" type="String"></param>
            /// <param name="elements" type="Array">array of elements that have property 'Name' or array of names</param>
            /// <returns type="String">the generated name</returns>
            var name = DW.Utils.format(nameResource, 1);

            if (elements && elements.length > 0) {
                name = DW.Utils.format(nameResource, elements.length + 1);

                for (var i = 0, j = elements.length + 1; i < elements.length; i++) {
                    var existingName = typeof elements[i] == 'string' ? elements[i] : elements[i].Name;

                    if (existingName && existingName.indexOf(DW.Utils.format(nameResource, j)) != -1) {
                        name = DW.Utils.format(nameResource, ++j);
                        i = -1;
                    }
                }
            }
            return name;
        },

        copyIterativeName: function (name, namePrefix, nameSufix, elementsWithName) {
            var result = DW.Utils.format(namePrefix, name);

            if (elementsWithName && elementsWithName.length > 0 && elementsWithName[0].Name) {
                var j = 1;
                while (j <= elementsWithName.length) {
                    if (!elementsWithName.find(function (element) { return element.Name == result; }))
                        return result;
                    result = DW.Utils.format(nameSufix, name, ++j);
                }
            }
            return result;
        },

        supportsLocalStorage: function () {
            var res = false;
            try {
                res = 'localStorage' in window && window['localStorage'] !== null;
            }
            catch (e) { }

            if (!res) console.log('No local storage. Please check your browser options.');

            return res;
        },
        supportsSessionLocalStorage: function () {
            var res = false;
            try {
                res = 'sessionStorage' in window && window['sessionStorage'] !== null;
            }
            catch (e) { }

            if (!res) console.log('No session local storage. Please check your browser options.');

            return res;
        },

        isNullOrUndefined: function (obj) {
            return (obj === undefined || obj === null);
        },

        isRealObject: function (obj) {
            if (obj === undefined || obj === null || obj === "") return false;

            //number but not exactly ... the mighty 'NaN'
            if ((typeof obj == 'number' || obj instanceof Number) && !$.isNumeric(obj)) return false;

            //date but not exactly ... the mighty 'Invalid Date'
            if (obj instanceof Date && isNaN(obj)) return false;

            return true;
        },

        dispose: function (obj) {
            if (!obj) return;

            if ($.isFunction(obj.dispose)) {
                return obj.dispose();
            }

            if ($.isArray(obj)) {
                return Array.forEach(obj, DW.Utils.dispose);
            }
        },

        scrollbarSize: { height: 18, width: 18 },

        getScrollbarSize: function () {
            return DW.Utils.scrollbarSize;
        },


        updateLayout: function (rootElement, skipRootElement) {
            /// <summary>Find and update dialog element dimensions within specified element.</summary>
            /// <param name="rootElement" type="Object">Element to search within for dialog or data-dw-resizable elements</param>

            //All layout elements in WebClient are with fixed or auto dimensions, except dialogs!!!

            //Update dialog element dimensions.
            var $rootElement = $(rootElement);
            if ($rootElement.attr('data-dw-resizableDialog') !== undefined) {
                DW.Utils.resizeDialog(rootElement);
            } else if (!skipRootElement) {
                $(rootElement).find("div[data-dw-resizableDialog]").each(function () {
                    DW.Utils.resizeDialog(this);
                });
            }

            //Once dialogs are resized all components around them could be 'auto' resized or repositioned.
            //So check the ones we are interested in.
            setTimeout(function () {
                var triggerDwResize = function ($elem) {

                    var sizeChanged = false,
                        props = [
                            { property: 'height', offset: 'top' },
                            { property: 'width', offset: 'left' }
                        ],
                        data = $elem.data('dw.elementSize') || {};

                    for (var i = 0; i < props.length; i++) {
                        if ($elem[props[i].property]() !== data[props[i].property]) {
                            data[props[i].property] = $elem[props[i].property]();
                            sizeChanged = true;
                        }

                        if ($elem.offset()[props[i].offset] !== data[props[i].offset]) {
                            data[props[i].offset] = $elem.offset()[props[i].offset];
                            sizeChanged = true;//position changed
                        }
                    };

                    // If element size has changed since the last time, store the element
                    // data and trigger the 'resize' event.
                    if (sizeChanged) {
                        $elem.data("dw.elementSize", data);
                        $elem.triggerHandler('dwResize', data);
                    }
                }

                if (!skipRootElement && $rootElement.attr('data-dw-resizable') !== undefined) {
                    triggerDwResize($rootElement);
                }

                $(rootElement).find("*[data-dw-resizable]").each(function () {
                    triggerDwResize($(this));
                });
            }, 0);
        },

        //Update dialog element size and notify for dwResize event
        resizeDialog: function (element) {
            /// <summary>Updates dialog element dimensions and raise a 'dwResize' event for this element</summary>
            /// <param name="element" type="Object">Dialog element</param>

            var $element = $(element);
            var props = [
                    { property: 'height', inner: 'innerHeight', offset: 'offsetTop' },
                    { property: 'width', inner: 'innerWidth', offset: 'offsetLeft' }
            ],
                values = {},
                dialogSize = $element.data('dw.elementSize') || values,
                sizeChanged = false;

            for (var i = 0; i < props.length; i++) {
                var size = $element[props[i].property](),
                    delta = $element[props[i].inner]() - size,
                    value = $element.offsetParent()[props[i].inner]() - element[props[i].offset] - delta;
                if (value === dialogSize[props[i].property]) {
                    continue;
                }
                values[props[i].property] = value;
            };

            $.extend(dialogSize, values);

            $element.data('dw.elementSize', dialogSize);

            for (var property in values) {
                sizeChanged = true;
                // is not necessary to set the width on block-level elements
                if (property == 'width') continue;
                $element[property](values[property]);
            }

            if (sizeChanged) {
                $element.triggerHandler('dwResize');
            }
        },

        execSequentially: function (first /* rest... */) {
            var self = this;
            if (arguments.length === 0) {
                return $.when();
            } else if (arguments.length === 1) {
                return $.when(first.call()).then(function (result) {
                    return (result !== false) ? result : $.Deferred().reject().promise();
                });
            } else {
                var rest = [].slice.call(arguments, 1);
                return DW.Utils.execSequentially(first).then(function () {
                    return DW.Utils.execSequentially.apply(self, rest);
                });
            }
        },

        getFullAddress: function (address) {
            if (address.indexOf("/") !== 0) address = "/" + address;
            return window.location.protocol + "//" + window.location.host + address;
        },


        // registers custom event 'dw.domchange'
        // takes jquery $element
        // subscribtion of: $element.on('dw.domchange', callback);
        registerObserveDomElement : function ($element) {
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

            var eventCallback = function () {
                $element.trigger('dw.domchange', $element);
            };

            if (MutationObserver && !DW.Utils.isFF) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length || mutations[0].attributeName)
                        eventCallback();
                });
                // have the observer observe for changes in children
                obs.observe($element[0], { childList: true, subtree: true, attributes: true, attributeOldValue: true });
                $element.disconnectObserver = obs.disconnect.bind(obs);
            }
            else {
                $element.bind("DOMSubtreeModified", eventCallback);

                $element.disconnectObserver = function () {
                    $element.unbind("DOMSubtreeModified", eventCallback);
                }
            }
        },

        disconnectObserveDomElement: function ($element) {
            if ($element.disconnectObserver) {
                $element.disconnectObserver();
                $element.disconnectObserver = null;
            }
        },

        getNormalizedDate: function (date) {
            if (!date)
                return null;
            return DW.DateTime.normalizeDate(new Date(date.getTime()));
        },

        dwRelationItemTypes: {
            User: 1,
            Role: 2
        },

        strAlphabetCompare: function (str1, str2) {
            //alphabetically sort
            var _str1 = str1.toLowerCase(),
                _str2 = str2.toLowerCase();

            if (_str1 == _str2) {
                //if equal when normalized, continue with comparing the real values
                _str1 = str1;
                _str2 = str2;
            }

            if (_str1 < _str2) return -1;
            if (_str1 > _str2) return 1;
            return 0;
        },

        sortBy: function (arr, prop, dir) {
            var directions = { ASC: 1, DESC: -1 },
                dir = dir || 'ASC';

            return arr.sort(function (item1, item2) {
                return DW.Utils.strAlphabetCompare(item1[prop], item2[prop]) * directions[dir];
            });
        },

        cloneTableRow: function (e, tr) {
            var originals = tr.children(),
                clone = tr.clone().addClass('active'),
                table = tr.closest('table'),
                helper = $('<table />')
                    .addClass(table.attr('class'));

            clone.children().each(function (index) {
                // Set helper cell sizes (without paddings) to match the original sizes
                $(this).width(originals.eq(index).innerWidth());
            });

            $('<tbody />').append(clone).appendTo(helper);

            return helper;
        }
    });

    /* Array prototypes */
    Array.implement({
        limitedResultObject: function (limit) {
            return { more: this.length > limit, result: this.slice(0, limit) };
        },
        alphanumSort: function (sortDir, sortBy, caseInsensitive) {
            if (this.length <= 0) return;

            function setValue(property, value) {
                if ($.isFunction(property)) {
                    property(value);
                }
                else {
                    property = value;
                }
            }

            function getSortResult(x1, x2, direction) {
                // if the two values are null the are equal return 0
                if (x1 == null && x2 == null) return 0;

                if (direction > 0) { // asc

                    if (x1 > x2 || x2 == null) {
                        return 1;
                    } else if (x1 < x2 || x1 == null) {
                        return -1;
                    }
                } else if (direction < 0) { // desc
                    if (x1 < x2 || x1 == null) {
                        return 1;
                    } else if (x1 > x2 || x2 == null) {
                        return -1;
                    }
                }
                return 0;
            };

            // first we iterrate the sorting values split each one into array whenever there's number
            for (var z = 0; z < this.length ; z++) {
                var t = ko.unwrap(this[z][sortBy]);

                if (t == null || typeof t != 'string') {
                    //t = [t]; 
                    //setValue(this[z][sortBy], [t]);// make it array anyway and set the value.
                    continue;
                }

                t = t.split(/(\d+)/);
                setValue(this[z][sortBy], t);
            }

            this.sort(function (a, b) {
                var val1 = ko.unwrap(a[sortBy]),
                    val2 = ko.unwrap(b[sortBy]);

                // if the values are not strings, we have to do simple comparison
                if ((typeof val1 != 'string' && !$.isArray(val1)) || val1 == null ||
                    (typeof val2 != 'string' && !$.isArray(val2)) || val2 == null)
                    return getSortResult($.isArray(val1) ? val1.join("") : val1, $.isArray(val2) ? val2.join("") : val2, sortDir);

                // take the maximum length from both values and iterrate by it.
                for (var x = 0; x < Math.max(val1.length, val2.length) ; x++) {
                    var aa = caseInsensitive && val1[x] ? val1[x].toLowerCase() : val1[x],
                        bb = caseInsensitive && val2[x] ? val2[x].toLowerCase() : val2[x];

                    if (aa !== bb) {
                        var c = Number(aa), d = Number(bb);
                        if (c == aa && d == bb) { // if it is number compare them as numbers ...
                            return getSortResult(c, d, sortDir);
                        } else return getSortResult(aa, bb, sortDir);// ... if not compare the strings
                    }
                }
                return a.length - b.length;
            });

            // finally we join the splitted earlier values back into one string
            for (var z = 0; z < this.length; z++) {
                var v = ko.unwrap(this[z][sortBy]);

                if (v == null || v == 'undefined' || !$.isArray(v))
                    continue;

                setValue(this[z][sortBy], v.join(""));
            }
        },
        containsDuplicatedValues: function () {
            this.sort();
            for (var i = 1; i < this.length; i++) {
                if (this[i - 1] == this[i])
                    return true;
            }
            return false;
        },
        unique: function (prop) {
            var a = this.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i][prop]) {
                        if (a[i][prop] === a[j][prop])
                            a.splice(j--, 1);
                    }
                    else {
                        if (a[i]=== a[j])
                            a.splice(j--, 1);
                    }
                }
            }
            return a;
        }

    });
}));