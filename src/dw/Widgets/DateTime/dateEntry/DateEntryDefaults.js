(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "../CommonDateTimeDefaults", "jquery.dateentry"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

    var dateEntryDefaults = null,
        setDateEntryDefaults = function (options) {

            if (dateEntryDefaults) return;

            var settings = DW.DateTime.getCommonDateTimeDefaults(options),
                buildDatePluginsFormat = function () {

                    var separator = settings.dateSeparator,
                       pattern = settings.datePattern, // short date
                       tokens = [];
                    if (separator) {
                        pattern.split(separator).forEach(function (token) {
                            $.each({
                                'dddd': 'W', 'ddd': 'w', 'dd': 'd', 'd': 'd',
                                'MMMM': 'N', 'MMM': 'n', 'MM': 'm', 'M': 'm',
                                'yyyy': 'y', 'yy': 'Y'
                            }, function (key, value) {
                                if (token.indexOf(key) >= 0) {
                                    tokens.push(value);
                                    return false;
                                }
                            });
                        });
                    }

                    if (tokens.length < 3) {
                        console.warn('Using default date format');
                    }

                    return tokens.length < 3 ? 'ymd-' : tokens.join('') + separator;
                },
            dateEntryDefaults = $.dateEntry.regionalOptions[Globalize.culture().name] = $.extend({
                dateFormat: buildDatePluginsFormat(),
                spinnerTexts: ['', '', '', '', ''],
                spinnerImage: '',
                commandButtonClass: 'ui-state-default ui-corner-all dw-button main ui-button ui-widget ui-button-text-only',
                useMouseWheel: true
            }, settings.calendarItemNames);

            $.dateEntry.setDefaults(dateEntryDefaults);

        };

    var __doKeyDown = $.dateEntry._doKeyDown;
    $.dateEntry._doKeyDown = function (event) {
        if ($(this).val() == '') {
            return;
        };

        if (event.keyCode == 38 || event.keyCode == 40) { // disable up & down
            return;
        }

        return __doKeyDown(event);
    };

    var __doMouseWheel = $.dateEntry._doMouseWheel;
    $.dateEntry._doMouseWheel = function (event, delta) {
        if ($(this).is(':focus')) {
            __doMouseWheel(event, delta);
            if (event.isDefaultPrevented()) {
                event.stopPropagation();
            }
        }
    };


    $.extend(this.DW.DateTime, {
        setDateEntryDefaults: setDateEntryDefaults
    });

}));