(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['./global'], factory);
    } else { // Global
        factory();
    }
}(function () {
    var definition = new Class({
        _equal: {},
        initialize: function () {
            Object.append(this._equal, {
                array: this.compareArrays.bind(this),
                object: this.compareObjects.bind(this),
                date: function (a, b) {
                    return a.getTime() === b.getTime();
                },
                regexp: function (a, b) {
                    return a.toString() === b.toString();
                },
                string: function (a, b) {
                    return a.toLowerCase() === b.toLowerCase(); // case insesitive !
                }
            });
            //uncoment to support function as string compare
            //this._equal.fucntion = this._equal.regexp;
        },
        getClass: function (val) {
            return Object.prototype.toString.call(val)
                .match(/^\[object\s(.*)\]$/)[1];
        },
        //Defines the type of the value, extended typeof
        whatis: function (val) {

            if (val === undefined)
                return 'undefined';
            if (val === null)
                return 'null';

            var type = typeof val;

            if (type === 'object')
                type = this.getClass(val).toLowerCase();

            if (type === 'number') {
                if (val.toString().indexOf('.') > 0)
                    return 'float';
                else
                    return 'integer';
            }
            return type;
        },
        compareObjects: function (a, b) {
            if (a === b)
                return true;
            for (var i in a) {
                if (b.hasOwnProperty(i)) {
                    if (!this.equal(a[i], b[i])) return false;
                } else {
                    return false;
                }
            }

            for (var i in b) {
                if (!a.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        },
        compareArrays: function (a, b) {
            if (a === b)
                return true;
            if (a.length !== b.length)
                return false;
            for (var i = 0; i < a.length; i++) {
                if (!this.equal(a[i], b[i])) return false;
            };
            return true;
        },
        /*
        * Are two values equal, deep compare for objects and arrays.
        * @param a {any}
        * @param b {any}
        * @return {boolean} Are equal?
        */
        equal: function (a, b) {
            if (a !== b) {
                var atype = this.whatis(a),
                    btype = this.whatis(b);
                if (atype === btype)
                    return this._equal.hasOwnProperty(atype) ? this._equal[atype](a, b) : a == b;
                return false;
            }
            return true;
        }
    });
    var instance = new definition;
    extend(ns('DW.Utils'), {
        isEqual: instance.equal.bind(instance)
    });
}));
