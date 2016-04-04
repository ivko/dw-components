
(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "../utils", "./BindingHandler"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.observableArray.fn.trackHasItems = function () {
        //create a sub-observable
        this.hasItems = ko.observable(false);
        this.hasSingleItem = ko.observable(false);

        //update it when the observableArray is updated
        var subscription = this.subscribe(function (newValue) {
            this.hasItems(newValue && newValue.length > 0 ? true : false);
            this.hasSingleItem(newValue && newValue.length == 1 ? true : false);
        }, this);

        //trigger change to initialize the value
        this.valueHasMutated();

        this.dispose = function () {
            DW.Utils.dispose(subscription);
        };
        //support chaining by returning the array
        return this;
    };

    ko.observableArray.fn.move = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        var methodCallResult = underlyingArray.move.apply(underlyingArray, arguments);
        this.valueHasMutated();
        return methodCallResult;
    };

    ko.bindingHandlers.numeric = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var options = allBindingsAccessor().numericOptions || {},
                value = allBindingsAccessor().value,
                isNegative = false,
                minus = "-";

            if (options.rational && ko.isObservable(value)) {
                isNegative = (value().indexOf(minus) >= 0);
                var valueSubscription = value.subscribe(function (val) {

                    var index = val.indexOf(minus);
                    isNegative = (index >= 0);
                    if (isNegative && index != 0) {
                        //- is not on first place
                        var values = val.split(minus),
                            newValue = minus.concat(values[0], values[1]);

                        value(newValue);
                    }
                });
            }

            $(element).on("keydown", function (event) {
                // Allow: backspace, delete, tab, escape, and enter
                if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                    // Allow: Ctrl+A
                    (event.keyCode == 65 && event.ctrlKey === true) ||
                    // Allow: . ,
                    (event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 110) ||
                    // Allow: home, end, left, right
                    (event.keyCode >= 35 && event.keyCode <= 39) ||
                    // let it happen, don't do anything
                    (options.rational && !isNegative && ((DW.Utils.isFF && event.keyCode == 173) || event.keyCode == 189 || event.keyCode == 109))) {
                    //minus (-) in mozilla keyCode is 107; in others is 189; numpad (-) is 109
                    return;
                }
                else {
                    // Ensure that it is a number and stop the keypress
                    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                }
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('keydown');
                if (valueSubscription) valueSubscription.dispose();
            });
        }
    };

    ko.bindingHandlers.debugBinding = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            console.log(ko.utils.unwrapObservable(valueAccessor()));
            //ko.applyBindingsToDescendants(innerBindingContext, element);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            console.log(ko.utils.unwrapObservable(valueAccessor()));
        }
    };

    //// There are some issues with the standard hasFocus binding in knockout, described in the following links
    //// https://github.com/SteveSanderson/knockout/issues/554
    //// https://github.com/SteveSanderson/knockout/pull/698#issuecomment-10098934
    //// That's why we use this binding instead of the standard.
    //// Solution is found here: 
    //// https://github.com/SteveSanderson/knockout/issues/554#issuecomment-6714550
    //// NOTE: Check if fixed in next version of knockout (2.3). It should be there. Current is 2.2.1.
    //ko.bindingHandlers.setFocus = {
    //    init: function (element, valueAccessor) {
    //        var value = ko.utils.unwrapObservable(valueAccessor());
    //        value ? element.focus() : element.blur();
    //        ko.utils.triggerEvent(element, value ? "focusin" : "focusout");  //IE
    //    }
    //};
    ko.bindingHandlers.setFocus = {
        init: function (element, valueAccessor) {
            var triggers = ko.utils.unwrapObservable(valueAccessor());

            var computed = ko.computed(function () {
                var focus = triggers.every(function (t) {
                    return t();
                });
                if (focus) {
                    element.focus();
                    ko.utils.triggerEvent(element, "focusin");  //IE
                }
                return focus;
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                computed.dispose();
            });
        }
    };

    ko.bindingHandlers['enableEx'] = {
        'update': function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                options = (allBindingsAccessor && allBindingsAccessor.has('enableExOptions') ? allBindingsAccessor.get('enableExOptions') : null) || { mode: 'disabled' },
                $element = $(element);

            $element[value ? 'removeClass' : 'addClass']('ui-state-disabled');

            if ($element.is(':input')) {
                options.mode == 'readonly' ? $element.prop('readonly', !value) : ko.bindingHandlers['enable']['update'](element, valueAccessor);
            }
        }
    };
     
    ko.bindingHandlers['disableEx'] = {
        'update': function (element, valueAccessor) {
            ko.bindingHandlers['enableEx']['update'](element, function () { return !ko.utils.unwrapObservable(valueAccessor()) });
        }
    };

    //handler for highlighting the text in the control which has focus - currently used in the handling of the rename document in the result views
    ko.bindingHandlers.selected = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var selected = ko.utils.unwrapObservable(valueAccessor());
            if (selected) element.select();
        }
    };

    //custom binding to initialize a jQuery UI button
    ko.bindingHandlers.jqButton = {
        init: function (element, valueAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor()) || {};

            //handle disposal
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).button("destroy");
            });

            $(element).button(options);
        }
    };

    ko.bindingHandlers.clickrelay = {
        init: function (element, valueAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor());
            var $element = $(element);
            if (!$element.is(options.from)) {
                $element = $element.siblings(options.from);
            }
            $element.click(function (event) {
                $(this).siblings(options.to).trigger('click');
            });
        }
    };

    ko.extenders["booleanValue"] = function (target) {
        target.formattedValue = ko.computed({
            read: function () {
                return String(target());
            },
            write: function (newValue) {
                target(String.from(newValue).toBoolean());
            }
        });

        target.formattedValue(target());
        return target;
    };

    ko.bindingHandlers['class'] = {
        'update': function (element, valueAccessor) {
            if (element['__ko__previousClassValue__']) {
                $(element).removeClass(element['__ko__previousClassValue__']);
            }
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).addClass(value);
            element['__ko__previousClassValue__'] = value;
        }
    };

    ko.bindingHandlers.logger = {
        update: function (element, valueAccessor, allBindings) {
            //store a counter with this element
            var count = ko.utils.domData.get(element, "_ko_logger") || 0,
                data = ko.toJS(valueAccessor() || allBindings());

            ko.utils.domData.set(element, "_ko_logger", ++count);

            if (console && console.log) {
                console.log(count, element, data);
            }
        }
    };

    //TODO: think how to optimize the spinner binding in the area of value updating
    ko.bindingHandlers.spinner2 = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().spinnerOptions || {};
            $(element).spinner(options);

            var validateAndSetValue = function (evt, uiValue) {
                var observable = valueAccessor();
                // try to get the value from the changed event instead of old value from the input
                // in order to get the actuon changes in the subscribers before second blur 
                var parsedVal = (typeof uiValue === 'number') ? uiValue : $(element).spinner("value");

                //if (!parsedVal ) return;
                if (!parsedVal && parsedVal !== 0) { // this will handle NaN
                    parsedVal = options.min ? options.min : 0;
                }

                if (parsedVal.toString().length > element.maxLength) { // todo: I need to change that control and use another
                    //evt.preventDefault(); // prevent default wouldn't work, because spinner throws the event after it has already happened
                    $(element).spinner("stepDown");
                    return;
                }

                if (options && options.intOnly)
                    parsedVal = parseInt(parsedVal);

                if (options.max && parsedVal > options.max) {
                    parsedVal = options.max;
                }
                if (options.min && parsedVal < options.min) {
                    parsedVal = options.min;
                }

                $(element).spinner("value", parsedVal);
                observable(parsedVal);
            };

            //handle the field changing
            $(element).on("spin spinchange", function (evt, ui) {
                //var observable = valueAccessor();
                //observable($(element).spinner("value"));
                validateAndSetValue(evt, (ui && ui.value ? ui.value : false));
            });

            $(element).keydown(function (event) {
                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(event.keyCode, [46, 8, 9, 27, 190]) !== -1 ||
                    // Allow: Ctrl+A
                    (event.keyCode == 65 && event.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (event.keyCode >= 35 && event.keyCode <= 39)) {
                    // let it happen, don't do anything
                    return;
                }
                else if (event.keyCode == $.ui.keyCode.ENTER) {
                    validateAndSetValue(event, false);
                    return;
                }
                else {
                    // Ensure that it is a number and stop the keypress the other cases
                    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                }
            });

            $(element).on("change", function (evt, ui) {
                validateAndSetValue(evt, (ui && ui.value ? ui.value : false));
            });

            $(element).on("click", function (evt, ui) {
                element.focus();
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off("spin spinchange");
                $(element).off("change");
                $(element).spinner("destroy");
            });

        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                options = allBindingsAccessor().spinnerOptions || {};
            current = $(element).spinner("value");

            if (value !== current) {
                if (options && options.intOnly) {
                    $(element).spinner("value", parseInt(value));
                } else {
                    $(element).spinner("value", value);
                }

            }
        }
    };

    $.extend(ko.bindingHandlers['foreach'], {
        makeTemplateValueAccessor: function (valueAccessor) {
            return function () {
                var modelValue = valueAccessor(),
                    unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

                // If unwrappedValue is the array, pass in the wrapped value on its own
                // The value will be unwrapped and tracked within the template binding
                // (See https://github.com/SteveSanderson/knockout/issues/523)
                if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                    return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

                // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
                ko.utils.unwrapObservable(modelValue);
                return {
                    'foreach': unwrappedValue['data'],
                    'as': unwrappedValue['as'],
                    'includeDestroyed': unwrappedValue['includeDestroyed'],
                    'afterAdd': unwrappedValue['afterAdd'],
                    'beforeRemove': unwrappedValue['beforeRemove'],
                    'afterRender': unwrappedValue['afterRender'],
                    'beforeMove': unwrappedValue['beforeMove'],
                    'afterMove': unwrappedValue['afterMove'],
                    'templateEngine': unwrappedValue['templateEngine'] ? unwrappedValue['templateEngine'] : ko.nativeTemplateEngine.instance
                };
            };
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return ko.bindingHandlers.template.init(element, ko.bindingHandlers.foreach.makeTemplateValueAccessor(valueAccessor));
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return ko.bindingHandlers.template.update(element, ko.bindingHandlers.foreach.makeTemplateValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
        }
    });

    ko.bindingHandlers['safeHtml'] = {
        util: $('<div/>'),
        escape: function (valueAccessor) {
            var modelValue = valueAccessor(),
                unwrappedValue = ko.utils.peekObservable(valueAccessor()),
                exp = /&lt;(|\/)(b)&gt;/g,
                text = ko.bindingHandlers.safeHtml.util.text(unwrappedValue || '').html();

            return text.replace(exp, function (text) {
                return text.replace('&lt;', '<').replace('&gt;', '>');
            });
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).html(ko.bindingHandlers.safeHtml.escape(valueAccessor))
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).html(ko.bindingHandlers.safeHtml.escape(valueAccessor))
        }
    }

    ko.bindingHandlers.enter = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var command = ko.utils.unwrapObservable(valueAccessor()),
                $input = $(element).find('input');

            $input.on({
                'focus': function (event) {
                    $(this).select();
                },
                'change': function (event, afterKeyDown) {
                    //'change' is triggered automaticaly in FF and Chrome, so execute the command only on manualy trigerred change event for all browsers
                    if (afterKeyDown) {
                        command.apply(command);
                    }
                }
            });

            $input.on({
                'keydown': function (event) {
                    if (event.keyCode == $.ui.keyCode.ENTER) {
                        $(this).trigger("change", true);
                        event.stopPropagation(); //the ENTER key is handled 

                    }
                }
            });
        }
    };

    ko.bindingHandlers.responsiveNavigation = {
        handleResize: function (event, data) {
            ko.bindingHandlers.responsiveNavigation.resize($(event.currentTarget), data);
        },
        resize: function ($element, size) {
            var minWidth = $element.data('minWidth');
            if (!minWidth) {
                return;
            }
            var isLower = size.width < minWidth;
            $element[isLower ? 'addClass' : 'removeClass']($element.data('lowerWidthClass'));
        },
        handleUpdate: function (items) {
            var $element = $(this.element),
                value = this.valueAccessor(),
                binding = ko.bindingHandlers.responsiveNavigation,
                items = $element.find(value.contentItems),
                width = 16; // TODO: fix that

            $element.removeClass(value.lowerWidthClass);

            items.each(function (i, item) {
                width += $(item).outerWidth(true);
            });

            $element.data('minWidth', width);

            binding.resize($element, { width: $element.outerWidth(true) });
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            ko.applyBindingsToDescendants(bindingContext, element);

            var value = valueAccessor(),
                binding = ko.bindingHandlers.responsiveNavigation;

            $(element).data('lowerWidthClass', value.lowerWidthClass)
                .attr('data-dw-resizable', 'true')
                .bind('dwResize.koresponsiveNavigation', binding.handleResize);

            var computed = ko.computed(function () {
                binding.handleUpdate.call({
                    element: element,
                    valueAccessor: valueAccessor
                }, value.items())
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('.koresponsiveNavigation');
                DW.Utils.dispose(computed);
            });

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.uniqueId = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();
            element.id = value.id = value.id || ko.bindingHandlers.uniqueId.prefix + (++ko.bindingHandlers.uniqueId.counter);
        },
        counter: 0,
        prefix: "unique"
    };

    ko.bindingHandlers.uniqueFor = {
        init: function (element, valueAccessor) {
            var value = valueAccessor();
            value.id = value.id || ko.bindingHandlers.uniqueId.prefix + (++ko.bindingHandlers.uniqueId.counter);
            element.setAttribute("for", value.id);
        }
    };


    ko.unapplyBindings = function ($node, shouldRemove) {

        // unbind events
        $node.find("*").each(function () {
            $(this).unbind();
        });

        if (shouldRemove) {
            ko.removeNode($node[0]);
        } else {
            ko.cleanNode($node[0]);
        }
    };

    ko.bindingHandlers.scrollElementIntoView = {
        update: function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor()()); // will accept either observable or function as value

            if (value === true && element.scrollIntoView) {
                element.scrollIntoView(false);
            }
        }
    }

    Object.append(ko.bindingHandlers, Object.map({
        returnKey: 13,
        escKey: 27
    }, function (keyCode) {
        return {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var options = $.extend({
                    onKey: function (evt, args) {
                        evt.target.blur();
                    }
                }, ko.utils.unwrapObservable(allBindingsAccessor().keyOptions) || {});
                ko.utils.registerEventHandler(element, 'keydown', function (evt) {
                    if (evt.keyCode === keyCode) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        options.onKey(evt);
                        valueAccessor().call(viewModel);
                    }
                });
            }
        };
    }));

    ko.bindingHandlers.autoSelectText = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);

            $element.on("focus", function () {
                $(this).select();
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off("focus");
            });
        }
    };

    var InsertAtCaretHandler = new Class({
        Extends: BindingHandler,

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var baseOptions = ko.utils.unwrapObservable(allBindingsAccessor()).insertAtCaret;

            var subscriptor = baseOptions.valueProvider.subscribe(function (serverVariable) {
                if (serverVariable.type !== DW.FileCabinet.DynamicEntries.None.type) {

                    $element.insertAtCaret(serverVariable.sqlCommand).val();
                    $element.change();
                    baseOptions.valueProvider(viewModel.serverVariables()[0]);
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (subscriptor) {
                    subscriptor.dispose();
                }
            });
        }
    });
    ko.bindingHandlers.insertAtCaret = new InsertAtCaretHandler();


}));