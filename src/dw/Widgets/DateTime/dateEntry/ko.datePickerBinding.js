(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "../DatePickerBindingHandler"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var datepickerBindingHandlerInstance = new DW.DateTime.DatePickerBindingHandler();
    ko.bindingHandlers.datepicker = {
        init: datepickerBindingHandlerInstance.init.bind(datepickerBindingHandlerInstance)
    };


    //$.effects.effect.datepickerVisibility = function (options, callback) {
    //    var widget = $(this);

    //    if (options.mode == 'hide') {
    //        // Hide
    //        var scroll = widget.data('scroll');
    //        if (scroll) {
    //            widget.data('scroll', null);
    //            scroll.off('scroll.datepicker');
    //        }
    //        widget.hide('fade', options.complete, options.duration);
    //    } else {
    //        // Show
    //        var input = $($.datepicker._lastInput);
    //        var scroll = input.closest('.scroll-wrapper');
    //        if (scroll) {
    //            scroll.on('scroll.datepicker', function () {
    //                this.datepicker("hide").blur();
    //            }.bind(input));
    //            widget.data('scroll', scroll);
    //        }
    //        widget.show('fade', options.duration);
    //    }
    //    callback.call();
    //};
}));