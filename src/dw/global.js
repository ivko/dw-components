(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(['jquery', 'knockout', 'mootools-core', 'mootools-interfaces'], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    $.fn.exists = function () {
        return this.length !== 0;
    };

    /* Array prototypes */
    Array.implement({

        indexOf: function (item, from) {
            var length = this.length >>> 0;
            for (var i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (this[i] === item) return i;
            }
            return -1;
        },

        contains: function (item, from) {
            return this.indexOf(item, from) != -1;
        },

        include: function (item) {
            if (!this.contains(item)) this.push(item);
            return this;
        },

        chunk: function (size) {
            var x,
                i = 0,
                c = -1,
                l = this.length || 0,
                n = [];

            if (size < 1) {
                return null;
            }

            while (i < l) {
                (x = i % size) ? n[c][x] = this[i] : n[++c] = [this[i]];
                i++;
            }
            return n;
        },

        move: function (old_index, new_index) {
            while (old_index < 0) {
                old_index += this.length;
            }
            while (new_index < 0) {
                new_index += this.length;
            }
            if (new_index >= this.length) {
                var k = new_index - this.length;
                while ((k--) + 1) {
                    this.push(undefined);
                }
            }
            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
            return this;
        },

        unique: function () {
            return [].combine(this);
        },

        find: function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this),
                length = list.length >>> 0,
                thisArg = arguments[1],
                value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        },

        filterMap: function (filterPredicate, mapPredicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof filterPredicate !== 'function') {
                throw new TypeError('filterPredicate must be a function');
            }
            if (typeof mapPredicate !== 'function') {
                throw new TypeError('mapPredicate must be a function');
            }
            var list = Object(this),
                length = list.length >>> 0,
                thisArg = arguments[2],
                res = [], value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (filterPredicate.call(thisArg, value, i, list)) {
                    res.push(mapPredicate.call(thisArg, value, i, list));
                }
            }
            return res;
        }
    });

    /* String prototypes */
    String.implement({
        toBoolean: function () {
            switch (this.toLowerCase()) {
                case "true": case "yes": case "1": return true;
                case "false": case "no": case "0": case null: return false;
                default: return Boolean(this);
            }
        },
        splice: function (idx, rem, s) {
            return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
        },
        startsWith: function (str) {
            return this.indexOf(str) == 0;
        }
    });

    // Avoid `console` errors in browsers that lack a console.
    (function () {
        var method;
        var noop = function () { };
        var methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        var length = methods.length;
        var console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];

            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }
    }());

    // extend a given object with all the properties in passed-in object(s).
    window.extend = function (obj) {
        var type = typeof obj,
            isObject = type === 'function' || type === 'object' && !!obj;
        if (!isObject) return obj;
        var source, prop;
        for (var i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    };

    // define namespace starting from global object
    window.ns = window.namespace = function (namespace) {
        return (namespace || '').split('.').reduce(function (ns, fragment) {
            return ns[fragment] || Object.defineProperty(ns, fragment, {
                value: {},
                writable: false,
                enumerable: true,
                configurable: false
            })[fragment];
        }, this);
    };

    window.$R = function (res) {
        return res || '';
    };

}));
