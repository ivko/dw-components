(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "./AutocompleteVM"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    
    var AutocompleteListVM = new Class({
        Extends: DW.Disposable,
        Implements: [Options, Events],
        options: {
            onSelectItem: $.noop,
            textValue: function (v) {
                return v;
            }
        },
        initialize: function (options) {
            this.setOptions(options);
            this.selectedIndex = this.addDisposable(ko.observable(-1)),
            this.items = this.addDisposable(this.addDisposable(ko.observableArray()).trackHasItems())
        },
        selectItem: function (item) {
            this.fireEvent('selectItem', [this.textValue(item), item]);
        },
        textValue: function ($data) {
            return this.options.textValue($data);
        }
    });

    $.extend(DW.Autocomplete, {
        AutocompleteListVM: AutocompleteListVM
    });

}));