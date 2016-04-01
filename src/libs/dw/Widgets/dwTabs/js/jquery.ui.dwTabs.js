(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "jquery-ui"], factory);
    } else { // Global
        factory(jQuery);
    }
}(function ($) {
    $.widget('dw.dwTabs', $.ui.tabs, {
        KEY_ENDING: 'ending',
        KEY_BEGINNING: 'beginning',
        sortableInitialized: false,
        options: {
            show: 'dwShow',
            hide: 'dwHide',
            scrollable: false,
            orientation: 'horizontal',
            changeOnScroll: false,
            buttonClassPrev: 'ui-icon button ui-tabs-arrow-prev',
            buttonClassNext: 'ui-icon button ui-tabs-arrow-next',
            buttonClassQuickMenu: 'ui-icon button ui-tabs-arrow-down',
            showQuickMenu: false,
            quickMenuSelector: '.ui-tabs-quick-menu',
            quickMenuHolder: '#HeaderMenuHolder',
            sortable: false,
            navigationHidden: false,
            debug: false,
            cssQueries: null,
            flex: false
        },
        orientationProperties: {
            horizontal: {
                size: 'width',
                inner: 'innerWidth',
                outer: 'outerWidth',
                paddingLT: 'paddingLeft',
                paddingRB: 'paddingRight',
                marginLT: 'marginLeft',
                marginRB: 'marginRight',
                LT: 'left'
            },
            vertical: {
                size: 'height',
                inner: 'innerHeight',
                outer: 'outerHeight',
                paddingLT: 'paddingTop',
                paddingRB: 'paddingBottom',
                marginLT: 'marginTop',
                marginRB: 'marginBottom',
                LT: 'top'
            }
        },
        _helperClassNames: {
            navigationHidden: 'ui-tabs-nav-hidden',
            countNone: 'ui-tabs-count-none',
            countSingle: 'ui-tabs-count-single',
            countMany: 'ui-tabs-count-many'
        },
        _tabsGetScrollOffset: function () {
            return -(parseInt(this.tablist.css(this.CS.props.marginLT), 10));
        },
        _inspectStyles: function () {
            // Get current offsets
            if (this.options.flex) {
                this.element.removeClass('ui-tabs-flex');
            }
            var tabs = this.tabs,
                tabsSize = 0,
                headerSize = this.header[this.CS.props.inner]();
            this.CS.tabs = [];

            for (var i = 0; i < tabs.length; i++) {

                var size = $(tabs[i])[this.CS.props.outer](true);
                var tab = {
                    size: size
                };
                tab[this.KEY_ENDING] = tabsSize + size;
                tab[this.KEY_BEGINNING] = tabsSize;

                this.CS.tabs.push(tab);

                tabsSize += size;
            }

            var arrowsVisible = (this.CS.tabsOffsetsLT + tabsSize > headerSize) && tabs.length > 1;

            if (this.options.flex && arrowsVisible) {
                this.element.addClass('ui-tabs-flex');
            }
            for (var i = 0; i < tabs.length; i++) {
                this._processCssAttributes(tabs[i]);
            }

            $.extend(this.CS, {
                headerSize: headerSize,
                tabsSize: tabsSize,
                endOffset: Math.max(0, (arrowsVisible ? (tabsSize + this.CS.buttonsSizeRB + this.CS.buttonsSizeLT) : tabsSize) - headerSize),
                arrowsVisible: arrowsVisible
            });
        },
        _processCssAttributes: function (element) {
            var memo = {};
            for (var attr in this.options.cssQueries) {
                var values = this.options.cssQueries[attr];
                memo[attr] = [];
                for (var k = 0; k < values.length; k++) {
                    var val = parseInt(values[k]);

                    if ((attr == "min-width" && element.offsetWidth >= val) ||
                        (attr == "max-width" && element.offsetWidth <= val) ||
                        (attr == "min-height" && element.offsetHeight >= val) ||
                        (attr == "max-height" && element.offsetHeight <= val)) {
                        // Add matching attr value
                        memo[attr].push(values[k]);
                    }
                }
                $(element).attr(attr, memo[attr].join(' '));
                delete memo[attr];
            }
        },
        _getOffset: function (element, properties) {

            var offsets = 0;
            for (var i = 0; i < properties.length; i++) {
                offsets += parseInt(element.css(properties[i]), 10);
            }

            return offsets;
        },
        _create: function () {
            var o = this.options;

            this.orientation = o.orientation == 'vertical' ? 'vertical' : 'horizontal';

            this.CS = {
                tabsOffsetsLT: 0,
                buttonsSizeLT: 0,
                buttonsSizeRB: 0,
                tabsSize: 0,
                quickMenuSize: 0,
                headerSize: 0,
                arrowsVisible: false,
                tabs: [],
                props: this.orientationProperties[this.orientation]
            };

            if (!o.scrollable) {
                this._super();
                if (this.options.sortable) {
                    this._handleSortable();
                }
                return;
            }

            this.header = $('<div class="ui-tabs-nav-scrollable"></div>')
                .prependTo(this.element);

            this.arrowPrev = $('<div class="ui-tabs-arrow ' + o.buttonClassPrev + '"></div>').appendTo(this.header);
            this.arrowNext = $('<div class="ui-tabs-arrow ' + o.buttonClassNext + '"></div>').appendTo(this.header);

            if (this.options.showQuickMenu) {
                this.arrowQuickMenu = $('<div class="ui-tabs-arrow ' + o.buttonClassQuickMenu + '"></div>').appendTo(this.header);
                this.quickMenu = this.element.find(this.options.quickMenuSelector).hide();
                if (this.options.quickMenuHolder) {
                    this.quickMenu.before('<div class="quick-menu-placeholder ui-hidden"></div>')
                        .appendTo(this.options.quickMenuHolder);
                }
            }

            this._super();

            this.element.addClass('ui-tabs-scrollable');

            /* Add ui-tabs-vertical or ui-tabs-horisontal according to orientation type */
            this.element
                .addClass('ui-tabs-' + this.orientation)
                .addClass('ui-helper-clearfix');

            this.tablist.removeClass('ui-widget-header ui-corner-all');
            this.header.append(this.tablist);

            // inspect initial styles;
            this.CS.tabsOffsetsLT = this._getOffset(this.tablist, [this.CS.props.paddingLT]);
            this.CS.buttonsSizeLT = this.arrowPrev[this.CS.props.outer]();
            this.CS.buttonsSizeRB = this.arrowNext[this.CS.props.outer]();
            this.CS.quickMenuSize = this.quickMenu ? this.arrowQuickMenu[this.CS.props.outer]() : 0;

            if (this.orientation == 'horizontal') {
                this.CS.buttonsSizeRB += this.CS.quickMenuSize;
            } else {
                this.CS.buttonsSizeLT += this.CS.quickMenuSize;
            }
            if (this.options.sortable) {
                this._handleSortable();
            }
            this._inspectStyles();
        },
        _handleSortable: function (event, ui) {

            this._initSortable();

            if (this.sortableInitialized) {
                // disable sortable if there is only one item
                var curState = this.tablist.sortable("option", "disabled");
                var newState = this.tabs.length < 2;
                // if the new state is different from current..
                if (curState !== newState) {
                    this.tablist.sortable("option", "disabled", newState);
                }
            }
        },
        _initSortable: function () {

            if (this.tabs.length == 0 || this.sortableInitialized) {
                return;
            }

            this.sortableInitialized = true;

            this.element.addClass('ui-tabs-sortable');

            this.tablist.sortable({
                axis: (this.orientation == 'vertical' ? 'y' : 'x'),
                delay: 150,
                helper: "clone",
                start: function (e, ui) {
                    ui.item.addClass('ui-sortable-item')
                        .data('previndex', ui.item.index());
                }.bind(this),
                stop: function (e, ui) {
                    ui.item.removeClass('ui-sortable-item');
                    var oldIndex = ui.item.data('previndex');
                    var newIndex = ui.item.index();

                    if (ui.item.css('display') == 'inline-block') {
                        ui.item.get(0).style.display = '';
                    }

                    if (oldIndex !== newIndex) {
                        ui.oldIndex = oldIndex;
                        ui.newIndex = newIndex;
                        this._trigger.delay(0, this, ['sort', e, ui]);
                    }
                    e.preventDefault();
                    return false;
                }.bind(this),
                sort: function (event, ui) {
                    if (this.CS.arrowsVisible == false) {
                        return;
                    }
                    clearTimeout(this.timeoutId);
                    this.timeoutId = this._handleSortableDrag.delay(50, this, arguments);
                }.bind(this)
            });
        },
        _handleSortableDrag: function (event, ui) {
            var sortable = $(this.tablist).data('ui-sortable'),
                o = sortable.options,
                offset = this._tabsGetScrollOffset(),
                size = ui.item[this.CS.props.outer](true),
                position = ui.position[this.CS.props.LT],
                direction;

            // left side
            if (position <= this.CS.tabsOffsetsLT) {
                direction = this.KEY_BEGINNING;
            } else if ((position + size) >= this.CS.headerSize) {
                direction = this.KEY_ENDING;
            } else {
                return;
            }

            this._scrollTo(this._findOffset(direction));
        },
        _scrollTo: function (offset, delay, callback) {
            if (this.options.flex) {
                return;
            }
            delay = delay || 250;
            callback = callback || $.noop
            offset = Math.min(this.CS.endOffset, Math.max(offset, 0));
            var animation = {};
            animation[this.CS.props.marginLT] = -(offset);
            this.tablist.stop(true).animate(animation, delay, function () {
                this._setButtonsState();
                callback();
            }.bind(this));
        },

        _setupEvents: function () {

            this._superApply(arguments);

            if (!this.options.scrollable) {
                return;
            }
            if (this.options.flex) {
                this.addEvents({
                    activate: function (event, ui) {
                        [ui.newTab.get(0), ui.oldTab.get(0)]
                            .clean()
                            .each(this._processCssAttributes.bind(this));
                    }.bind(this)
                });
            }
            var arrows = this.arrowPrev.add(this.arrowNext);

            this._off(arrows.add(this.header).add(this.arrowQuickMenu));

            this._on(arrows, {
                'click': '_arrowClick'
            });

            this._on(this.header, {
                mousewheel: '_headerMousewheel'
            });
            var hoverables = arrows;
            if (this.options.showQuickMenu) {
                this._on(this.arrowQuickMenu, {
                    'click': '_toggleQuickMenu'
                });
                hoverables = hoverables.add(this.arrowQuickMenu);
            }

            this._focusable(hoverables);
            this._hoverable(hoverables);
        },
        _eventHandler: function (event) {
            this._superApply(arguments);

            if (!this.options.scrollable) {
                return;
            }

            var index = $(event.currentTarget)
                    .closest('li')
                    .index(),
                tab = this.CS.tabs[index],
                offset = this._tabsGetScrollOffset(),
                beginning = tab[this.KEY_BEGINNING],
                ending = Math.max(0, (this.CS.arrowsVisible ? (tab[this.KEY_ENDING] + this.CS.buttonsSizeRB + this.CS.buttonsSizeLT) : tab[this.KEY_ENDING]) - this.CS.headerSize);

            if (beginning < offset) {
                offset = beginning;
            } else if (ending > offset) {
                offset = ending;
            } else {
                return;
            }
            this._scrollTo(offset);
        },
        _findOffset: function (direction) {
            var isNext = (direction == this.KEY_ENDING),
                offset = this._tabsGetScrollOffset(),
                offset = isNext ? offset + this.CS.headerSize : offset,
                tabs = this.CS.tabs.slice(0),
                tabs = isNext ? tabs : tabs.reverse();

            for (var index = 0; index < tabs.length; index++) {
                var tab_offset = tabs[index][direction];
                if ((isNext && tab_offset > offset) || (!isNext && tab_offset < offset)) {
                    offset = tab_offset;
                    break;
                }
            }
            offset -= isNext ? (this.CS.headerSize - this.CS.tabsOffsetsLT - this.CS.buttonsSizeRB) : 0;
            return offset;
        },
        _arrowClick: function (event) {
            event.preventDefault();
            var o = this.options,
                isNext = $(event.currentTarget).hasClass(o.buttonClassNext),
                direction = isNext ? this.KEY_ENDING : this.KEY_BEGINNING;

            if (o.changeOnScroll) {
                this.select(o.selected + (isNext ? 1 : -1));
            }

            this._scrollTo(this._findOffset(direction));
        },

        _toggleQuickMenu: function (event) {
            if (this.quickMenu.is(':visible')) {
                this._hideQuickMenu();
            } else {
                this._showQuickMenu();
            }
        },
        _hideQuickMenu: function () {
            this.quickMenu.hide().css({
                left: '',
                top: ''
            });
            this.arrowQuickMenu.removeClass('ui-state-active');
            this._off(this.document, 'click');
        },
        _showQuickMenu: function () {

            this.arrowQuickMenu.addClass('ui-state-active');

            this.quickMenu.show().position({
                my: "right top-1",
                at: "right bottom",
                of: this.arrowQuickMenu,
                collision: 'none'
            }).find(":tabbable")
                .eq(0)
                .focus();
            // put this in another "thread" because the click event is not handled in this moment.
            this._on.delay(0, this, [this.document, { 'click': '_hideQuickMenu' }]);
        },
        _headerMousewheel: function (e, d, dX, dY) {

            if (!this.CS.arrowsVisible) {
                return;
            }
            e.preventDefault();
            if (d === -1) {
                this.arrowNext.click();
            } else if (d === 1) {
                this.arrowPrev.click();
            }
        },
        _setButtonsState: function () {

            var offset = this._tabsGetScrollOffset();
            $([{
                element: this.arrowPrev,
                enabled: offset > 0
            }, {
                element: this.arrowNext,
                enabled: offset < this.CS.endOffset
            }]).each(function () {
                this.element[this.enabled ? 'removeClass' : 'addClass']('ui-state-disabled');
                if (!this.enabled) this.element.removeClass('ui-state-hover');
            });
        },
        _setHelperClasses: function () {
            var element = this.element,
                classNames = this._helperClassNames,
                countClassName = element.data('countClassName');

            element[this.options.navigationHidden ? 'addClass' : 'removeClass'](classNames.navigationHidden);

            countClassName ? element.removeClass(countClassName) : null;

            countClassName = [
                classNames.countNone,
                classNames.countSingle,
                classNames.countMany
            ][Math.min(2, this.tabs.length)];

            element.addClass(countClassName)
                .data('countClassName', countClassName);
        },
        _resize: function () {
            if (this.options.showQuickMenu) {
                this._hideQuickMenu();
            }
            this._inspectStyles();
            this._setButtonsState();

            if (this.CS.arrowsVisible) {
                this.header.addClass('ui-tabs-arrows');
                if (this._tabsGetScrollOffset() > this.CS.endOffset) {
                    this._scrollTo(this.CS.endOffset);
                }
            } else {
                this.header.removeClass('ui-tabs-arrows');
                // scroll to beginning
                this._scrollTo(0);
            }
        },
        resize: function () {
            if (this.options.scrollable) {
                this.header[this.options.navigationHidden ? 'hide' : 'show']();
                this._resize();
            }
            if (this.options.sortable) {
                this._handleSortable();
            }
        },
        _cleanupMissings: function () {

            var missings = this.bindings.filter(function (idx, element) {
                return $(element).closest(this.element).length === 0;
            }.bind(this));

            if (missings.length == 0) return;

            var references = [
                'bindings', 'focusable', 'hoverable'
            ];

            missings.unbind(this.eventNamespace);

            for (var i = 0; i < references.length; i++) {
                var reference = references[i];
                this[reference] = this[reference].not(missings);
                delete this[reference]['prevObject'];
            };
        },
        refresh: function () {
            this._superApply(arguments);
            this._setHelperClasses();
            this._cleanupMissings();
            this.resize();
        },
        _destroy: function () {

            this.tablist.stop(true);
            if (this.sortableInitialized) {
                this.tablist.sortable("destroy");
                delete this['sortableInitialized'];
            }

            var elements = [
                    'arrowPrev',
                    'arrowNext',
                    'header'
            ],
                properties = [
                    'orientation',
                    'arrowQuickMenu',
                    'quickMenu',
                    'CS'
                ].concat(elements);

            if (this.options.showQuickMenu) {
                this._hideQuickMenu();
                if (this.options.quickMenuHolder) {
                    this.quickMenu
                        .appendTo(this.element.find('.quick-menu-placeholder'))
                        .unwrap();
                    elements.push('quickMenu');
                }
            }

            Array.forEach(elements, function (key) {
                if (this[key] && this[key].remove) this[key].remove();
            }, this);

            Array.forEach(properties, function (key) {
                this[key] = null;
            }, this);

            this._super();
        },
        addEvents: function (eventHandlers) {
            var eventPrefix = this.widgetName.toLowerCase(),
                element = this.element,
                namespace = this.eventNamespace;

            for (var key in eventHandlers) {
                var eventName = eventPrefix + key + namespace;
                element.bind(eventName, eventHandlers[key]);
            }
        }
    });
}));