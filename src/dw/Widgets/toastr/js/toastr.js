// By: Hans Fj�llemark and John Papa
// https://github.com/CodeSeven/toastr
// 
// Modified to support css styling instead of inline styling
// Inspired by https://github.com/Srirangan/notifer.js/


// -----------------------------------------------------------------------------------
// Example using toastr.progress
// -----------------------------------------------------------------------------------
// var progress = new toastrProgress();
// progress.min = 0;
// progress.max = 100;
// toastr.progress("title", progress);
// Changing the value of the progress will automatically change the progress bar
// var change = function () {
//    progress.value(progress.value() + 10);
//    setTimeout(change, 1000);
// }
// change();
// -----------------------------------------------------------------------------------
// Example using toastr.confirm
// -----------------------------------------------------------------------------------
// The following example will alert true of false when the ok or cancel buttons are clicked respoectively.
// toastr.confirm("title", "message", function (result) { alert(result); });
// -----------------------------------------------------------------------------------

// Class used to controll the progress notification. The progressbar will automatically stop and disapper if the current value is equals to or bigger than the man value.
var toastrProgress = function () {
    var _self = this;
    // The minimum value of the progressbar
    _self.min = 0;
    // The maximum value of the progressbar
    _self.max = 0;
    // The value of the progressbar.
    _self.value = ko.observable(0);
    // Value indicating wether to stop and hide the progress bar.
    _self.stop = ko.observable(false);
    return _self;
};

var toastrClasses = {
    error: 'toast-error',
    info: 'toast-info',
    success: 'toast-success',
    warning: 'toast-warning',
    confirm: 'toast-confirm',
    noIcon: 'toast-no-icon'
};

var toastrTypes = {
    error: 0,
    info: 1,
    success: 2,
    warning: 3,
    confirm: 4,
    errorUnsafe: 5,
    infoUnsafe: 6,
    successUnsafe: 7,
    warningUnsafe: 8,
    confirmUnsafe: 9,
    noIconUnsafe: 10
};

var toastrScope = {
    global: 0,
    local: 1
};

(function (define) {

    function escapeHtml(string) {
        return $('<div />').text(string).html();
    }
    function escapeMessage(message) {
        return $.isArray(message) ? message.map(escapeHtml).join('<br/>') : escapeHtml(message);
    }

    define(['jquery'], function ($) {
        var toastr = (function () {
            var modal_overlay;
            var defaultContainerIdNotify = 'toast-default-container',
                defaultContainerIdConfirm = 'toast-confirm-container',
                defaults = {
                    tapToDismiss: true,
                    toastClass: 'toast',
                    containerClass: 'toast-container',
                    container: defaultContainerIdNotify,
                    debug: false,
                    fadeIn: 300,
                    closeOnHover: true,
                    fadeOut: 1000,
                    extendedTimeOut: 1000,
                    iconClass: toastrClasses.info,
                    positionClass: 'toast-top-right',
                    timeOut: 5000, // Set timeOut to 0 to make it sticky
                    titleClass: 'toast-title',
                    messageClass: 'toast-message',
                    buttons: {
                        ok: {
                            value: true,
                            text: true,
                            label: false,
                            className: 'toastr-confirm-btn toastr-confirm-ok main',
                            url: false,
                            urlTarget: '_blank',
                            role: 'confirm',
                            focus: false
                        },
                        cancel: {
                            text: true,
                            value: false,
                            label: false,
                            className: 'toastr-confirm-btn toastr-confirm-cancel main',
                            url: false,
                            urlTarget: '_blank',
                            role: 'cancel',
                            focus: false
                        }
                    },
                    roles: { confirm: 'ok', cancel: 'cancel' },
                    okText: 'Ok',
                    okUrl: false,
                    cancelText: 'Cancel',
                    cancelUrl: false,
                    footerContent: null,
                    showingCallback: null, // callback fired just before the notification is displayed.
                    closingCallback: null, // callback fired just before the notification is destroyed.                                        
                    modalContainer: null   // container to which the modal div will be attached (i.e. if we pass a container (div), we will make a new modal div covering this div.
                    // if we don't pass anything, the modal div will be attached to the body and will cover the whole window)
                },


                // Shows an error notification.
                // title: Error title
                // message: Error message
                // optionsOverride: Used to override the default options for the current error notification.
                error = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.error,
                        message: escapeMessage(message),
                        optionsOverride: optionsOverride,
                        title: escapeMessage(title)
                    });
                    //return notifyUnsafe(title, message, "", optionsOverride, toastrClasses.error);
                },

                // Shows an error notification. Doesn't escape the string. It allows showing html formatted message.
                // title: Error title
                // message: Error message
                // optionsOverride: Used to override the default options for the current error notification.
                errorUnsafe = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.error,
                        message: message,
                        optionsOverride: optionsOverride,
                        title: title
                    });
                    //return notifyUnsafe(title, unsafeMessagePart, safeMessagePart, optionsOverride, toastrClasses.error);
                },

                notifyUnsafe = function (title, message, optionsOverride, toastrClass) {
                    return notify({
                        iconClass: toastrClass || toastrClasses.info, // by default use info toastr
                        message: message,
                        optionsOverride: optionsOverride,
                        title: title
                    });
                },

                _getContainer = function (container) {
                    /// <summary>get the container we are going to attach to</summary>                    

                    var $container = null;

                    if (!container) return $container;

                    if (typeof container === 'string') {
                        //string
                        $container = $('#' + container);
                    }
                    else if (container.nodeType) {
                        //DOM node
                        $container = $(container);
                    }
                    else if (container.jquery) {
                        //jQuery object
                        $container = container;
                    }

                    return $container;
                },

                getContainer = function (options) {

                    var $container = _getContainer(options.container);

                    if ($container.length) {
                        $container
                            .addClass("toast-container")
                            .addClass(options.positionClass);

                        return $container;
                    }
                    else {
                        $container = $('<div/>')
                            .attr('id', options.container)
                            .addClass("toast-container")
                            .addClass(options.positionClass);

                        $container.appendTo($('body'));

                        return $container;
                    }
                },

                getOptions = function () {
                    return $.extend({}, defaults, toastr.options);
                },

                // Shows an info notification.
                // title: Info title
                // message: Info message
                // optionsOverride: Used to override the default options for the current info notification.
                info = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.info,
                        message: escapeMessage(message),
                        optionsOverride: optionsOverride,
                        title: escapeMessage(title)
                    });
                    //return notifyUnsafe(title, message, "", optionsOverride, toastrClasses.info);
                },

                // Shows an info notification. Doesn't escape the string. It allows showing html formatted message
                // title: Info title
                // message: Info message
                // optionsOverride: Used to override the default options for the current info notification.
                infoUnsafe = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.info,
                        message: message,
                        optionsOverride: optionsOverride,
                        title: title
                    });
                    //return notifyUnsafe(title, unsafeMessagePart, safeMessagePart, optionsOverride, toastrClasses.info);
                },

                noIconUnsafe = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.noIcon,
                        message: message,
                        optionsOverride: optionsOverride,
                        title: title
                    });
                    //return notifyUnsafe(title, unsafeMessagePart, safeMessagePart, optionsOverride, toastrClasses.info);
                },

                // Shows a confirm notification with Ok and Cancel buttons. The Ok and Cancel buttons text can be changed in options okText and cancelText.
                // Doesn't escape the string. It allows showing html formatted message
                // title: Confirm title
                // message: Confirm message
                // resultCallback: Function which will be called when the user clicks the ok or cancel buttons. It will be called with first parameter true for Ok and with false for Cancel
                // optionsOverride: Used to override the default options for the current confirm notification.
                // toastrClass: toastrClasses controlling the notification type. Warning by default.

                confirmUnsafe = function (title, message, resultCallback, optionsOverride, toastrClass) {
                    var options = $.extend({}, getOptions(), { container: defaultContainerIdConfirm });
                    if (typeof (optionsOverride) !== 'undefined') {
                        options = $.extend({}, options, optionsOverride);
                    }
                    var context = {
                        element: null,
                        btnClicked: null,
                        closed: false,
                        options: options,
                        buttons: {},
                        resultCallback: resultCallback || function () { }
                    };

                    var callback = function (confirm, event) {
                        this.btnClicked = true;
                        this.resultCallback.delay(0, null, [confirm]);
                        var button = $(event.target).closest('[role=button]');
                        if (button.is('a')) {
                            window.open(button.attr('href'), button.attr('target'));
                            event.preventDefault();
                        }
                        return true;
                    };

                    message = $('<span>' + message + '<span>');
                    message.append('<br/>');

                    var buttonWrapper = $('<div/>')
                        .css('text-align', 'center')
                        .appendTo(message);

                    var defaultFocus = null,
                        buttons = Object.clone(options.buttons);

                    for (var name in buttons) {

                        if (buttons[name].focus) defaultFocus = name;

                        buttons[name].label = buttons[name].label || options[name + 'Text'];
                        var url = buttons[name].url || options[name + 'Url'];
                        var target = buttons[name].urlTarget || options[name + 'UrlTarget'];
                        var className = buttons[name].className || options[name + 'ClassName'];
                        var button = $(url ? '<a href="' + url + '" target="' + target + '"/>' : '<button/>')
                            .attr('aria-name', name)
                            .attr('tabindex', '0')
                            .addClass(className)
                            .button(buttons[name])
                            .click(callback.bind(context, buttons[name].value))
                            .appendTo(buttonWrapper);

                        context.buttons[name] = button;
                    }

                    if (!defaultFocus)
                        defaultFocus = Object.keys(context.buttons).getLast();

                    if (options.footerContent)
                        var footer = $(options.footerContent).appendTo(message);

                    //VO not needed? var visible = ko.observable(true);                    
                    var show = function ($element) {
                        $element.keydown(function (event) {
                            var code = (event.keyCode ? event.keyCode : event.which);
                            var keyCode = $.ui.keyCode;
                            switch (code) {
                                case keyCode.TAB:
                                case keyCode.RIGHT:
                                case keyCode.DOWN:
                                    buttonWrapper.find(':focus').next().focus();
                                    break;
                                case keyCode.LEFT:
                                case keyCode.UP:
                                    buttonWrapper.find(':focus').prev().focus();
                                    break;
                                case keyCode.ESCAPE:
                                    this.buttons[options.roles.cancel].trigger('click');
                                    break;
                                case keyCode.SPACE:
                                case keyCode.ENTER:
                                    for (var name in this.buttons) {
                                        var button = this.buttons[name];
                                        if (button.is(event.target)) {
                                            button.trigger('click');
                                        }
                                    }
                                    break;
                            }
                            event.stopPropagation();
                            return false;
                        }.bind(this));

                        var buttonOnFocus = this.buttons[defaultFocus];
                        buttonOnFocus.focus.delay(100, buttonOnFocus);

                        if (modal_overlay && modal_overlay.parent().length) {
                            // do nothing
                        } else {
                            var modalContainer = _getContainer(options.modalContainer);
                            modal_overlay = $("<div />", {
                                "class": "ui-widget-overlay toast-modal-overlay"
                            }).appendTo(modalContainer ? modalContainer : 'body');
                        }
                        // check visability
                        if (modal_overlay.is(':not(:visible)')) {
                            // and show it
                            modal_overlay.fadeIn("fast");
                        }
                    }.bind(context);


                    var close = function () {

                        if (this.closed || exists($toastrElement) == false) return;

                        this.closed = true;

                        $(this.buttons.ok).add(this.buttons.cancel).button("destroy");

                        var $overlay = $toastrElement.data('toastr-modal-overlay');

                        if (!$overlay) return;

                        var $container = $toastrElement.data('toastr-container');
                        // This is the last item in this container
                        if ($container.children().length === 1) {
                            // ...so we must remove it
                            $overlay.fadeOut("fast", $.proxy($overlay.remove, $overlay));
                        }
                    }.bind(context);

                    var oldClosingCallback = options.closingCallback;
                    options = $.extend({}, options, {
                        timeOut: 0,
                        fadeOut: 0,
                        extendedTimeOut: 0,
                        positionClass: "toast-center",
                        tapToDismiss: false,
                        showingCallback: show,
                        closingCallback: function () {
                            if (typeof oldClosingCallback === 'function') oldClosingCallback();
                            close();
                        },
                        onclick: function () {
                            // We return true and close the notification only if a button is clicked.
                            return this.btnClicked;
                        }.bind(context)
                    });

                    var $toastrElement = notify({
                        iconClass: toastrClass || toastrClasses.confirm,
                        message: message,
                        title: escapeMessage(title),
                        optionsOverride: options,
                    });//VO not needed?, visible);
                    // store the instance of the modal overlay.
                    $toastrElement.data('toastr-modal-overlay', modal_overlay);
                    return $toastrElement;
                },

                // Shows a confirm notification with Ok and Cancel buttons. The Ok and Cancel buttons text can be changed in options okText and cancelText.
                // title: Confirm title
                // message: Confirm message
                // resultCallback: Function which will be called when the user clicks the ok or cancel buttons. It will be called with first parameter true for Ok and with false for Cancel
                // optionsOverride: Used to override the default options for the current confirm notification.
                // toastrClass: toastrClasses controlling the notification type. Warning by default.
                confirm = function (title, message, resultCallback, optionsOverride, toastrClass) {
                    return confirmUnsafe(title, escapeMessage(message), resultCallback, optionsOverride, toastrClass);
                },

                // Shows a progress notification. Doesn't escape the string. It allows showing html formatted message
                // title: Progress title
                // progress: a toastrProgress object used to define and controll the progress value.
                // optionsOverride: used to override the default options just for the current progress notification instance.
                progress = function (title, progress, optionsOverride) {
                    var options = $.extend({}, getOptions());

                    if (typeof (optionsOverride) !== 'undefined') {
                        options = $.extend({}, options, optionsOverride);
                    }

                    var message = $('<div class="toastr-progress"></div>').progressbar({ value: progress.value(), min: progress.min, max: progress.max });

                    var visible = ko.computed(function () {
                        if (typeof (progress.value()) === 'boolean')
                            return !progress.value() && !progress.stop()

                        return progress.value() < progress.max && !progress.stop();
                    });

                    var closed = false;
                    var close = function () {
                        if (!closed) {
                            visible.dispose();
                            valueChanged.dispose();
                            if (exists($toastrElement))
                                message.progressbar("destroy");
                            closed = true;
                        }
                    };

                    var oldClosingCallback = options.closingCallback;
                    options = $.extend({}, options, {
                        tapToDismiss: false,
                        closingCallback: function () {
                            if (typeof oldClosingCallback === 'function') oldClosingCallback();
                            close();
                        }
                    });

                    var $toastrElement = notify({
                        iconClass: toastrClasses.info,
                        message: message,
                        title: escapeMessage(title),
                        optionsOverride: options
                    }, visible);

                    var valueChanged = progress.value.subscribe(function (val) {
                        if (exists($toastrElement)) {
                            message.progressbar("option", "value", val).click(null, function () {
                                return true;
                            });
                        }
                    }, this);

                    return $toastrElement;
                },

                // map: options
                // visible: ko.observable or ko.computed returning the visibility state of the notification (true or false)
                notify = function (map, visible) {
                    var options = $.extend({}, getOptions());

                    if (typeof (map.optionsOverride) !== 'undefined') {
                        options = $.extend({}, getOptions(), map.optionsOverride);
                    }

                    var savedTimeOut = options.timeOut;
                    var savedExtendedTimeOut = options.extendedTimeOut;
                    if (visible !== undefined) {
                        options.timeOut = 0;
                        options.savedExtendedTimeOut = 0;
                    }

                    var iconClass = map.iconClass || options.iconClass,
                        intervalId = null,
                        $container = getContainer(options),
                        $toastElement = $('<div/>'),
                        $titleElement = $('<div/>'),
                        $messageElement = $('<div/>'),
                        response = { options: options, map: map };

                    $toastElement.append($('<div/>').addClass('ui-icon icon-auto').addClass('dw-icon-' + iconClass));

                    if (map.iconClass) {
                        $toastElement.addClass(options.toastClass).addClass(iconClass);
                    }

                    if (map.title) {
                        $titleElement.append(map.title).addClass(options.titleClass);
                        $toastElement.append($titleElement);
                    }

                    if (map.message) {
                        $messageElement.append(map.message).addClass(options.messageClass);
                        $toastElement.append($messageElement);
                    }

                    var fadeAway = function () {

                        var fade = function (callback) {
                            return $toastElement.fadeOut(options.fadeOut, callback);
                        }

                        var removeToast = function () {
                            // Add exception only for Mozilla FF
                            if ($.browser.mozilla) {
                                var focused = $(':focus', $toastElement);
                                if (focused.length > 0) {
                                    focused.get(0).blur();
                                }
                            }

                            if ($toastElement.is(':visible')) {
                                return;
                            }

                            if (typeof options.closingCallback === 'function') options.closingCallback();

                            $toastElement.remove();
                            //toastr was open in default scope
                            if ($.inArray($container.attr('id'), [defaultContainerIdNotify, defaultContainerIdConfirm]) > -1 && $container.children().length === 0) {
                                $container.remove();
                            }
                        }

                        fade(removeToast);
                    }

                    var delayedFadeAway = function () {
                        if (options.timeOut > 0 || options.extendedTimeOut > 0) {
                            intervalId = setTimeout(fadeAway, options.extendedTimeOut);
                        }
                    }

                    var stickAround = function () {
                        clearTimeout(intervalId);
                        $toastElement.stop(true, true).fadeIn(options.fadeIn);
                    }

                    if (visible !== undefined) {
                        var visibilityChanged = visible.subscribe(function (visible) {
                            if (!visible) {
                                if (savedTimeOut > 0 || savedExtendedTimeOut > 0) {
                                    options.timeOut = savedTimeOut;
                                    options.savedExtendedTimeOut = savedExtendedTimeOut;
                                    delayedFadeAway();
                                }
                                else
                                    fadeAway();
                                visibilityChanged.dispose();
                            }
                        });
                    }

                    $toastElement
                        .data('toastr-container', $container)
                        .data('toastr-api', {
                            close: function () {
                                if (visible !== undefined) {
                                    visible(false);
                                } else if ($.isFunction(options.onclick)) {
                                    $toastElement.click();
                                } else {
                                    fadeAway();
                                }
                            },
                            forceClose: function () {
                                if (visible !== undefined) {
                                    visible(false);
                                } else {
                                    fadeAway();
                                }
                            }
                        })
                        .hide()
                        .prependTo($container);

                    if (typeof options.showingCallback === 'function') options.showingCallback($toastElement);
                    $toastElement.fadeIn(options.fadeIn);

                    if (options.timeOut > 0) {
                        intervalId = setTimeout(fadeAway, options.timeOut);
                    }

                    if (visible === undefined && options.closeOnHover) {
                        $toastElement.hover(stickAround, delayedFadeAway);
                    }

                    if (!$.isFunction(options.onclick) && options.tapToDismiss) {
                        $('body').one("mousedown keydown", fadeAway);
                    }

                    if ($.isFunction(options.onclick)) {
                        $toastElement.click(function () {
                            options.onclick() && fadeAway();
                        });
                    }

                    if (options.debug) {
                        console.log(response);
                    }
                    return $toastElement;
                },


                // Shows a success notification.
                // title: Success title
                // message: Success message
                // optionsOverride: Used to override the default options for the current success notification.
                success = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.success,
                        message: escapeMessage(message),
                        optionsOverride: optionsOverride,
                        title: escapeMessage(title)
                    });
                },

                // Shows a success notification. Doesn't escape the string. It allows showing html formatted message
                // title: Success title
                // message: Success message
                // optionsOverride: Used to override the default options for the current success notification.
                successUnsafe = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.success,
                        message: message,
                        optionsOverride: optionsOverride,
                        title: title
                    });
                },


                // Shows a warning notification.
                // title: Warning title
                // message: Warning message
                // optionsOverride: Used to override the default options for the current warning notification.
                warning = function (title, message, optionsOverride) {
                    return notify({
                        iconClass: toastrClasses.warning,
                        message: escapeMessage(message),
                        optionsOverride: optionsOverride,
                        title: escapeMessage(title)
                    });

                    //return notifyUnsafe(title, message, "", optionsOverride, toastrClasses.warning);
                },

                warningUnsafe = function (title, message, optionsOverride) {
                    //return notifyUnsafe(title, unsafeMessagePart, safeMessagePart, optionsOverride, toastrClasses.warning);
                    return notify({
                        iconClass: toastrClasses.warning,
                        message: message,
                        optionsOverride: optionsOverride,
                        title: title
                    });
                },


            clear = function () {
                var options = getOptions();
                //var $container = $('#' + options.containerId);
                var $container = _getContainer(options.container);
                if ($container.length) {
                    $container.fadeOut(options.fadeOut, function () {
                        $container.remove();
                    })
                }
            },

            // Check if a notification exists in the notifications list
            exists = function ($toastrElement) {
                var $container = $toastrElement.data('toastr-container');
                return $container ? $container.find($toastrElement).length > 0 : false;
            },

            close = function ($toastrElement) {
                var api = $toastrElement.data('toastr-api');
                return api ? api.close() : false;
            },
            forceClose = function ($toastrElement) {
                if (exists($toastrElement)) {
                    var api = $toastrElement.data('toastr-api');
                    if (api) api.forceClose();
                }
            };

            return {
                defaults: defaults,
                clear: clear,
                error: error,
                errorUnsafe: errorUnsafe,
                info: info,
                infoUnsafe: infoUnsafe,
                confirm: confirm,
                confirmUnsafe: confirmUnsafe,
                progress: progress,
                options: {},
                success: success,
                successUnsafe: successUnsafe,
                version: '1.0.3',
                warning: warning,
                warningUnsafe: warningUnsafe,
                exists: exists,
                close: close,
                forceClose: forceClose,
                noIconUnsafe: noIconUnsafe
            }
        })()
        return toastr;
    })
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory(require(deps[0]));
    } else {
        window['toastr'] = factory(window['jQuery']);
    }

}));
//} (window, jQuery));