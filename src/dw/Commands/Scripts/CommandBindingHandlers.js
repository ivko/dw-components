/*
 *http://wiki.docuware.ag/mediawiki/index.php/Reusable_Components#Commands
 */
(function ($, ko) {

    $.extend(ko.utils, {
        wrapAccessor: function (accessor) {
            return function () {
                return accessor;
            };
        },
        isBindingHandler: function (handler) {
            return ko.bindingHandlers[handler] !== void 0;
        },
        resolveRequires: function (bindingContext, requires) {
            /// <summary>
            ///     For each defined predicate in command requires object, traverses the current binding context and its parents.
            /// </summary>
            /// <param name="bindingContext">bindingContext from the custom command binding</param>
            /// <param name="requires">{{key: predicate function}, ..} defined in the command</param>
            /// <returns>Object that for each defined predicate in the command returns the context for which the predicate is valid</returns>
            var rqs = {}, rqKey, rqFun, rq;
            requires = requires || {};
            if (bindingContext) {
                for (rqKey in requires) {
                    rqFun = requires[rqKey];
                    rq = null;
                    [].concat(bindingContext.$data || [], bindingContext.$parents || []).some(function (vm) {
                        if ($.isFunction(rqFun)) {
                            rqFun = {
                                predicate: rqFun,
                                useReturnValue: false
                            };
                        }

                        var rqValue = rqFun.predicate.call(null, vm);
                        if (!!rqFun.useReturnValue) {
                            if (rqValue !== void 0) { // undefined
                                rq = rqValue;
                                return true; // break
                            }
                        } else {
                            if (!!rqValue) {
                                rq = vm;
                                return true; // break
                            }
                        }
                    });
                    rqs[rqKey] = rq;
                }
            }
            return rqs;
        }
    });
    
    var CommandBindingAdapter = new Class({
        Extends: DW.Disposable,

        initialize: function (command, bindingContext) {
            /// <summary>
            ///     Command binding adapter
            ///     Used as manager between the command intarface and the command custom binding
            ///     Wraps canExecute, available and visible in computed
            /// </summary>
            /// <param name="command">Class that extends DW.Command</param>
            /// <param name="bindingContext">bindingContext from the custom command binding</param>
            this.command = command;
            this.requires = ko.utils.resolveRequires(bindingContext, this.command.requires);

            this.canExecute = this.addDisposable(ko.computed(function () {
                if (!this.available()) return false;

                return !!this.command.canExecute(this.command.isExecuting(), this.requires);
            }, this).extend({ deferred: true }));
        },

        available: function () {
            /// <summary>
            ///     Calls the command available method with valued requires object as argument
            /// </summary>
            /// <returns type="boolean"></returns>
            return !!this.command.available(this.requires);
        },

        visible: function () {
            /// <summary>
            ///     Calls the command visible method with valued requires object as argument
            /// </summary>
            /// <returns type="boolean"></returns>
            if (!this.available()) return false;

            return $.when(this.command.visible(this.requires));
        },

        execute: function (/*...*/) {
            /// <summary>
            ///     Calls the command execute method with valued requires object as argument
            ///     Sets command isExecuting
            /// </summary>
            /// <returns type="boolean"></returns>
            if (!this.canExecute()) return DW.Utils.rejectedDeferred;

            var args = [this.requires].append(Array.prototype.slice.call(arguments));

            this.command.isExecuting(true);
            return $.when(this.command.execute.apply(this.command, args)).always((function () {
                this.command.isExecuting(false);
            }).bind(this));
        }
    });

    this.DW = this.DW || {};
    this.DW.CommandBindingAdapter = CommandBindingAdapter;

    var CommandBindingHandler = new Class({
        Extends: BindingHandler,

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary>
            ///     Command custom binding
            ///     Two options for valueAccessor: 
            ///         - command (a class that extends DW.Command), 
            ///         - an object that mapps specific event or custom binding handler to a command
            /// </summary>
            /// <param name="valueAccessor" type="DW.Command or {event_1: DW.Command, event_2: DW.Command }"></param>

            var value = valueAccessor(),
                allBindings = ko.unwrap(allBindingsAccessor()),
                delegated = !!(allBindings && allBindings.delegated),
                commands = value.execute ? { click: value } : value, //wraps a valueAccesor of the simple type to {click: valueAccessor()}
                handledKeyboardKeys = ('click' in commands) ? [$.ui.keyCode.ENTER, $.ui.keyCode.SPACE] : null, //attach for keydown too, so a command is executed on Enter and Space as on click
                disposables = [],
                addDisposable = function (disposable) {
                    disposables.push(disposable);
                    return disposable;
                },
                bindingAdapters = {},
                initBindingAdapters = function () {
                    /// <summary>
                    ///     Creates new binding adapter for that command and saves it in the element dom data
                    /// </summary>
                    var data = ko.utils.domData.get(element, 'command_data') || { bindingAdapters: {} };
                    bindingAdapters = data.bindingAdapters;
                    Object.keys(commands).forEach(function (command) {
                        var cmd = commands[command];
                        bindingAdapters[cmd.id] = addDisposable(new DW.CommandBindingAdapter(cmd, bindingContext));
                    });
                    ko.utils.domData.set(element, 'command_data', {
                        bindingAdapters: bindingAdapters,
                        handledKeyboardKeys: handledKeyboardKeys
                    });
                },

                initBindingHandlers = function () {
                    /// <summary>
                    ///     For each registered binding handler call init with the command 'execute' function as valueAccessor
                    /// </summary>
                    Object.keys(commands).forEach(function (command) {
                        if (ko.utils.isBindingHandler(command)) {
                            var cmd = commands[command],
                                ba = bindingAdapters[cmd.id];
                            
                            ko.bindingHandlers[command].init(
                                element,
                                    ko.utils.wrapAccessor(ba.execute.bind(ba)),
                                allBindingsAccessor,
                                viewModel,
                                    bindingContext);
                        }
                    });

                    // Handle keyboard events to trigger click 
                    if (handledKeyboardKeys) {
                        ko.bindingHandlers.event.init(
                            element,
                            ko.utils.wrapAccessor({
                                keydown: function (vm, event) {
                                    if (handledKeyboardKeys.some(function (key) {
                                        return key == event.keyCode;
                                    })) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        //in knockout, where we get the event from, we have -> Normally we want to prevent default action. Developer can override this be explicitly returning true.
                                        //so we return false if we want to prevent the event to continue
                                        $(event.target).click();
                                        return false;
                                    }
                                    return true;
                                }
                            }),
                            allBindingsAccessor,
                            viewModel,
                            bindingContext);
                    }
                },
                initEventHandlers = function () {
                    /// <summary>
                    ///      For each registered event call it's ko bindingHandler init with the command 'execute' function as valueAccessor
                    /// </summary>
                    var events = {};
                    Object.keys(commands).forEach(function (command) {
                        if (!ko.utils.isBindingHandler(command)) {
                            var cmd = commands[command],
                                ba = bindingAdapters[cmd.id];

                            events[command] = ba.execute.bind(ba);
                        }
                    });

                    if (Object.keys(events).length > 0) {
                        if (delegated) {
                            Object.keys(events).forEach(function (event) {
                                var cmdExecute = events[event];
                                var delegateBindingName = "delegated" + event.substr(0, 1).toUpperCase() + event.slice(1);
                                ko.bindingHandlers[delegateBindingName].init(element, ko.utils.wrapAccessor(cmdExecute));
                            })
                            
                        } else {
                            ko.bindingHandlers.event.init(
                                element,
                                ko.utils.wrapAccessor(events),
                                allBindingsAccessor,
                                viewModel,
                                bindingContext);
                        }
                    }
                },
                initVisibleHandler = function () {
                    /// <summary>
                    ///     For each command, init ko visible binding
                    ///     The command visible function that can be a promise is handeled here
                    /// </summary>
                    var visible = addDisposable(addDisposable(ko.computed(function () {
                        return $.when.apply($, Object.keys(commands).map(function (command) {
                            var cmd = commands[command],
                                ba = bindingAdapters[cmd.id];
                            return ba.visible(); // Here be Promises
                        })).then(function () {
                            return Array.prototype.slice.call(arguments).some(function (v) {
                                return v === true;
                            });
                        });
                    })).extend({ async3: false }));

                    addDisposable(ko.computed(function () {
                        ko.bindingHandlers.visible.update(
                            element,
                            visible,
                            allBindingsAccessor,
                            viewModel,
                            bindingContext);
                    }));
                };

            if ($(element).attr('tabindex') === '0') {
                $(element).attr('tabbable-command', true);
            }

            initBindingAdapters();
            initBindingHandlers();
            initEventHandlers();
            initVisibleHandler();

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                disposables.forEach(function (disposable) {
                    disposable.dispose && disposable.dispose();
                });
                ko.utils.domData.clear(element); // clear the data set to the element

                // NOTE: Don't dispose commands here, they can be bind to other elements to
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary>
            ///     Update enableEx binding when command canExecute changes
            /// </summary>
            var value = valueAccessor(),
                commands = value.execute ? { click: value } : value,
                data = ko.utils.domData.get(element, 'command_data') || { bindingAdapters: {} };

            var canExecute = Object.keys(commands).map(function (command) {
                var cmd = commands[command],
                    ba = data.bindingAdapters[cmd.id];
                return ba.canExecute();
            }).some(function (v) {
                return v === true;
            });

            if ($(element).attr('tabbable-command') === 'true') {
                $(element).attr('tabindex', canExecute ? 0 : -1);
            };

            ko.bindingHandlers.enableEx.update(
                element,
                ko.utils.wrapAccessor(canExecute),
                allBindingsAccessor,
                viewModel,
                bindingContext);
        }
    });

    ko.bindingHandlers.command = new CommandBindingHandler();


    var DelegatedCommandBindingHandler = new Class({
        Extends: BindingHandler,

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var command = ko.unwrap(valueAccessor()),
                bindingAdapter = new DW.CommandBindingAdapter(command, bindingContext);

            ko.bindingHandlers['delegatedClick'].init(element, ko.utils.wrapAccessor(bindingAdapter.execute.bind(bindingAdapter)));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                bindingAdapter.dispose();
            });
        },
    });
    ko.bindingHandlers.delegatedCommand = new DelegatedCommandBindingHandler();

    var DelegatedDblClickCommandBindingHandler = new Class({
        Extends: BindingHandler,

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var command = ko.unwrap(valueAccessor()),
                bindingAdapter = new DW.CommandBindingAdapter(command, bindingContext);

            ko.bindingHandlers['delegatedDblclick'].init(element, ko.utils.wrapAccessor(bindingAdapter.execute.bind(bindingAdapter)));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                bindingAdapter.dispose();
            });
        },
    });
    ko.bindingHandlers.delegatedDblClickCommand = new DelegatedDblClickCommandBindingHandler();


    function addDisposable(disposable, disposables) {
        disposables.push(disposable);
        return disposable;
    };

    //Command group binding handlers

    var CommandGroupBindingHandler = new Class({     
        Extends: BindingHandler,
        adapterString: '',

        addDisposeCallback: function (element) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var disposables = ko.utils.domData.get(element, this.adapterString).disposables || [];
                disposables.forEach(function (disposable) {
                    disposable.dispose();
                });
                ko.utils.domData.set(element, this.adapterString, null);
            }.bind(this));
        },
        initVisibleHandler: function (element, commands, bindingContext) {
            if (!$.isArray(commands)) {
                commands = [commands];
            }

            var data = commands.reduce(function (data, cmd) {
                var ba = new DW.CommandBindingAdapter(cmd, bindingContext);
                data.bindingAdapters[cmd.id] = ba;
                data.disposables.push(ba);
                return data;
            }, {
                bindingAdapters: {},
                disposables: []
            });
            ko.utils.domData.set(element, this.adapterString, data);

            return addDisposable(addDisposable(ko.computed(function () {
                return $.when.apply($, commands.map(function (cmd) {
                    var ba = data.bindingAdapters[cmd.id];
                    return ba.visible(); // Here be Promises
                })).then(function () {
                    return Array.prototype.slice.call(arguments).some(function (v) {
                        return v === true;
                    });
                });
            }), data.disposables).extend({ async3: false }), data.disposables);
        }
    });

    var CommandGroupVisibile = new Class({
        /// <summary>
        ///     Group commands visibility binding. Controls element visibility, so if all the passed to the binding commands have false visible function return value, the element is hidden
        /// </summary>
        Extends: CommandGroupBindingHandler,
        adapterString: 'commandGroupVisible_bindingAdapters',
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary> </summary>
            /// <param name="valueAccessor" type="Array">[command1, command2, command3, ...]</param>
            var visible = this.initVisibleHandler(element, valueAccessor(), bindingContext),
                disposables = ko.utils.domData.get(element, this.adapterString).disposables;

            addDisposable(ko.computed(function () {
                ko.bindingHandlers.visible.update(element, visible, allBindingsAccessor, viewModel, bindingContext);
            }), disposables);

            this.addDisposeCallback(element);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var commands = valueAccessor(),
                bindingAdapters = ko.utils.domData.get(element, this.adapterString).bindingAdapters;

            if (!$.isArray(commands)) {
                commands = [commands];
            }

            var canExecute = commands.map(function (cmd) {
                var ba = bindingAdapters[cmd.id];
                return ba.canExecute();
            }).some(function (v) {
                return v === true;
            });

            ko.bindingHandlers.enableEx.update(element, ko.utils.wrapAccessor(canExecute), allBindingsAccessor, viewModel, bindingContext);
        }
    });

    ko.bindingHandlers.commandGroupVisibile = new CommandGroupVisibile();

    var CommandGroupEnable = new Class({
        /// <summary>
        ///     Group commands enable binding. Controls element enabled/disabled state, so if all the passed to the binding commands have false canExecute return value, the element is disabled
        /// </summary>
        Extends: CommandGroupBindingHandler,
        adapterString: 'commandGroupEnable_bindingAdapters',
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            /// <summary> </summary>
            /// <param name="valueAccessor" type="Array">[command1, command2, command3, ...]</param>
            var data = valueAccessor(),
                visible = this.initVisibleHandler(element, data.commands, bindingContext),
                disposables = ko.utils.domData.get(element, this.adapterString).disposables;

            addDisposable(ko.computed(function () {
                ko.bindingHandlers.enableEx.update(element, ko.utils.wrapAccessor(visible() && data.enable()), allBindingsAccessor, viewModel, bindingContext);
            }), disposables);

            this.addDisposeCallback(element);
        }
    });

    ko.bindingHandlers.commandGroupEnable = new CommandGroupEnable();
}).call(this, jQuery, ko);

(function ($, ko) {
    ko.extenders.async3 = function (target, base) {
        var result = ko.observable(base),
            wait = null,
            handle = function (promise) {
                if (wait) {
                    wait.reject();
                    wait = null;
                }

                if (promise && typeof promise.then == "function") {
                    result(base);
                    wait = $.Deferred(function (t) {
                        promise.then(function (data) {
                            t.resolve(data);
                        });
                    });
                    wait.then(function (data) {
                        result(data);
                        wait = null;
                    });
                } else {
                    result(promise);
                }
            },
            subs = target.subscribe(handle);

        handle(target());

        result.dispose = function () {
            if (wait) {
                wait.reject();
                wait = null;
            }
            subs.dispose();
        };

        return result;
    };

    //ko.extenders.async2 = function (target, base) {
    //    var plain = ko.observable(base), // create simple observable initialized with base value
    //        wait = null,
    //        computed = ko.computed(function () {
    //            if (wait) {
    //                wait.reject();
    //                wait = null;
    //            }

    //            var deferred = target(); // target value is ...
    //            if (deferred && $.isFunction(deferred.then)) { // Promise
    //                wait = $.Deferred();
    //                wait.then(function (data) {
    //                    plain(data);
    //                }, function () {
    //                    plain(base);
    //                });

    //                deferred.then(function (data) {
    //                    if (wait) {
    //                        wait.resolve(data);
    //                        wait = null;
    //                    }
    //                }, function () {
    //                    if (wait) {
    //                        wait.reject();
    //                        wait = null;
    //                    }
    //                });
    //            } else { // not Promise
    //                plain(deferred);
    //            }
    //        });

    //    plain.dispose = function () {
    //        if (wait) {
    //            wait.reject();
    //            wait = null;
    //        }

    //        computed.dispose();
    //    };

    //    return plain;
    //};
}).call(this, jQuery, ko);