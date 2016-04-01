(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "../DatePickerBindingHandler", "./DateTimeEntryDefaults","./DateTimePickerFormatter", "jquery.datetimeentry"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var DateTimePickerBindingHandler = function () {
        var self = new DW.DateTime.DatePickerBindingHandler();

        self.getFormatter = function (options) {
            return new DW.DateTime.DateTimePickerFormatter(options);
        };

        self.setEntryDefaults = function () {
            DW.DateTime.setDateTimeEntryDefaults();
        };

        self.enableEntry = function ($element) {
            $element.datetimeEntry({});
        };

        self.disposeEntry = function ($element) {
            $element.datetimeEntry('destroy');
        };

        self.toggleEntry = function ($element, optionsDisabled) {
            $element.datetimeEntry(optionsDisabled ? 'disable' : 'enable');
        };

        self.setEntryValue = function ($element, date) {
            $element.datetimeEntry('setDatetime', date); 
        };

        return self;
    };

    $.extend(this.DW.DateTime, {
        DateTimePickerBindingHandler: DateTimePickerBindingHandler
    });

}));