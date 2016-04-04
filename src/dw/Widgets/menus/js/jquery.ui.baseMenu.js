$.widget('ui.baseMenu', $.ui.menu, {
    options: {
        enableDwScrollbar: false,
        enableKeyboard: true,
        filterClicks: true,
        autohideUnnesessaryItems: true,
        handlePropagationStopped: false
    },
    _create: function () {
        this._super();
        if (this.options.autohideUnnesessaryItems) {
            this._manageUnnesessaryItems();
        }
        if (this.options.enableDwScrollbar) {
            this._manageScrollbar();
        }
        if (this.options.enableKeyboard) {
            this._manageKeyboard();
        }
        if (this.options.filterClicks) {
            this._on({ 'click': '_handleClick' });
        }
        this.addEvents({
            "hide": function (event, ui) {
                var menus = this.element.find(this.options.menus + '[aria-expanded="true"]');
                if (menus.length > 0) {
                    // Need to be passed the parent element of the menu
                    this._close(menus.parent());
                    this.activeMenu = this.element;
                }
            }.bind(this)
        });
    },
    _handleClick: function (event) {
        if (this._hideIsPrevented(event)) {
            event.stopImmediatePropagation();
        }
    },
    _activate: function (event) {
        if (this.active) {
            this._super(event);
        }
    },
    _manageKeyboard: function () {
        this.addEvents({
            select: function (event, ui) {
                switch (event.keyCode) {
                    case $.ui.keyCode.ENTER:
                    case $.ui.keyCode.SPACE:
                        ui.item.click();
                        break;
                }
            },
            focus: function (event) {
                if (event.keyCode == $.ui.keyCode.LEFT || event.keyCode == $.ui.keyCode.RIGHT) {
                    event.stopPropagation();
                }
            }
        });
    },
    _open: function (submenu) {
        var item = submenu.parent();
        var args = { item: item, submenu: submenu };
        this._trigger("opening", null, args);
        this._superApply(arguments);
        item.trigger('submenuopen'); // trigger custom event in current menu item
        this._trigger("open", null, args);
    },
    _close: function (startMenu) {
        if (!startMenu) {
            startMenu = this.active ? this.active.parent() : this.element;
        }

        if (!startMenu.is(':visible')) { return; }

        var args = { startMenu: startMenu };

        this._trigger("closing", null, args);
        this._superApply(arguments);
        this._trigger("close", null, args);
    },

    _manageUnnesessaryItems: function () {

        var hideItems = function (element) {
            element.find('>.ui-menu-divider').show();

            var items = element.find('>li:visible');

            $().add(items.first())
                .add(items.last())
                .filter('.ui-menu-divider')
                .hide();
        };

        this.addEvents({
            "show": function (event, ui) {
                hideItems.apply(this, [this.element]);
                if (this.element.find(">.ui-menu-item:visible").length == 0) {
                    this.hide();
                }
            }.bind(this),
            "open": function (event, ui) {
                hideItems.apply(this, [ui.submenu]);
                if (ui.submenu && ui.submenu.find(">.ui-menu-item:visible").length == 0) {
                    ui.submenu.hide();
                }
            }.bind(this)            
        });

    },
    _manageScrollbar: function () {

        var eventPrefix = this.widgetName.toLowerCase(),
            dataKey = 'dw-scrollbar-' + this.eventNamespace,
            element = this.element,
            resetCurrentScroll = function (data) {
                data.current.dwScrollbar('hide');
                data.current = null;
            },
            eventHandlers = {
                "hide": function (event, ui) {
                    var data = $(this).data(dataKey);
                    if (data.current) {
                        resetCurrentScroll(data);
                    }
                },
                "show": function (event, ui) {
                    var data = $(this).data(dataKey);
                    if ($(this).is('.scroll-wrapper')) {
                        data.current = $(this).dwScrollbar('show').dwScrollbar('update');
                    } else if (data.current) {
                        resetCurrentScroll(data);
                    }
                },
                "closing": function (event, ui) {
                    var data = $(this).data(dataKey);
                    if (ui.startMenu.is(':not(.scroll-wrapper)') && data.current) {
                        resetCurrentScroll(data);
                    }
                },
                "open": function (event, ui) {
                    var data = $(this).data(dataKey);
                    if (ui.submenu.is('.scroll-wrapper')) {
                        // check active scrollbars
                        if (data.current && data.current.is(ui.submenu) == false) {
                            resetCurrentScroll(data);
                        }
                        data.current = ui.submenu.dwScrollbar('show').dwScrollbar('update');
                    } else if (data.current) {
                        resetCurrentScroll(data);
                    }
                },
                "update": function (event, ui) {
                    var data = $(this).data(dataKey);
                    if ($(this).is('.scroll-wrapper')) {
                        data.current = $(this).dwScrollbar('update');
                    } 
                }
            };

        element.data(dataKey, { current: null });

        this.addEvents(eventHandlers);
    },
    addEvents: function (eventHandlers) {
        var eventPrefix = this.widgetName.toLowerCase(),
            element = this.element,
            namespace = this.eventNamespace;

        for (var key in eventHandlers) {
            var eventName = eventPrefix + key + namespace;
            element.bind(eventName, eventHandlers[key]);
        }
    },
    _move: function (direction, filter, event) {
        var next;
        if (this.active) {
            if (direction === "first" || direction === "last") {
                next = this.active
					[direction === "first" ? "prevAll" : "nextAll"](".ui-menu-item:visible")
					.eq(-1);
            } else {
                next = this.active
					[direction + "All"](".ui-menu-item:visible")
					.eq(0);
            }
        }
        if (!next || !next.length || !this.active) {
            next = this.activeMenu.children(".ui-menu-item:visible")[filter]();
        }
        //console.log('focus', event, next)
        this.focus(event, next);
    },
    focus: function (event, item) {
        var nested, focused;
        this.blur(event, event && event.type === "focus");
        // ugly hack to prevent focusing from keyboard in some cases..
        if (event && this.options.handlePropagationStopped && event.isPropagationStopped()
                && (event.keyCode == $.ui.keyCode.UP || event.keyCode == $.ui.keyCode.DOWN)) {
            return;
        }

        this._scrollIntoView(item);

        this.active = item.first();
        focused = this.active.children("a").addClass("ui-state-focus");
        // Only update aria-activedescendant if there's a role
        // otherwise we assume focus is managed elsewhere
        if (this.options.role) {
            this.element.attr("aria-activedescendant", focused.attr("id"));
        }

        // Highlight active parent menu item, if any
        this.active
			.parent()
			.closest(".ui-menu-item")
			.children("a:first")
			.addClass("ui-state-active");

        if (event && event.type === "keydown") {
            this._close();
        } else {
            this.timer = this._delay(function () {
                this._close();
            }, this.delay);
        }

        nested = item.children(".ui-menu");
        if (nested.length && (/^mouse/.test(event.type))) {
            this._startOpening(nested);
        }
        this.activeMenu = item.parent();

        this._trigger("focus", event, { item: item });
    },
    _hideIsPrevented: function (event) {
        // Current element is part of the menu
        if (this.element.has(event.target).length > 0) {
            // Checking menu item
            var item = $(event.target).closest('.ui-menu-item');

            // Item is a check mark
            if (item.is('.dw-checkmark')) {
                return true;
            }

            // Item has a submenu
            if (item.find('.ui-menu-item').length > 0) {
                return true;
            }
        }
    },
    isFirstItem: function () {
        return this.active && !this.active.prevAll(".ui-menu-item:visible").length;
    },

    isLastItem: function () {
        return this.active && !this.active.nextAll(".ui-menu-item:visible").length;
    }
});
