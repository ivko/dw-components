(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "./CommonDateTimeDefaults"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var DatePickerRangeDecorator = function () {
        var self = new DW.DateTime.DateTimePickerDecorator();

        self.getDate = function (date, keepTime) {
            return self.getRangeValue(date, keepTime);
        };

        self.getRangeValue = function (date, keepTime) {
            //Implement in children
            return date;
        };

        return self;
    };


    var DatePickerRangeFromDecorator = function () {
        var self = new DatePickerRangeDecorator();

        self.getRangeValue = function (date, keepTime) {
            if (keepTime)
                return date;
            return DW.DateTime.getRangeStartDate(date);
        };

        self.getDateTime = function (date, isEmpty) {
            if (isEmpty) {
                return self.getRangeValue(date);
            }
            return date;
        };

        return self;
    };


    var DatePickerRangeToDecorator = function () {
        var self = new DatePickerRangeDecorator();

        self.getRangeValue = function (date, keepTime) {
            if (keepTime)
                return DW.DateTime.getDateTimeRangeEnd(date);
            return DW.DateTime.getRangeEndDate(date);
        };

        self.getDateTime = function (date, isEmpty) {
            if (isEmpty)
                return self.getRangeValue(date);
            //set at least the seconds
            return DW.DateTime.getDateTimeRangeEnd(date);
        };

        return self;
    };


    $.extend(this.DW.DateTime, {
        DatePickerRangeDecorator: DatePickerRangeDecorator,
        DatePickerRangeFromDecorator: DatePickerRangeFromDecorator,
        DatePickerRangeToDecorator: DatePickerRangeToDecorator
    });

}));