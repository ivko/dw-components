(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(['jquery', '../utils'], factory);
    } else { // Global
        factory(jQuery);
    }
}(function ($) {
    var dispose = function (obj) {
        if (!obj) return;
        if ($.isFunction(obj.dispose)) {
            obj.dispose();
        } else if ($.isArray(obj)) {
            obj.forEach(dispose);
        }
    };

    var Disposable = new Class({
        disposables: [],
        _disposableTasks: [],
        disposed: false,

        initialize: function () {
        },

        addDisposable: function (disposable) {
            this.disposables.push(disposable);
            return disposable;
        },

        removeDisposable: function (disposable) {
            var index = this.disposables.indexOf(disposable);
            if (index >= 0) {
                this.disposables.splice(index, 1);
            }
            return disposable;
        },

        addDisposableTask: function (task) {
            var dfd = $.Deferred();
            this._disposableTasks.push(dfd);
            dfd.always(function () {
                this._disposableTasks.erase(dfd);
            }.bind(this));
            $.when(task)
                .progress(dfd.notify)
                .done(dfd.resolve)
                .fail(dfd.reject)
            return dfd.promise();
        },

        dispose: function () {
            if (!this.hasOwnProperty('disposables')) return;
            dispose(this.disposables);
            //create new array, so it can be iterate safly
            this._disposableTasks
                .map(function (task) {
                    return task;
                })
                .forEach(function (task) {
                    task.reject({
                        canceled: true
                    });
                });

            delete this._disposableTasks;
            delete this.disposables;
        }
    });
    Disposable.dispose = dispose;
    $.extend(ns('DW'), { Disposable: Disposable });
}));
