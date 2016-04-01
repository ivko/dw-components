(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "globalize", "../CommonDateTimeDefaults", "../dateEntry/DatePickerFormatter"], factory);
    } else {
        factory(jQuery, Globalize);
    }
}(function ($) {

    var DateTimePickerDecorator = function () {
        var self = new DW.DateTime.DatePickerDecorator();

        self.normalizeDate = function (date) {
            //for any datetime field and range date field
            return date;
        };

        self.getDateTime = function (date, isEmpty) {
            return date;
        };

        return self;
    };

    var DateTimePickerFormatter = function (options) {
        var options = $.extend({
            getDecorator: function () {
                return new DW.DateTime.DateTimePickerDecorator();
            }
        }, options);

        var self = new DW.DateTime.DatePickerFormatter(options);

        self.globalTimeFormat = DW.DateTime.CommonSettings.globalTimeFormat;

        self.getLocalizedString = function (date) {
                return date ? Globalize.format(date, 'X') : '';

            //var dateValue = "",
            //    timeValue = "";
            //if (date) {
            //    //using Globalize.format(date, f) has some culture date and time pre and postfixes (month names, so on)
            //    dateValue = self.gc.fromJSDate(date).formatDate();
            //    timeValue = Globalize.format(date, 't'); //in case of bg we got time postfix simbol and it would be displayed. TODO: check if $element.val is calc correct despite this
            //}
            //return !dateValue || !timeValue ? "" : dateValue + " " + timeValue; //sets time with bg postfix, datetime ntry ignores it and builds a correct inst obj
        };

        self.getJSDate = function (stringValue) {
            //getJSDate($element.val()) -> val() comming from datetime entry has no bg postfix

            var jsdatetime = null;
            try {
                jsdatetime = Globalize.parseDate(stringValue);

                //var values = stringValue.split(" "),
                //    cdate = self.gc.parseDate(null, values[0]); //get reg calendar date from string
                ////values[0] - date string
                ////values[1] - time string
                ////values[2] - AM/PM or postfix
                //if (cdate && values.length > 1) {
                //    jsdatetime = cdate.toJSDate(), //get js date from calendar date
                //        timeString = values.length == 2 ? values[1] : (values[1] + " " + values[2]), //timeString: "13:30 'x'" or "13:30" or "01:30 PM"
                //        jsTime = Globalize.parseDate(timeString, self.globalTimeFormat); //get js date with correct time ("13:30" or "01:30 PM"), so changing bg date is possible
                //    if (jsTime) {
                //        jsdatetime.setHours(jsTime.getHours());
                //        jsdatetime.setMinutes(jsTime.getMinutes());
                //    }
                //}
            } catch (err) { }

            return jsdatetime;
        };

        self.getJSDateFromCalendar = function (dates, setToday, currentJSDate) {
            var jsDate = null,
              jsCorrectTime = null;

            if (setToday) jsCorrectTime = self.getDate(new Date()); //calendar set today
            else if (!dates[0]) return null; //clear date
            else if (!currentJSDate) return self.getDate(dates[0].toJSDate()); //selecting date on empty entry
            else jsCorrectTime = currentJSDate; //observable //the entry is not empty, so save the time

            if (jsCorrectTime) {
                jsDate = dates[0].toJSDate();

                jsDate.setHours(jsCorrectTime.getHours());
                jsDate.setMinutes(jsCorrectTime.getMinutes());

                return jsDate;
            }
            return null;
        };

        self.getDate = function (date, keepTime) {
            return self.decorator.getDate(date, keepTime);
        };

        //self.getCalendarDateString = function (stringValue) {
        //    return Globalize.format(Globalize.parseDate(stringValue), 'd');
        //};

        return self;
    };

    $.extend(this.DW.DateTime, {
        DateTimePickerFormatter: DateTimePickerFormatter,
        DateTimePickerDecorator: DateTimePickerDecorator
    });

}));