/* http://gvas.github.io/knockout-jqueryui/ */
(function(factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "jquery-ui"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
} (function($, ko) {
    
    var bindingFactory = (function () {

        // Filters the properties of an object.
        var filterProperties = function (source, properties) {

            var result = {};

            ko.utils.arrayForEach(properties, function (property) {
                if (source[property] !== undefined) {
                    result[property] = source[property];
                }
            });

            return result;
        },

        // Returns a new object with obj's unwrapped properties.
        unwrapProperties = function (obj) {

            var result = {}, prop;

            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (ko.isObservable(obj[prop])) {
                        result[prop] = obj[prop].peek();
                    } else {
                        result[prop] = obj[prop];
                    }
                }
            }

            return result;
        },

        // Sets an option on the widget.
        setOption = function (widgetName, element, optionName, observableOrValue, optionMethodName) {
            if (optionMethodName) {
                $(element)[widgetName](optionMethodName, optionName, ko.utils.unwrapObservable(observableOrValue));
            } else {
                $(element)[widgetName](optionName, ko.utils.unwrapObservable(observableOrValue));
            }
        },

        // Creates a subscription to each observable option.
        subscribeToObservableOptions = function (widgetName, element, options, optionMethodName, callableOptions) {
            var prop;

            for (prop in options) {
                if (options.hasOwnProperty(prop)) {
                    if (ko.isObservable(options[prop])) {
                        ko.computed({
                            read: setOption.bind(this, widgetName, element, prop, options[prop], optionMethodName),
                            disposeWhenNodeIsRemoved: element
                        });
                    } else if ($.isFunction(options[prop])) {
                        if (callableOptions && callableOptions.contains(prop)) {
                            continue;
                        }
                        ko.computed({
                            read: function () {
                                setOption(widgetName, element, this.prop, this.callback(), this.optionMethodName);
                            }.bind({
                                prop: prop,
                                callback: options[prop],
                                optionMethodName: optionMethodName
                            }),
                            disposeWhenNodeIsRemoved: element
                        });
                    }
                }
            }
        },

        // Creates a subscription to the refreshOn observable.
        subscribeToRefreshOn = function (widgetName, element, bindingValue) {

            if (ko.isObservable(bindingValue.refreshOn)) {
                ko.computed({
                    read: function () {
                        bindingValue.refreshOn();
                        $(element)[widgetName]('refresh');
                    },
                    disposeWhenNodeIsRemoved: element
                });
            }
        },

        // Creates a new binding.
        create = function (options) {

            var widgetName, init;

            widgetName = options.name;

            // skip missing widgets
            if (!$.fn[widgetName]) {
                return;
            }

            init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

                // execute the provided callback before the widget initialization
                if (options.preInit) {
                    options.preInit.apply(this, arguments);
                }

                var $element = $(element),
                    value = options.prepareOptions ? options.prepareOptions.apply(this, arguments) : valueAccessor(),
                    widgetOptions = filterProperties(value, options.options),
                    unwrappedOptions = unwrapProperties(widgetOptions),
                    widgetEvents = filterProperties(value, options.events),
                    unwrappedEvents = unwrapProperties(widgetEvents),
                    updateTriggers = [];

                options.controlsDescendantBindings = (options.controlsDescendantBindings === undefined ? true : options.controlsDescendantBindings);
                options.optionMethodName = (options.optionMethodName === undefined ? 'option' : options.optionMethodName);

                // allow inner elements' bindings to finish before initializing the widget
                if (options.controlsDescendantBindings) {
                    ko.applyBindingsToDescendants(bindingContext, element);
                }

                // bind the widget events to the viewmodel
                $.each(unwrappedEvents, function (key, value) {
                    unwrappedEvents[key] = value.bind(viewModel);
                });

                // initialize the widget
                var unwrappedWidgetOptions = ko.utils.extend(unwrappedOptions, unwrappedEvents);
                $element[widgetName](unwrappedWidgetOptions);

                // Update triggers
                if (options.updateTriggersMapping && value.updateTriggers) {
                    for (var methodName in options.updateTriggersMapping) {
                        var mapedEventName = options.updateTriggersMapping[methodName],
                            callback = $.proxy($element[widgetName], $element, methodName),
                            timeoutId = null,
                            triggerHandler = function () {
                                clearTimeout(timeoutId);
                                timeoutId = setTimeout(callback, 1);
                            },
                            updateTriggers = updateTriggers.concat(ko.updateTriggers(value.updateTriggers, triggerHandler));
                        if (!mapedEventName) continue;
                        $element.on(mapedEventName + '.koupdatetrigger', triggerHandler);
                    }
                }

                subscribeToObservableOptions(widgetName, element, widgetOptions, options.optionMethodName, options.callableOptions);

                if (options.hasRefresh) {
                    subscribeToRefreshOn(widgetName, element, value);
                }
                
                // store the widget instance in the widget observable
                if (ko.isWriteableObservable(value.widget)) {
                    value.widget($element);
                }

                // handle disposal
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    if (updateTriggers.length > 0) {
                        DW.Utils.dispose(updateTriggers);
                        $(element).off('.koupdatetrigger');
                    }
                    try {
                        $element[widgetName]('destroy');
                        if (options.onDestroyed) {
                            options.onDestroyed.call(null, element);
                        }
                    } catch (e) {
                        if (options.debug) {
                            console.log('koJquiBindingFactory:debug', e.message);
                        }
                    }
                });

                // execute the provided callback after the widget initialization
                if (options.postInit) {
                    options.postInit.apply(this, arguments);
                }

                // the inner elements have already been taken care of
                return { controlsDescendantBindings: options.controlsDescendantBindings };
            };

            ko.bindingHandlers[widgetName] = {
                init: init
            };

            if (options.updateBindingHandler) {
                ko.bindingHandlers[widgetName]['update'] = options.updateBindingHandler;
            }

        };

        return {
            create: create
        };
    }());

    ko.jqui = {
        bindingFactory: bindingFactory
    };

}));