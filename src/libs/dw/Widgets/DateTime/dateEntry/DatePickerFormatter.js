(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "../CommonDateTimeDefaults"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

    var DatePickerDecorator = function () {
        var self = this;

        self.normalizeDate = function (date) {
            return DW.DateTime.normalizeDate(date);
        };

        self.getDate = function (date, keepTime) {
            return date;
        };

        self.getDateTime = function (date, isEmpty) {
            return DW.DateTime.normalizeDate(date);
        },

        self.dispose = function () { };

        return self;
    };

    var DatePickerFormatter = function (options) {
        var options = $.extend({
            gc: {
                fromJSDate: function () { },
                parseDate: function () { }
            },
            getDecorator: function () {
                return new DW.DateTime.DatePickerDecorator();
            } 
        }, options);

        var self = this;

        self.decorator = options.getDecorator();
        self.gc = options.gc;

        self.getLocalizedString = function (date) {
                return date ? self.gc.fromJSDate(date).formatDate() : '';
        };

        self.getJSDate = function (stringValue) {
            var cdate = null;
            try {
                cdate = self.gc.parseDate(null, stringValue);
            }
            catch (err) { }

            return cdate ? self.getDate(self.normalizeDate(cdate.toJSDate())) : null;

        };

        self.getJSDateFromCalendar = function (dates) {
            return dates[0] ? self.getDate(dates[0].toJSDate()) : null;
        };

        //self.getCalendarDateString = function (stringValue) {
        //    return stringValue;
        //};

        self.normalizeDate = function (date) {
            return self.decorator.normalizeDate(date);
        };

        self.getDate = function (date, keepTime) {
            return self.decorator.getDate(date, false);
        };

        self.getDateTime = function (date, isEmpty) {
            return self.decorator.getDateTime(date, isEmpty);
        };

        self.dispose = function () {
            self.decorator.dispose();
        };

        return self;
    };

    $.extend(this.DW.DateTime, {
        DatePickerFormatter: DatePickerFormatter,
        DatePickerDecorator: DatePickerDecorator
    });

}));