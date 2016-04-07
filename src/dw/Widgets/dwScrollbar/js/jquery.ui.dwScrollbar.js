(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "jquery-ui", , "../../../utils"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($) {
    (function () {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());

    $.fn.extend({
        scrollHeight: function () {
            return this.get(0).scrollHeight;
        },
        scrollWidth: function () {
            return this.get(0).scrollWidth;
        },
        hasScrollBar: function (orientation) {
            if (orientation == 'vertical') {
                return Math.round(this.scrollHeight()) > Math.round(this.innerHeight());
            }
            else if (orientation == 'horizontal') {
                return Math.round(this.scrollWidth()) > Math.round(this.innerWidth());
            }
            return this.hasScrollBar('horizontal') || this.hasScrollBar('vertical');
        }
    });

    var utils = {
        validInt: function (any) {
            var int = parseInt(any, 10);
            return isNaN(int) ? 0 : int;
        },
        measure: function (element, rootSelector, method, includeMargin) {
            var $element = $(element),
                measure = function (target) {
                    // get the actual value with user specific methed
                    // it can be 'width', 'height', 'outerWidth', 'innerWidth'... etc
                    // includeMargin only works for 'outerWidth' and 'outerHeight'
                    return /(outer)/.test(method) ?
                        target[method](includeMargin) :
                        target[method]();
                };

            if ($element.is(':visible')) {
                return measure($element);
            }
            var marker = 'dw-scrollbar-utils-measure',
                $root = $element.addClass(marker)
                    .parents(rootSelector)
                    .eq(0)
                    .clone()
                    .attr('style', 'position: absolute !important; top: -10000 !important;')
                    .appendTo('body'),
                size = measure($root.find('.' + marker));
            $root.remove();
            $element.removeClass(marker);
            return size;
        },
        fixScrollOffset: (function () {
            var ua = window.navigator.userAgent;
            // is IE
            return (ua.indexOf("MSIE ") > 0 || !!ua.match(/Trident.*rv:([0-9]{1,}[\.0-9]{0,})/) ||
                // or is FireFox
                ua.toLowerCase().indexOf('firefox') > -1);
        })()
    };

    $.widget('dw.dwScrollbarTrack', {
        orientation: null,
        props: null,
        orientationProperties: {
            horizontal: {
                size: 'width',
                inner: 'innerWidth',
                outer: 'outerWidth',
                scrollSize: 'scrollWidth',
                scrollOffset: 'scrollLeft',
                dragDelta: 'deltaX',
                eventPage: 'pageX',
                handleOffset: 'left',
                paddingRB: 'paddingBottom',
                borderLT: 'borderLeftWidth',
                borderRB: 'borderRightWidth'
            },
            vertical: {
                size: 'height',
                inner: 'innerHeight',
                outer: 'outerHeight',
                scrollSize: 'scrollHeight',
                scrollOffset: 'scrollTop',
                dragDelta: 'deltaY',
                eventPage: 'pageY',
                handleOffset: 'top',
                paddingRB: 'paddingRight',
                borderLT: 'borderTopWidth',
                borderRB: 'borderBottomWidth'
            }
        },
        options: {
            debug: false,
            pane: null,
            minHandleSize: 10,
            orientation: 'horizontal',
            clickTrackToScroll: true,
            usePointerEvents: true,
            autoAdjustContentPadding: false,
            scrollIncrement: 20,
            buttonIncrementInterval: 17,
            drawButtons: true,
            visibleClass: null,
            trackClass: null,
            handleHTML: null,
            handleClass: null,
            buttonLTClass: null,
            arrowHtmlLT: null,
            buttonRBClass: null,
            arrowHtmlRB: null,
            scrollToolsClass: null,
            preventClickPropagation: false
        },
        _create: function () {
            this.orientation = this.options.orientation == 'vertical' ? 'vertical' : 'horizontal';
            this.props = this.orientationProperties[this.orientation];
            this.CS = {};
            this._initElements();
            this._initEvents();
        },
        _initElements: function () {
            this.element.addClass('dw-track-wrapper')
                .addClass(this.options.trackWrapperClass);

            this.track = $('<div/>')
                .addClass('dw-track')
                .addClass(this.options.trackClass)
                .appendTo(this.element);

            this.handle = $('<div/>')
                .addClass('dw-track-handle')
                .addClass(this.options.handleClass)
                .append(this.options.handleHTML)
                .appendTo(this.track);

            if (this.options.drawButtons) {
                this.buttonTL = $('<div/>')
                    .append(this.options.arrowHtmlLT)
                    .addClass(this.options.buttonLTClass)
                    .insertBefore(this.track);

                this.buttonBR = $('<div/>')
                    .append(this.options.arrowHtmlRB)
                    .addClass(this.options.buttonRBClass)
                    .insertAfter(this.track);
            }

            this.element.disableSelection();

            this._inspectStyles();
        },
        _inspectStyles: function () {

            var padding = utils.validInt(this.options.pane.css(this.props.paddingRB)),
                originalPadding = padding;

            if (this.options.autoAdjustContentPadding) {
                padding += utils.measure(this.element, '.' + this.options.scrollToolsClass, (this.orientation == 'vertical' ? 'outerWidth' : 'outerHeight'), true);
            }

            $.extend(this.CS, {
                padding: padding,
                originalPadding: originalPadding,
                borderSize: utils.validInt(this.element.css(this.props.borderLT)) + utils.validInt(this.element.css(this.props.borderRB))
            });
        },
        _initEvents: function () {

            this._on(this.options.pane, { 'scroll': '_handleScroll' });

            this._on(this.handle, {
                'dragstart': '_handleDragstart',
                'drag': '_handleDrag',
                'dragend': '_handleDragend'
            });

            if (this.options.drawButtons) {
                this._initButtonEvents(this.buttonTL, -this.options.scrollIncrement);
                this._initButtonEvents(this.buttonBR, this.options.scrollIncrement);
            }

            if (this.options.clickTrackToScroll) {
                this._on(this.track, { 'click': '_handleTrackClick' })
            }

            if (this.options.preventClickPropagation) {
                this._on(this.element, {
                    'click': function (event) {
                        event.stopImmediatePropagation();
                    }
                });
            }
        },
        _getEventName: function (eventName) {
            eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
            if (this.options.usePointerEvents) {
                eventName = eventName.replace(/mouse/g, 'pointer');
            }
            return eventName;
        },
        _initButtonEvents: function (button, step) {
            var callback = $.proxy(this._handleButtonDown, this, step),
                interval = this.options.buttonIncrementInterval,
                clickHandlerResult = !this.options.preventClickPropagation,
                listeners = [
                {
                    event: this._getEventName('click'),
                    handler: function (e) { return clickHandlerResult; }
                },
                {
                    event: this._getEventName('mousedown'),
                    handler: function (e) {
                        e.preventDefault();
                        $(this).data('buttonScrollInterval', setInterval(callback, interval));
                    }
                },
                {
                    event: this._getEventName('mouseup mouseout'),
                    handler: function (e) {
                        e.preventDefault();
                        clearInterval($(this).data('buttonScrollInterval'));
                    }
                }
                ];

            for (var i = 0; i < listeners.length; i++) {
                button.bind(listeners[i].event, listeners[i].handler);
            }
        },
        _handleButtonDown: function (step) {
            var offset = Math.min(this.CS.scrollSize - this.CS.paneSize, Math.max(0, Math.round(this.CS.scrollOffset + step)));
            if (this.CS.scrollOffset == offset) {
                return;
            }
            this.trackScroll(this.CS.scrollOffset + step);
        },
        _handleScroll: function () {
            this.CS.scrollOffset = this.options.pane[this.props.scrollOffset]();
            if (this.dragging) return;
            this._updateHandleOffset();
        },
        _handleDragstart: function (event, dd) {
            this.dragging = true;
            this.handle.addClass('active');
            dd.options = {
                // current offset
                initial: parseInt(this.handle.css(this.props.handleOffset), 10),
                // ratio for scroll offset
                ratio: (this.CS.scrollSize - this.CS.paneSize) / (this.CS.trackSize - this.CS.handleSize),
                // minimal offset value
                min: 0,
                // maximal offset value
                max: this.track[this.props.outer]() - this.handle[this.props.outer](),
                // helepers
                current: null,
                memo: null
            };
        },
        _handleDrag: function (event, dd) {
            // Calculate offset
            dd.options.current = Math.min(dd.options.max, Math.max(dd.options.min, dd.options.initial + dd[this.props.dragDelta]));
            // Skip all if there is no difference
            if (dd.options.memo === dd.options.current) {
                return;
            }
            // Move handle
            this.handle.css(this.props.handleOffset, dd.options.current);
            // Trigger event
            this.trackScroll(Math.round(dd.options.current * dd.options.ratio));
            // Memorize current offset
            dd.options.memo = dd.options.current;
        },
        _handleDragend: function (event, dd) {
            this.handle.removeClass('active');
            setTimeout($.proxy(function () {
                this.dragging = false;
            }, this), 0);
        },
        _handleTrackClick: function (event) {
            if (this.dragging || this.track.is(event.target) === false) {
                return;
            }
            // Calculate offset
            var handleOffset = this.handle.offset()[this.props.handleOffset],
                eventPage = event[this.props.eventPage],
                step = eventPage > handleOffset ? this.CS.paneSize : -this.CS.paneSize,
                offset = Math.min(this.CS.scrollSize - this.CS.paneSize, Math.max(0, Math.round(this.CS.scrollOffset + step)));

            if (this.CS.scrollOffset == offset) {
                return;
            }

            this.trackScroll(offset);
        },
        trackScroll: function (offset) {
            var data = {};
            data[this.props.handleOffset] = offset;
            this._trigger('trackscroll', null, data);
        },
        resize: function (offset) {

            this.CS.scrollSize = this.options.pane[this.props.scrollSize]();
            this.CS.scrollOffset = this.options.pane[this.props.scrollOffset]();
            this.CS.paneSize = Math.round(this.options.pane[this.props.inner]());

            var size = this.options.pane[this.props.inner]() - offset;
            // Solve Zoom Factor problems
            size = Math.abs(this.CS.scrollSize - size) < 1 ? this.CS.scrollSize : size;

            // Scrollbar handle represents the ratio between hidden and visible content.
            this.CS.ratio = this.CS.paneSize / this.CS.scrollSize;
            var hasScroll = this.CS.ratio < 1;
            this.element[hasScroll ? 'show' : 'hide']();
            this.options.pane.css(this.props.paddingRB, hasScroll ? this.CS.padding : this.CS.originalPadding);

            // check if there are changes in the layout after applyed paddings
            if (this.CS.padding != this.CS.originalPadding) {
                var currentScrollSize = this.options.pane[this.props.scrollSize]();
                if (currentScrollSize > 0 && currentScrollSize !== this.CS.scrollSize) {
                    this.resize(offset);
                    return;
                }
            }
            if (!hasScroll) {
                return;
            }

            // Calculate track size
            this.CS.trackSize = size - this.CS.borderSize;
            if (this.options.drawButtons) {
                this.CS.trackSize -= this.buttonTL[this.props.outer]();
                this.CS.trackSize -= this.buttonBR[this.props.outer]();
            }

            // Calculate handle size
            this.CS.handleSize = Math.max(this.CS.ratio * this.CS.trackSize, this.options.minHandleSize);
            this.CS.handleSize -= this.handle[this.props.outer]() - this.handle[this.props.size]();

            // Set styles
            this.track[this.props.size](this.CS.trackSize);
            this.handle[this.props.size](this.CS.handleSize);
            this._updateHandleOffset();
        },
        _updateHandleOffset: function () {
            if (this.CS.ratio < 1) {
                // Calculate handle offset
                var handleOffset = (this.CS.scrollOffset / (this.CS.scrollSize - this.CS.paneSize)) * (this.CS.trackSize - this.CS.handleSize);
                this.handle.css(this.props.handleOffset, handleOffset);
            }
        },
        destroy: function () {

            this._off(this.options.pane);
            this._off(this.handle);

            this.element.removeClass('dw-track-wrapper')
                .removeClass(this.options.trackWrapperClass);

            if (this.options.drawButtons) {
                this.buttonTL.off().remove();
                this.buttonTL = null;
                this.buttonBR.off().remove();
                this.buttonBR = null;
            }

            if (this.options.clickTrackToScroll) {
                this._off(this.track);
                this.track.remove();
                this.track = null;
            }

            delete this.CS;

            this._superApply(arguments);
        },
        _debug: function () {
            if (this.options.debug)
                console.log.apply(console, arguments);
        }
    });

    $.widget('dw.dwScrollbar', {
        _scrollIsVisible: false,
        scrollTools: null,
        verticalTrack: null,
        horizontalTrack: null,
        scrollCorner: null,
        content: null,
        cache: null,
        options: {
            enabled: true,
            debug: false,
            theme: 'scroll-theme-default',
            scrollContent: null,
            autoAdjustContentPadding: false,
            verticalScrolling: true,
            horizontalScrolling: true,
            showOnHover: false,
            scrollIncrement: 20,
            usePointerEvents: true,
            handleTouchEvents: true,
            mouseWheelInvert: false,
            mouseWheelNormalizeDelta: true,
            buttonsClickIncrementInterval: 17,
            minScrollbarLength: 16,
            pollChanges: false,
            drawCorner: true,
            drawScrollButtons: false,
            clickTrackToScroll: true,
            preventClickPropagation: false,

            scrollWrapperClass: 'scroll-wrapper',
            scrollContentClass: 'scroll-content',
            scrollVisibleClass: 'scroll-visible',
            scrollHorizontalVisibleClass: 'scroll-horizontal-visible',
            scrollVerticalVisibleClass: 'scroll-vertical-visible',
            scrollToolsClass: 'scroll-tools',
            scrollToolsPosition: 'before',
            trackDragEventListener: document.body,

            verticalTrackWrapperClass: 'vertical-track-wrapper',
            horizontalTrackWrapperClass: 'horizontal-track-wrapper',
            verticalTrackClass: 'vertical-track',
            horizontalTrackClass: 'horizontal-track',
            horizontalHandleClass: 'horizontal-handle',
            verticalHandleClass: 'vertical-handle',
            scrollUpButtonClass: 'scroll-up-btn',
            scrollDownButtonClass: 'scroll-down-btn',
            scrollLeftButtonClass: 'scroll-left-btn',
            scrollRightButtonClass: 'scroll-right-btn',
            cornerClass: 'scrollbar-corner',

            zIndex: 4,
            horizontalHandleHTML: '<div class="left"></div><div class="right"></div>',
            verticalHandleHTML: '<div class="top"></div><div class="bottom"></div>',
            arrowUpHTML: '<div class="arrow-up"></div>',
            arrowRightHTML: '<div class="arrow-right"></div>',
            arrowDownHTML: '<div class="arrow-down"></div>',
            arrowLeftHTML: '<div class="arrow-left"></div>'
        },
        _debug: function () {
            if (this.options.debug)
                console.log.apply(console, arguments);
        },
        _create: function () {
            this.cache = {};
            if (this.options.enabled == false) {
                this.options.autoAdjustContentPadding = false;
                this.options.verticalScrolling = false;
                this.options.horizontalScrolling = false;
                this.options.drawCorner = false;
                this.options.scrollContent = false;
                this.options.scrollWrapperClass = 'scroll-widget-disabled';
                this.options.scrollContentClass = 'b';
                this.options.scrollVisibleClass = 'c';
            };

            var oldStyle = this.element.attr('style'),
                paddingBottom = parseInt(this.element.css('padding-bottom'), 10),
                paddingRight = parseInt(this.element.css('padding-right'), 10);

            this.element.addClass(this.options.scrollWrapperClass);

            if (this.options.scrollContent === false) {
                // Nothing to do
            } else if (this.options.scrollContent) {
                this.content = $(this.options.scrollContent, this.element).addClass(this.options.scrollContentClass);
            } else {
                this.content = this.element.wrapInner('<div class="' + this.options.scrollContentClass + '" />').find('.' + this.options.scrollContentClass);
            }

            this.scrollTools = $('<div />')
                .addClass(this.options.scrollToolsClass)
                .addClass(this.options.theme)
                .css('z-index', this.options.zIndex)
                .css('opacity', 0);

            this.options.scrollToolsPosition == 'after' ? this.scrollTools.insertAfter(this.element) : this.scrollTools.insertBefore(this.element);

            // if we want vertical scrolling, create and initialize
            // the horizontal scrollbar and its components
            if (this.options.verticalScrolling) {
                this.verticalTrack = $('<div />').appendTo(this.scrollTools).dwScrollbarTrack({
                    debug: this.options.debug,
                    pane: this.element,
                    trackscroll: $.proxy(this._handleTrackScroll, this),
                    usePointerEvents: this.options.usePointerEvents,
                    autoAdjustContentPadding: this.options.autoAdjustContentPadding,
                    clickTrackToScroll: this.options.clickTrackToScroll,
                    preventClickPropagation: this.options.preventClickPropagation,
                    orientation: 'vertical',
                    drawButtons: this.options.drawScrollButtons,
                    arrowHtmlLT: this.options.arrowUpHTML,
                    arrowHtmlRB: this.options.arrowDownHTML,
                    scrollIncrement: this.options.scrollIncrement,
                    visibleClass: this.options.verticalVisibleClass,
                    trackWrapperClass: this.options.verticalTrackWrapperClass,
                    trackClass: this.options.verticalTrackClass,
                    handleHTML: this.options.verticalHandleHTML,
                    handleClass: this.options.verticalHandleClass,
                    buttonLTClass: this.options.scrollUpButtonClass,
                    buttonRBClass: this.options.scrollDownButtonClass,
                    scrollToolsClass: this.options.scrollToolsClass
                });
            }

            // if we want horizontal scrolling, create the elements for and
            // initialize the horizontal track and handle
            if (this.options.horizontalScrolling) {
                this.horizontalTrack = $('<div />').appendTo(this.scrollTools).dwScrollbarTrack({
                    debug: this.options.debug,
                    pane: this.element,
                    trackscroll: $.proxy(this._handleTrackScroll, this),
                    usePointerEvents: this.options.usePointerEvents,
                    autoAdjustContentPadding: this.options.autoAdjustContentPadding,
                    clickTrackToScroll: this.options.clickTrackToScroll,
                    preventClickPropagation: this.options.preventClickPropagation,
                    orientation: 'horizontal',
                    drawButtons: this.options.drawScrollButtons,
                    arrowHtmlLT: this.options.arrowLeftHTML,
                    arrowHtmlRB: this.options.arrowRightHTML,
                    scrollIncrement: this.options.scrollIncrement,
                    visibleClass: this.options.horizontalVisibleClass,
                    trackWrapperClass: this.options.horizontalTrackWrapperClass,
                    trackClass: this.options.horizontalTrackClass,
                    handleHTML: this.options.horizontalHandleHTML,
                    handleClass: this.options.horizontalHandleClass,
                    buttonLTClass: this.options.scrollLeftButtonClass,
                    buttonRBClass: this.options.scrollRightButtonClass,
                    scrollToolsClass: this.options.scrollToolsClass
                });
            }

            if (this.options.verticalScrolling && this.options.horizontalScrolling && this.options.drawCorner) {
                this.scrollCorner = $('<div />')
                    .addClass(this.options.cornerClass)
                    .appendTo(this.scrollTools);
            }

            // add a tabindex attribute to the pane if it doesn't already have one
            // if the element does not have a tabindex in IE6, undefined is returned,
            // all other browsers return an empty string
            if (!this.element.attr('tabindex')) {
                this.element.attr('tabindex', 0);
            }

            // Attach key handlers only if current scrollable area is not writable
            if (this.element.is('textarea,input') == false) {
                this._on(this.element, { 'keydown': '_handleKeydown' });
            }

            // listen for mouse wheel and scroll appropriately
            this._on(this.element, {
                'scroll': '_handleScroll',
                'mousewheel': '_handleMousewheel'
            });

            // optional listener for touch events
            if (this.options.handleTouchEvents && DW.Utils.isTouchEnabled()) {
                this.element.addClass('touch-enabled');
                this._on(this.element, {
                    'pointerdown': '_handlePointerDown',
                });
            }

            this._on(this.scrollTools, {
                'mousewheel': '_handleMousewheel'
            });

            // Reposition the scrollbars if the window is resized
            this._on(window, {
                'resize': '_handleResize'
            });

            // if showOnHover is set, attach the hover listeners
            if (this.options.showOnHover) {
                this._on(this.element.add(this.scrollTools), {
                    'pointerenter': '_handlePointerenter',
                    'pointermove': '_handlePointermove',
                    'pointerleave': '_handlePointerleave'
                });
            }
            this._postCreateTimeoutId = setTimeout($.proxy(this._postCreate, this), 0);
        },
        _postCreate: function () {

            if (!this.options.showOnHover) {
                this.scrollTools.css('opacity', 1);
            }
            // start polling for changes in dimension and position or just update the layout
            if (this.options.pollChanges) {
                this.update(); //initial update
                this.startPolling();
            } else {
                this.update();
            }
        },
        _getEventData: function (data) {
            return $.extend({
                scrollTools: this.scrollTools,
                element: this.element,
                width: this.element.width(),
                height: this.element.height()
            }, data);
        },
        _getCreateEventData: function () {
            return this._getEventData();
        },
        _fixScrollOffsetAfterDisplayHiddenForIE: function () {

            var props = {
                Height: 'Top',
                Width: 'Left'
            };
            // save offsets in cache
            for (var key in props) {
                var scroll = this.element['scroll' + key](),
                    size = this.element['inner' + key](),
                    offset = this.element['scroll' + props[key]](),
                    ratio = offset / (scroll - size);

                this.cache['offsetRatio' + key] = isNaN(ratio) ? 0 : ratio;
            }
            this.elementWasHidden = false;
            if (!this.fixScrollHandlerIsAttached) {
                // Start listner
                this.fixScrollHandlerIsAttached = true;
                this.fixScrollHandlerIntervalId = setInterval($.proxy(function () {
                    var isVisible = this.element.is(':visible');
                    // check if element was hidden
                    if (isVisible && this.elementWasHidden) {
                        var eventData = {}, propsKey, scroll, size;
                        for (var key in props) {
                            scroll = this.element['scroll' + key]();
                            size = this.element['inner' + key]();
                            propsKey = 'scroll' + props[key];
                            eventData[propsKey] = (scroll - size) * this.cache['offsetRatio' + key];
                            this.element[propsKey](eventData[propsKey]);
                        }
                        this._trigger('fixScrollOffset', null, eventData);
                    }
                    this.elementWasHidden = !isVisible;
                }, this), 100);
            }
        },

        _handlePointerenter: function (event) {
            this._showScrollTools(false);
        },

        _handlePointerleave: function (event) {
            this._hideScrollTools();
        },

        _handlePointermove: function (event) {
            if (this._scrollIsVisible) {
                clearTimeout(this._fadeTimer);
                this._fadeTimer = setTimeout($.proxy(this._hideScrollTools, this), 1000);
            } else {
                this._showScrollTools(true);
            }
        },

        _showScrollTools: function (scheduleHide) {

            if (this._scrollIsVisible === true) return;

            clearTimeout(this._fadeTimer);
            this._scrollIsVisible = true;

            this.scrollTools.stop().animate({ opacity: 1 }, 100);

            if (scheduleHide !== false) {
                this._fadeTimer = setTimeout($.proxy(this._hideScrollTools, this), 1000);
            }
        },

        _hideScrollTools: function () {

            if (this._scrollIsVisible === false) return;
            this._scrollIsVisible = false;

            this.scrollTools.stop().animate({ opacity: 0 }, 300);
            this._fadeTimer = null;
        },

        _handleScroll: function (event) {
            if (this.options.showOnHover) {
                this._showScrollTools();
            }
            if (utils.fixScrollOffset) {
                this._fixScrollOffsetAfterDisplayHiddenForIE();
            }
        },

        _handleTrackScroll: function (event, ui) {
            this.scrollTo(ui);
        },

        _handleMousewheel: function (event, delta, deltaX, deltaY) {

            // invert mouse
            if (!this.options.mouseWheelInvert) {
                delta = delta * -1;
            }
            // normalize delta
            if (this.options.mouseWheelNormalizeDelta) {
                delta = delta < 0 ? -1 : 1;
            }
            // handle vertical scrolling
            if (Math.abs(deltaY) > 0) {
                var scroll = this.element.scrollTop();
                this.scrollTo({ top: scroll + (this.options.scrollIncrement * delta) });
                if (scroll !== this.element.scrollTop()) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
            // handle horizontal scrolling
            if (Math.abs(deltaX) > 0) {
                var scroll = this.element.scrollLeft();
                this.scrollTo({ left: scroll + (this.options.scrollIncrement * delta) });
                if (scroll !== this.element.scrollLeft()) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
        },

        _handlePointerDown: function (event) {
            var oEvent = event.originalEvent;
            if (!oEvent || oEvent.pointerType !== 'touch') {
                return;
            }
            event.stopImmediatePropagation();
            this.touch = {
                started: true,
                clientX: oEvent.clientX,
                clientY: oEvent.clientY,
                axis: null,
                delta: 0
            };
            this._on(this.document, {
                'pointermove': '_handlePointerMove',
                'pointerup': '_handlePointerUp'
            });
        },

        _handlePointerMove: function (event) {
            var oEvent = event.originalEvent,
                touchX = event.clientX,
                touchY = event.clientY,
                deltaX = this.touch.clientX - touchX,
                deltaY = this.touch.clientY - touchY;

            if (touchY === this.touch.clientY && touchX === this.touch.clientX) {
                this.touch.axis = null;
            } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
                this.touch.axis = 'y';
                this.touch.clientY = touchY;
                this.touch.delta = deltaY;
            } else {
                this.touch.axis = 'x';
                this.touch.clientX = touchX;
                this.touch.delta = deltaX;
            }
            event.preventDefault();

            if (this.touch.axis === 'y') {
                this.scrollBy({ 'top': this.touch.delta });
            } else if (this.touch.axis === 'x') {
                this.scrollBy({ 'left': this.touch.delta })
            }
        },
        _handlePointerUp: function () {
            this._off(this.document, 'pointermove pointerup');
            this.touch.started = false;
            this.touch.t = 0,
            this.touch.d = Math.round(Math.abs(this.touch.delta * 1.75)),
            this.touch.c10lg2 = 10 * this.touch.delta * Math.log(2);
            this._touchFinish();
        },

        _touchFinish: function touchFinish() {
            if (this.touch.t === this.touch.d || this.touch.started) {
                return;
            }

            var delta = Math.round(
                this.touch.c10lg2 / this.touch.d * Math.pow(2, -10 * this.touch.t / this.touch.d + 1)
            );

            if (!isNaN(delta) && delta !== 0) {
                this.touch.t += 1;
                if (this.touch.axis === 'y') {
                    this.scrollBy({ 'top': delta });
                } else {
                    this.scrollBy({ 'left': delta });
                }
                window.requestAnimationFrame($.proxy(this._touchFinish, this));
            }
        },

        _handleResize: function () {
            this.reposition();
        },

        _handleKeydown: function (event) {
            // don't handle events that have just bubbled up
            if (!this.element.is(event.target)) {
                return true;
            }
            switch (event.keyCode) {
                case 32: // space
                case 34: // page down
                    this.scrollBy({ top: this.element.height() });
                    return false;
                case 33: // page up
                    this.scrollBy({ top: -this.element.height() });
                    return false;
                case 35: // end
                    this.scrollTo({ top: this.element.scrollHeight() });
                    return false;
                case 36: // home
                    this.scrollTo({ top: 0 });
                    return false;
                case 37: // left
                    this.scrollBy({ left: -this.options.scrollIncrement });
                    return false;
                case 38: // up
                    this.scrollBy({ top: -this.options.scrollIncrement });
                    return false;
                case 39: // right
                    this.scrollBy({ left: this.options.scrollIncrement });
                    return false;
                case 40: // down
                    this.scrollBy({ top: this.options.scrollIncrement });
                    return false;
            }
            return true;
        },

        // Public methods
        scrollBy: function (props) {
            var offsets = {};
            for (var key in props) {
                offsets[key] = this.element['scroll' + key.charAt(0).toUpperCase() + key.slice(1)]() + props[key];
            }
            this.scrollTo(offsets);
        },

        scrollTo: function (props) {
            var methods = {
                left: 'scrollLeft',
                top: 'scrollTop'
            };
            for (var key in props) {
                if (key in methods)
                    this.element[methods[key]](props[key]);
            }
        },

        refresh: function () {
            this.resize();
            this.reposition();
        },

        update: function () {
            this.refresh();
        },

        reposition: function () {
            if (this.options.verticalScrolling) {
                this.verticalTrack.position({
                    my: 'right top',
                    at: 'right top',
                    collision: 'none',
                    of: this.element
                });
            }

            if (this.options.horizontalScrolling) {
                this.horizontalTrack.position({
                    my: 'left bottom',
                    at: 'left bottom',
                    collision: 'none',
                    of: this.element
                });
            }

            if (this.options.verticalScrolling && this.options.horizontalScrolling && this.options.drawCorner) {
                this.scrollCorner.position({
                    my: 'right bottom',
                    at: 'right bottom',
                    collision: 'none',
                    of: this.element
                });
            }
        },

        resize: function () {
            if (!this.element.is(':visible')) {
                return;
            }

            var hasVertical = this.options.verticalScrolling && this.element.hasScrollBar('vertical');
            var hasHorisontal = this.options.horizontalScrolling && this.element.hasScrollBar('horizontal');
            var hasScroll = hasVertical || hasHorisontal;
            
            if (this.options.verticalScrolling) {
                this.verticalTrack.dwScrollbarTrack('resize', (hasHorisontal ? this.horizontalTrack.outerHeight() : 0));
            }

            if (this.options.horizontalScrolling) {
                this.horizontalTrack.dwScrollbarTrack('resize', (hasVertical ? this.verticalTrack.outerWidth() : 0));
            }

            if (this.scrollCorner) {
                this.scrollCorner[(hasVertical && hasHorisontal) ? 'show' : 'hide']();
            }

            this.element[hasScroll ? 'addClass' : 'removeClass'](this.options.scrollVisibleClass);
            this.element[hasHorisontal ? 'addClass' : 'removeClass'](this.options.scrollHorizontalVisibleClass);
            this.element[hasVertical ? 'addClass' : 'removeClass'](this.options.scrollVerticalVisibleClass);

            this._trigger('resize', null, this._getEventData({
                hasScroll: hasScroll,
                hasHorisontal: hasHorisontal,
                hasVertical: hasVertical
            }));
        },

        //startPolling: function () {
        //    this.cache = {
        //        width: -1,
        //        height: -1,
        //        scrollWidth: -1,
        //        scrollHeight: -1,
        //        offset: -1
        //    };
        //    this.options.pollChanges = true;
        //    this._changeListener();
        //},

        startPolling: function () {

            var _self = this;

            var __updateScrollOnDomChange = DW.Utils.throttle(function () {
                if (!_self.scrollTools) { return; }
                _self.scrollTools.css('opacity', 1);
                _self.update();
            }, 400);

            // register 'dw.domchange' event to the element 
            // refer to DW.Utils.registerObserveDomElement
            DW.Utils.registerObserveDomElement(this.element);
            // attach to the element 'dw.domchange' event
            this.element.on('dw.domchange', function (e, result) {
                __updateScrollOnDomChange();
            });
        },

        _removePolling: function () {
            if (this.options.pollChanges) {
                DW.Utils.disconnectObserveDomElement(this.element);
            }
        },

        _changeListener: function () {
            if (!this.options.pollChanges) {
                return;
            }
            var el = this.element,
                scrollWidth = el.scrollWidth(),
                scrollHeight = el.scrollHeight(),
                width = el.width(),
                height = el.height(),
                offset = el.offset();

            if ((this.options.verticalScrolling && (height !== this.cache.height || scrollHeight !== this.cache.scrollHeight)) ||
                (this.options.horizontalScrolling && (width !== this.cache.width || scrollWidth !== this.cache.scrollWidth))) {
                this.cache.scrollWidth = scrollWidth;
                this.cache.scrollHeight = scrollHeight;
                this.resize();
            }

            if (offset.left !== this.cache.offset.left ||
                offset.top !== this.cache.offset.top ||
                width !== this.cache.width ||
                height !== this.cache.height) {

                this.cache.offset = offset;
                this.cache.width = width;
                this.cache.height = height;
                this.reposition();
            }
            setTimeout($.proxy(this._changeListener, this), 350);
        },

        stopPolling: function () {
            this.options.pollChanges = false;
        },
        show: function () {
            this.scrollTools.show();
        },
        hide: function () {
            this.scrollTools.hide();
        },

        destroy: function () {
            clearTimeout(this._postCreateTimeoutId);
            this._removePolling();
            this._hideScrollTools();

            if (this.options.verticalScrolling) {
                if (this.verticalTrack.is('dw-dwScrollbarTrack')) {
                    this.verticalTrack.dwScrollbarTrack('destroy');
                }
                this.verticalTrack.remove();
                this.verticalTrack = null;
            }
            if (this.options.horizontalScrolling) {
                if (this.horizontalTrack.is('dw-dwScrollbarTrack')) {
                    this.horizontalTrack.dwScrollbarTrack('destroy');
                }
                this.horizontalTrack.remove();
                this.horizontalTrack = null;
            }

            this.scrollTools.remove();
            this.scrollTools = null;
            this._superApply(arguments);
        },
        getSize: function () {
            var width = 0, height = 0;

            if (this.options.verticalScrolling) {
                width = this.verticalTrack.outerWidth();
            }

            if (this.options.horizontalScrolling) {
                height = this.horizontalTrack.outerHeight();
            }

            return { width: width, height: height };
        }
    });
}));