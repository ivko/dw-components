(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "globalize", "../CommonDateTimeDefaults", "jquery.datetimeentry"], factory);
    } else {
        factory(jQuery, Globalize);
    }
}(function ($, Globalize) {

    var dateTimeEntryDefaults = null,
        setDateTimeEntryDefaults = function (options) {

            if (dateTimeEntryDefaults) return;

            var culture = Globalize.culture(),
                settings = DW.DateTime.getCommonDateTimeDefaults(options),
                buildDateTimePluginsFormat = function (regCalendar) {
                    var pattern = regCalendar.patterns.X || "MM/dd/yyyy h:mm tt",
                        dateSeparator = settings.dateSeparator,
                        timeSeparator = settings.timeSeparator,
                        dateTimeSeparator = " ",
                        dateToken = [],
                        timeToken = [],
                        datetime = pattern.split(dateTimeSeparator);

                    //datetime[0] - date part
                    //datetime[1] - time part
                    //datetime[2] - am/pm if any

                    if (dateSeparator) {
                        datetime[0].split(dateSeparator).forEach(function (token) {
                            $.each({
                                'dddd': 'W', 'ddd': 'w', 'dd': 'D', 'd': 'd',
                                'MMMM': 'N', 'MMM': 'n', 'MM': 'O', 'M': 'o',
                                'yyyy': 'Y', 'yy': 'y'
                            }, function (key, value) {
                                if (token.indexOf(key) >= 0) {
                                    dateToken.push(value);
                                    return false;
                                }
                            });
                        });
                    }
                    var dateFormat = dateToken.length < 3 ? 'O/D/Y' : dateToken.join(dateSeparator);

                    datetime[1].split(timeSeparator).forEach(function (token) {
                        $.each({
                            'hh': 'H', 'h': 'h', 'HH': 'H', 'H': 'h',
                            'mm': 'M', 'm': 'm',
                            'ss': 'S', 's': 's'
                        }, function (key, value) {
                            if (token.indexOf(key) >= 0) {
                                timeToken.push(value);
                                return false;
                            }
                        });
                    });

                    var timeFormat = timeToken.length < 2 ? 'H:M' : timeToken.join(timeSeparator);

                    if (datetime.length == 3) {
                        // use AM/PM
                        timeFormat = timeFormat + " a";
                    }

                    return dateFormat + dateTimeSeparator + timeFormat;


                    //var datePattern = settings.datePattern, // short date	
                    //    timePattern = "";
                    //if (regCalendar.patterns.t) {
                    //    timePattern = regCalendar.patterns.t  //short time
                    //}
                    //else {
                    //    var index = regCalendar.patterns.f.indexOf('h');
                    //    if (index < 0) index = regCalendar.patterns.f.indexOf('H');
                    //    if (index >= 0)
                    //        timePattern = regCalendar.patterns.f.substr(index);
                    //}

                    //var dateSeparator = settings.dateSeparator,
                    //    dateToken = [], timeToken = [];

                    //if (dateSeparator) {
                    //    datePattern.split(dateSeparator).forEach(function (token) {
                    //        $.each({
                    //            'dddd': 'W', 'ddd': 'w', 'dd': 'D', 'd': 'd',
                    //            'MMMM': 'N', 'MMM': 'n', 'MM': 'O', 'M': 'o',
                    //            'yyyy': 'Y', 'yy': 'y'
                    //        }, function (key, value) {
                    //            if (token.indexOf(key) >= 0) {
                    //                dateToken.push(value);
                    //                return false;
                    //            }
                    //        });
                    //    });
                    //}
                    //if (dateToken.length < 3) {
                    //    console.warn('Using default date format');
                    //}
                    //var dateFormat = dateToken.length < 3 ? 'O/D/Y' : dateToken.join(dateSeparator);

                    //var time = timePattern.split(' '), //"hh:mm tt" -> ["hh:mm"], ["tt"] ///  "HH:mm 'ч.'" -> ["HH:mm"], ['ч.']
                    //    globalTimeFormat = "";

                    //time[0].split(settings.timeSeparator).forEach(function (token) {
                    //    $.each({
                    //        'hh': 'H', 'h': 'h', 'HH': 'H', 'H': 'h',
                    //        'mm': 'M', 'm': 'm',
                    //        'ss': 'S', 's': 's'
                    //    }, function (key, value) {
                    //        if (token.indexOf(key) >= 0) {
                    //            timeToken.push(value);
                    //            return false;
                    //        }
                    //    });
                    //});
                    //var timeFormat = timeToken.length < 2 ? 'H:M' : timeToken.join(settings.timeSeparator);
                    //globalTimeFormat = time[0];
                    //if (time[1] && (time[1] == 'tt' || time[1] == 't')) {
                    //    // use AM/PM
                    //    timeFormat = timeFormat + " a";
                    //    globalTimeFormat = globalTimeFormat + " " + time[1];
                    //}

                    ////postfix=time[1] if !='t'
                    //DW.DateTime.CommonSettings = $.extend(DW.DateTime.CommonSettings, {
                    //    globalTimeFormat: globalTimeFormat
                    //});

                    //return dateFormat + " " + timeFormat;

                },
                dateTimeEntryDefaults = $.datetimeEntry.regionalOptions[culture.name] = $.extend({
                    datetimeFormat: buildDateTimePluginsFormat(culture.calendar), //'O/D/Y H:Ma'
                    ampmNames: settings.ampmNames, //['AM', 'PM']
                    spinnerImage: ''
                }, settings.calendarItemNames);

            $.datetimeEntry.setDefaults(dateTimeEntryDefaults);

        };

    $.extend(this.DW.DateTime, {
        setDateTimeEntryDefaults: setDateTimeEntryDefaults
    });

    var __doKeyDown = $.datetimeEntry._doKeyDown;
    $.datetimeEntry._doKeyDown = function (event) {
        if ($(this).val() == '') {
            return;
        };

        if (event.keyCode == 38 || event.keyCode == 40) { // disable up & down
            return;
        }

        return __doKeyDown(event);
    };

    var __doMouseWheel = $.datetimeEntry._doMouseWheel;
    $.datetimeEntry._doMouseWheel = function (event, delta) {
        if ($(this).is(':focus')) {
            __doMouseWheel(event, delta);
            if (event.isDefaultPrevented()) {
                event.stopPropagation();
            }
        }
    };


}));