(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "globalize", "./CommonDateTimeDefaults", "./dateEntry/DateEntryDefaults", "./DatePickerRangeDecorators", "./calendars/js/CalendarPickerDefaults"], factory);
    } else { // Global
        factory(jQuery, ko, Globalize);
    }
}(function ($, ko, Globalize) {

    var BaseDatePickerBindingHandler = function () {
        var self = this;

        self.init = function (element, valueAccessor, allBindingsAccessor) {
            DW.DateTime.setCalendarPickerDefaults();
            self.setEntryDefaults();
        };

        self.getFormatter = function (options) {
            return new DW.DateTime.DatePickerFormatter(options);
        };

        self.getFormatterOptions = function (gc, isRangeStartDate, isRangeEndDate) {
            var isRangeEndDate = isRangeEndDate || false;

            return $.extend({ gc: gc }, (!isRangeStartDate && !isRangeEndDate) ? null : {
                getDecorator: function () {
                    if (isRangeEndDate)
                        return new DW.DateTime.DatePickerRangeToDecorator();
                    return new DW.DateTime.DatePickerRangeFromDecorator();
                }
            });
        },

        self.setEntryDefaults = function () {
            DW.DateTime.setDateEntryDefaults();
        };

        return self;
    };

    $.extend(this.DW.DateTime, {
        BaseDatePickerBindingHandler: BaseDatePickerBindingHandler
    });
}));