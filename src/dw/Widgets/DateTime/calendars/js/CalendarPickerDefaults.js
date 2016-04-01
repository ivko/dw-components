(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "../../CommonDateTimeDefaults", "jquery.calendars", "jquery-ui"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var datePickerDefaults = null,
        setCalendarPickerDefaults = function (options) {
            if (datePickerDefaults) return;

            var settings = DW.DateTime.getCommonDateTimeDefaults(options),
                calendar = settings.calendar,
                buildDatePickerPluginsFormat = function (pattern, separator) {
                    var tokens = [];

                    if (separator) {
                        pattern.split(separator).forEach(function (token) {
                            $.each({
                                'dddd': 'DD', 'ddd': 'D', 'dd': 'dd', 'd': 'dd',
                                'MMMM': 'MM', 'MMM': 'M', 'MM': 'mm', 'M': 'mm',
                                'yyyy': 'yyyy', 'yy': 'yy'
                            }, function (key, value) {
                                if (token.indexOf(key) >= 0) {
                                    tokens.push(value);
                                    return false;
                                }
                            });
                        });
                    }

                    return tokens.length < 3 ? 'yy-mm-dd' : tokens.join(separator);
                };

            datePickerDefaults = $.extend($.calendars.picker.regional[settings.language] || $.calendars.picker.regional[''], {               //use UI-language or default(english) if custom UI langaguage
                renderer: $.extend($.calendars.picker.themeRollerRenderer, { commandButtonClass: 'ui-state-default ui-corner-all dw-button main ui-button ui-widget ui-button-text-only' }),
                showAnim: 'fadeIn',
                showOnFocus: false,
                showTrigger: $('<button type="button" class="dw-imageButton ui-datepicker-trigger" tabindex="-1">&nbsp</button>').button({ text: false, icons: { primary: 'ui-icon dw-icon-calendar' } }),
            });

            $.calendars.calendars[settings.calendarName].prototype.regional[settings.language] = $.extend({
                name: calendar.name,
                epochs: ['??', '??'],
                dayNamesMin: calendar.days.namesShort,
                dateFormat: buildDatePickerPluginsFormat(settings.datePattern, settings.dateSeparator),
                firstDay: calendar.firstDay,
                isRTL: calendar.isRTL
            }, settings.calendarItemNames);

            $.calendars.picker.setDefaults($.extend(datePickerDefaults, {
                calendar: $.calendars.instance(settings.calendarName, settings.language)
            }));

        };


    //picker language fixes 
    $.calendars.picker.regional["en"] = $.calendars.picker.regional["en-GB"];
    $.calendars.picker.regional["pt"] = $.calendars.picker.regional["pt-BR"];
    $.calendars.picker.regional["zh-hans"] = $.calendars.picker.regional["zh-CN"];
    $.calendars.picker.regional["zh"] = $.calendars.picker.regional["zh-hans"];
    $.calendars.picker.regional["pl"].prevText = $.calendars.picker.regional["el"].prevText = '&#x3c;';
    $.calendars.picker.regional["pl"].nextText = $.calendars.picker.regional["el"].nextText = '&#x3e;';

    $.calendars.picker.commands.today = {
        text: 'todayText',
        status: 'todayStatus',
        keystroke: {
            keyCode: 36,
            ctrlKey: true
        }, // Ctrl + Home
        enabled: function (inst) {
            var minDate = inst.curMinDate(),
                maxDate = inst.get('maxDate'),
                date = inst.options.calendar.today();
            return (!minDate || date.compareTo(minDate) != -1) && (!maxDate || date.compareTo(maxDate) != +1);
        },
        date: function (inst) {
            return inst.options.calendar.today();
        },
        action: function (inst) {
            var date = inst.options.calendar.today();
            $.calendars.picker._showMonthPlugin(this, date.year(), date.month(), date.day());
            inst.selectedDates = [date];
            if ($.isFunction(inst.options.onToday) && !inst.inSelectToday) {
                inst.inSelectToday = true; // Prevent endless loops
                inst.options.onToday.apply(this);
                inst.inSelectToday = false;
            }
            $.calendars.picker._updateInput(this);
            $.calendars.picker._update(this);
        }
    };

    $.extend(this.DW.DateTime, {
        setCalendarPickerDefaults: setCalendarPickerDefaults
    });

}));