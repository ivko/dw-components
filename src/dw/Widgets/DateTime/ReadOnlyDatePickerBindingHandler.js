(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "./DatePickerBindingHandler"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var ReadOnlyDatePickerBindingHandler = function () {
        var self = new DW.DateTime.DatePickerBindingHandler();


        var baseInit = self.init;
        self.init = function (element, valueAccessor, allBindingsAccessor) {
            baseInit(element, valueAccessor, allBindingsAccessor);

            var $element = $(element),
                value = valueAccessor(), //observable
                $clearBtn = $element.nextAll(".datePickerClear:first");

            if (!$clearBtn.length) return;

            if (!value())
                $clearBtn.hide();
            
            $clearBtn.on('click', function () {
                $clearBtn.hide();
                value(null);
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $clearBtn.off('click');
            });
        }

        self.updateTriggerLayout = function ($element) {
            var $buttonLayout = null,
                $clearBtn = $element.nextAll(".datePickerClear:first");
          
            if ($element.val()) {
                //todo: put some styles for hover on this element
                $buttonLayout = $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only calendars-trigger no-padding" tabindex="-1">' + $element.val() + '</button>');
                if ($clearBtn && !$clearBtn.is(":visible"))
                    $clearBtn.show(); 
            }
            else
                $buttonLayout = $('<button type="button" class="" tabindex="-1"></button>').button({ text: false, icons: { primary: 'ui-icon dw-icon-calendar' } });

            $element.calendarsPicker('option', 'showTrigger', $buttonLayout);
        };
      
        return self;
    };

    var ReadOnlyDateTimePickerBindingHandler = function () {
        var self = new DW.DateTime.ReadOnlyDatePickerBindingHandler();

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
        ReadOnlyDatePickerBindingHandler: ReadOnlyDatePickerBindingHandler,
        ReadOnlyDateTimePickerBindingHandler: ReadOnlyDateTimePickerBindingHandler
    });

    var readOnlyDatepickerBindingHandlerInstance = new ReadOnlyDatePickerBindingHandler();
    ko.bindingHandlers.readOnlyDatePicker = {
        init: readOnlyDatepickerBindingHandlerInstance.init.bind(readOnlyDatepickerBindingHandlerInstance)
    };

    var readOnlyDatetimepickerInstance = new ReadOnlyDateTimePickerBindingHandler();
    ko.bindingHandlers.readOnlyDateTimePicker = {
        init: readOnlyDatetimepickerInstance.init.bind(readOnlyDatetimepickerInstance)
    };


}));