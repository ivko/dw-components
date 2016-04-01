(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "../CommonDateTimeDefaults", "jquery.timeentry"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var timeEntryDefaults = null,
        setTimeEntryDefaults = function (options) {

            if (timeEntryDefaults) return;

            var settings = DW.DateTime.getCommonDateTimeDefaults(options);

            timeEntryDefaults = $.timeEntry.regionalOptions[Globalize.culture().name] = {
                show24Hours: !settings.ampmNames.length,
                separator: settings.timeSeparator,
                ampmPrefix: ' ',
                ampmNames: settings.ampmNames,  //['AM', 'PM']
                spinnerImage: ''
            };

            $.timeEntry.setDefaults(timeEntryDefaults);
            
        };


    $.extend(this.DW.DateTime, {
        setTimeEntryDefaults: setTimeEntryDefaults
    });

    var __doMouseWheel = $.timeEntry._doMouseWheel;
    $.timeEntry._doMouseWheel = function (event, delta) {
        if ($(this).is(':focus')) {
            __doMouseWheel(event, delta);
            if (event.isDefaultPrevented()) {
                event.stopPropagation();
            }
        }
    };


}));