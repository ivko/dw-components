(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "./DateTimePickerBindingHandler"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var datetimepickerBindingHandlerInstance = new DW.DateTime.DateTimePickerBindingHandler();
    ko.bindingHandlers.datetimepicker = {
        init: datetimepickerBindingHandlerInstance.init.bind(datetimepickerBindingHandlerInstance)
    };
}));