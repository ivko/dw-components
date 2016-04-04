(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "../../BindingHandler", "./AutocompleteVM", "./AutocompleteBehavior", "./DataProvider/BaseDataProvider"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    
    var autocompleteMenu = new Class({
        Extends: BindingHandler,
        options: {
            enabled: true,
            data: {},
            viewModelOptions: {
                lists: []
            }
        },
        components: {
            Behavior: DW.Autocomplete.AutocompleteBehavior,
            ViewModel: DW.Autocomplete.AutocompleteVM
        },
        viewModelOptions: function ($data, params) {
            return params;
        },
        viewModelFactory: function ($data, params) {
            return new this.components.ViewModel(this.viewModelOptions($data, params));
        },
        createOptions: function (options) {

            options = $.extend(true, {}, this.options, options);
            
            if (typeof options.createViewModel !== 'function') {
                $.extend(options, {
                    createViewModel: this.viewModelFactory.bind(this, options.data, options.viewModelOptions)
                });
            }

            return options;
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            
            var options = this.createOptions(ko.unwrap(valueAccessor()));
            var behaviour = new this.components.Behavior(element, options);
            
            ko.computed({
                read: function () {
                    var enabled = ko.utils.unwrapObservable(options.enabled);
                    this[enabled ? 'activate' : 'deactivate']();
                },
                disposeWhenNodeIsRemoved: element,
                owner: behaviour
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {behaviour.dispose()});
        }
    });

    $.extend(DW.Autocomplete.BindingHandler, {
        autocompleteMenu: autocompleteMenu
    });
    
    ko.bindingHandlers.autocompleteMenu = new autocompleteMenu();
}));