(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "./TimeEntryDefaults"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.bindingHandlers.timeentry = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            // call this here to be sure that Globalize is already initiliazed
            DW.DateTime.setTimeEntryDefaults();

            var options = allBindingsAccessor().timeentryOptions || {};
            var $element = $(element);
            var observable = valueAccessor();
            $element.timeEntry({});

            var value = ko.utils.unwrapObservable(valueAccessor());
            value = value ? new Date(value) : '';
            $element.timeEntry('setTime', value);

            $element.on('change', function () {
                var value = $element.timeEntry('getTime');
                observable(value ? value : '');
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off('change');
                $element.timeEntry('destroy');
            });
        }
    };
}));