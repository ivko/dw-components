(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "globalize", "moment", "jquery.dateentry", "./BaseDatePickerBindingHandler"], factory);
    } else { // Global
        factory(jQuery, ko, Globalize, moment);
    }
}(function ($, ko, Globalize, moment) {

    var DatePickerBindingHandler = function () {
        var self = new DW.DateTime.BaseDatePickerBindingHandler();

        var baseInit = self.init;
        self.init = function (element, valueAccessor, allBindingsAccessor) {
            baseInit(element, valueAccessor, allBindingsAccessor);

            var options = allBindingsAccessor().datepickerOptions || {},
                maxValueObservable = allBindingsAccessor().maxValue,
                minValueObservable = allBindingsAccessor().minValue,
                enable = allBindingsAccessor().enable, //handle ko enable binding applied to the element
                visible = allBindingsAccessor().visible, //handle ko visible binding
                disabled = !!ko.utils.unwrapObservable(options.disabled), 
                $element = $(element), 
                observable = valueAccessor(),
                valSubscr, minSubscr, maxSubscr,
                enableSubscr, visibleSubscr,
                setToday = false,
                gcn = DW.DateTime.CommonSettings.calendarName,
                //gc = $.calendars.instance(gcn, Globalize.culture().language), //en-GB does not work this way 
                gc = $.calendars.picker._defaults.calendar, // find a better way
                enableDateEntry = (gcn === 'gregorian'),
                setDate = function (date) {
                    observable(date ? formatter.getDateTime(date, isEmpty) : null);
                    isEmpty = !date;
                    $element.focus();
                },
                formatterOptions = self.getFormatterOptions(gc, options.isRangeStartDate, options.isRangeEndDate),
                formatter = self.getFormatter(formatterOptions),
                validateValue = function (value) {
                    return (value instanceof Date) ? value : null;
                },
                value = validateValue(observable()),
                isEmpty = !value;

            if (enableDateEntry)
                self.enableEntry($element);

            $element.val(value ? formatter.getLocalizedString(value) : '');

            var onValueChanged = function (date) {
                $element.off('change', onElemChanged);

                date = validateValue(date);
                var _date = formatter.getDate(date, true);
                isEmpty = !date;
                $element.val(formatter.getLocalizedString(_date));

                $element.on('change', onElemChanged);

                //sync DW Request autocomplete menu bug:121050//TODO remove
                if (enableDateEntry) self.setEntryValue($element, date);

                self.updateTriggerLayout($element);
            };
            valSubscr = observable.subscribe(onValueChanged);

            $element.calendarsPicker($.extend({
                onShow: function (pickerElement, calendarOptions, pickerInstance) {
                    $(document).data('calendarsPicker.pickerElement', pickerElement);
                    pickerElement.find('a[href^="javascript"]').on('click.calendarsPickerClick', function (event) {
                        event.preventDefault();
                    });
                },
                onClose: function () {
                    $(document)
                        .data('calendarsPicker.pickerElement')
                        .find('a[href^="javascript"]')
                        .off('click.calendarsPickerClick');
                },
                onSelect: function (dates) {
                    setDate(formatter.getJSDateFromCalendar(dates, setToday, observable()));
                    setToday = false;
                },
                onToday: function () {
                    setToday = true;
                }
            }, options));

            self.updateTriggerLayout($element);

            //var calendar = $element.calendarsPicker('option', 'calendar');
            //if (calendar) {
            //    var baseParseDate = calendar.parseDate.bind(calendar);
            //    calendar.parseDate = function (format, dateText, settings) {
            //        var _dateText = dateText ? formatter.getCalendarDateString(dateText) : dateText;
            //        console.log(dateText);
            //        return baseParseDate(format, _dateText, settings);
            //    };
            //}

            //Handle enabling and disabling of datepicker trigger button
            if (typeof (enable) != 'undefined') {
                if (ko.isObservable(enable)) {
                    enableSubscr = enable.subscribe(function (enabled) {
                        self.enableTrigger(enabled, element);
                    });
                    self.enableTrigger(enable(), element);
                } else {
                    self.enableTrigger(enable, element);
                }
            }

            //Handle visibility of datepicker trigger button
            if (typeof (visible) != 'undefined') {
                if (ko.isObservable(visible)) {
                    visibleSubscr = visible.subscribe(function () {
                        self.showTrigger(visible(), element);
                    });
                    self.showTrigger(visible(), element);
                } else {
                    self.showTrigger(visible, element);
                }
            }

            var onElemChanged = function () {
                var subscribe = false;
                if (!isEmpty) {
                    //allow trigger of onValueChanged if the input was empty till now, so range values can be adjusted and applied
                    valSubscr.dispose();
                    subscribe = true;
                };
                setDate(formatter.getJSDate($element.val()));
                if (subscribe) valSubscr = observable.subscribe(onValueChanged);
            };
            $element.on('change', onElemChanged);

            $element.on('keypress', function (event) {
                var c = event.keyCode || event.charCode;
                var d = formatter.getJSDate($element.val()),
                    date = null;

                if (c == 120 || c == 88) { // 'x' today
                    var m = moment();
                    date = formatter.getDate(m.getDate());
                }
                else if (c == 45 || c == 109) { // '-' prev day
                    var m = moment(d ? d : void 0).add('days', -1);
                    date = m.getDate();
                }
                else if (c == 43 || c == 107) { // '+' next day
                    var m = moment(d ? d : void 0).add('days', 1);
                    date = m.getDate();
                }

                if (!date) return true;

                setDate(date);

                event.preventDefault();

                //if (minValueObservable && minValueObservable()) {
                //    m = m.min(minValueObservable());
                //}
                //if (maxValueObservable && maxValueObservable()) {
                //    m = m.max(maxValueObservable());
                //}

                $element.calendarsPicker('hide');
                return false;
            });


            if (maxValueObservable) {
                var maxDate = maxValueObservable() || null;
                //if (enableDateEntry) $element.dateEntry('option', { maxDate: maxDate ? new Date(maxDate.getTime()) : null });
                $element.calendarsPicker('option', { maxDate: maxDate ? gc.fromJSDate(maxDate).formatDate() : null });

                maxSubscr = maxValueObservable.subscribe(function (newValue) {
                    var maxDate = newValue || null;
                    //if (enableDateEntry) $element.dateEntry('option', { maxDate: maxDate ? new Date(maxDate.getTime()) : null });
                    $element.calendarsPicker('option', { maxDate: maxDate ? gc.fromJSDate(maxDate).formatDate() : null });
                });
            }

            if (minValueObservable) {
                var minDate = minValueObservable() || null;
                //if (enableDateEntry) $element.dateEntry('option', { minDate: minDate ? new Date(minDate.getTime()) : null });
                $element.calendarsPicker('option', { minDate: minDate ? gc.fromJSDate(minDate).formatDate() : null });

                minSubscr = minValueObservable.subscribe(function (newValue) {
                    var minDate = newValue || null;
                    //if (enableDateEntry) $element.dateEntry('option', { minDate: minDate ? new Date(minDate.getTime()) : null });
                    $element.calendarsPicker('option', { minDate: minDate ? gc.fromJSDate(minDate).formatDate() : null });
                });
            }

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off('change');
                $element.off('keypress');
                if (enableDateEntry) self.disposeEntry($element);
                $element.calendarsPicker('destroy');

                if (valSubscr) valSubscr.dispose();
                if (minSubscr) minSubscr.dispose();
                if (maxSubscr) maxSubscr.dispose();
                if (enableSubscr) enableSubscr.dispose();
                if (visibleSubscr) visibleSubscr.dispose();
                formatter.dispose();
            });

            // TODO: if disabled option is observable
            if (enableDateEntry) self.toggleEntry($element, disabled);
            $element.calendarsPicker(disabled ? 'disable' : 'enable');
        };

        self.updateTriggerLayout = function ($element) { };

        self.enableTrigger = function (enable, element) {
            //$(element).calendarsPicker(enable ? 'enable' : 'disable'); //TODO use it instead
            var currentTrigger = $.calendars.picker._getTrigger(element);
            if (currentTrigger) {
                if (enable) {
                    $.calendars.picker._enablePlugin(element);
                    $(currentTrigger).removeClass("ui-state-disabled");
                }
                else {
                    $.calendars.picker._disablePlugin(element);
                    $(currentTrigger).addClass("ui-state-disabled");
                }
            }
        };

        self.showTrigger = function (show, element) {
            var currentTrigger = $.calendars.picker._getTrigger(element);
            if (currentTrigger) {
                if (show) {
                    currentTrigger.show();
                }
                else {
                    currentTrigger.hide();
                }
            }
        }

        self.enableEntry = function ($element) {
            $element.dateEntry({});
        };

        self.disposeEntry = function ($element) {
            $element.dateEntry('destroy');
        };

        self.toggleEntry = function ($element, optionsDisabled) {
            $element.dateEntry(optionsDisabled ? 'disable' : 'enable');
        };

        self.setEntryValue = function ($element, date) {
            $element.dateEntry('setDate', date);
        };

        return self;
    };

    $.extend(this.DW.DateTime, {
        DatePickerBindingHandler: DatePickerBindingHandler
    });


    //$.effects.effect.datepickerVisibility = function (options, callback) {
    //    var widget = $(this);

    //    if (options.mode == 'hide') {
    //        // Hide
    //        var scroll = widget.data('scroll');
    //        if (scroll) {
    //            widget.data('scroll', null);
    //            scroll.off('scroll.datepicker');
    //        }
    //        widget.hide('fade', options.complete, options.duration);
    //    } else {
    //        // Show
    //        var input = $($.datepicker._lastInput);
    //        var scroll = input.closest('.scroll-wrapper');
    //        if (scroll) {
    //            scroll.on('scroll.datepicker', function () {
    //                this.datepicker("hide").blur();
    //            }.bind(input));
    //            widget.data('scroll', scroll);
    //        }
    //        widget.show('fade', options.duration);
    //    }
    //    callback.call();
    //};
}));