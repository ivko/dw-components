(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "mootools-core","../AutocompleteVM"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var BaseDataProvider = new Class({
        options: {
            data: null,
            filter: false
        },
        initialize: function (options) {
            $.extend(this.options, options);
        },
        _filter: function (items, value) {
            if ($.isFunction(this.options.filter)) {
                items = this.options.filter(items, value);
            }
            return items;
        },
        getData: function (value) {
            return $.Deferred(function (defer) {
                var data = this.options.data;
                if (!data) {
                    defer.resolve([]);
                } else if ($.isArray(data)) {
                    defer.resolve(this._filter(data, value));
                } else {
                    $.when(data(value))
                        .done(function (items) {
                            defer.resolve(this._filter(items, value));
                        }.bind(this))
                        .fail(defer.reject);
                }
            }.bind(this)).promise();
        }
    });

    $.extend(DW.Autocomplete.DataProvider, {
        BaseDataProvider: BaseDataProvider
    });

}));