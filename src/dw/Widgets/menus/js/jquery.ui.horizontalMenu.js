$.widget('ui.horizontalMenu', $.ui.baseMenu, {
    // You can specify the following menu options including standart jQuery UI Menu options -> http://api.jqueryui.com/menu/.
    delay: 0,
    options: {
        icons: {
            submenu: 'ui-icon-menuitem-arrow'
        },
        position: {
            my: "left top",
            at: "left bottom",
            collision: "none"
        },
        selector: null,
        containerClass: 'ui-menu-horizontal',
        responsive: true,
        dropdownClass: 'ui-menu-dropdown',
        dropdownText: {
            enabled: false,
            more: {
                text: "More",
                title: "Show more"
            },
            all: {
                text: 'Menu',
                title: 'Open/Close Menu'
            }
        }
    },
    _open: function (submenu) {
        this._superApply(arguments);
        if (!submenu) {
            return;
        }
        var menuitem = submenu.siblings('[role=menuitem]');
        this._setOpenedState(menuitem);
    },
    _close: function (startMenu) {
        this._superApply(arguments);
        if (!startMenu) {
            return;
        }
        this._setClosedState(startMenu);
    },
    _setOpenedState: function (menuitem) {
        menuitem.addClass('ui-menu-item-open');
    },
    _setClosedState: function (menuitem) {
        menuitem.find('.ui-menu-item-open')
            .removeClass('ui-menu-item-open');
    },
    _create: function () {
        this.container = this.element;

        if (this.container.is(':not(ul)')) {
            this.element = this.container.find('ul:first-child');
        }

        this.container
            .addClass(this.options.containerClass)
            .addClass('working');
        
        if (this.options.responsive) {
            var text = this.options.dropdownText;
            this.dropdownWrapper = $('<li><a href="#" title="' + text.more.title + '"><span class="ui-menu-icon ui-icon '+this.options.icons.submenu+'"></span></a><ul class="contextMenu"></ul></li>')
                .addClass(this.options.dropdownClass)
                .appendTo(this.element);

            this.dropdownLink = this.dropdownWrapper.find('a');

            this._on(this.dropdownLink, {
                click: function (event) { event.preventDefault() }
            });

            if (text.enabled) {
                this.linkText = $('<span class="ui-menu-text">' + text.more.text + '</a>').prependTo(this.dropdownLink);
            }

            var menuOptions = {
                enabled: true,
                positionAtElement: true,
                trigger: this.dropdownLink,
                enableDwScrollbar: this.options.enableDwScrollbar,
                isVisible: function (state) {
                    this[state ? 'addClass' : 'removeClass']('ui-menu-item-active');
                }.bind(this.dropdownLink)
            }

            this.dropdown = this.dropdownWrapper.find('ul')
                .contextMenu(menuOptions)
                .addClass('ui-menu-icons');
        }
        this._super();

        this._off(this.element, "mouseenter mouseleave");

        this._on(this.element, {
            /*"click >.ui-menu-item > a": function (event) {
                event.stopPropagation();
            },*/
            "mousedown > .ui-menu-item > a": function (event) {
                var item = $(event.currentTarget)
                    .closest(".ui-menu-item");

                if (item.is(".ui-state-disabled")) {
                    return;
                }

                if (item.is(':has(.ui-menu-item-open)')) {
                    this._close(item);
                    this.blur(event);
                    return;
                }

                var sublings = item.siblings();

                this._setClosedState(sublings);

                sublings.children(".ui-state-active")
                    .removeClass("ui-state-active");
                item.first()
                    .children("a")
                    .addClass("ui-state-active");

                this.focus(event, item);
            },
            // Default menu events
            "mouseenter .ui-menu .ui-menu-item": function (event) {
                var target = $(event.currentTarget);
                // Remove ui-state-active class from siblings of the newly focused menu item
                // to avoid a jump caused by adjacent elements both having a class with a border
                target.siblings().children(".ui-state-active").removeClass("ui-state-active");
                this.focus(event, target);
            },
            "mouseleave .ui-menu": "collapseAll",
            // Horizontal items
            "mouseleave > .ui-menu-item": function (event) {
                clearTimeout(this.timer);
                this.timer = this._delay(function () {
                    $(event.currentTarget)
                        .children(".ui-state-active")
                        .removeClass("ui-state-active");
                }, this.delay);
            },
            "mouseenter > .ui-menu-item": function (event) {
                var item = $(event.currentTarget);
                if (item.is(".ui-state-disabled")) {
                    return;
                }

                item.siblings()
                    .children(".ui-state-active")
                    .removeClass("ui-state-active");

                var focused = item
                    .first()
                    .children("a")
                    .addClass("ui-state-active");

                if (this.options.role) {
                    this.element.attr("aria-activedescendant", focused.attr("id"));
                }
            },
            "focus": "_handleFocus"
        });

        // Clicks outside of a menu collapse any open menus
        this._off(this.document, "click");
        this._on(this.document, {
            mouseup: function (event) {
                if (this._closeOnDocumentClick(event)) {
                    this.collapseAll(event, true);
                }
                
                // Reset the mouseHandled flag
                this.mouseHandled = false;
            }
        });
        
        // update menu
        this.update();
    },
    _handleFocus: function (event) {

        if (!event.relatedTarget) return;

        var parents = this.element.parents();

        for (var i = 0, parent = null, parentChild = null; i < parents.length; i++) {
            if ($(parents[i]).has(event.relatedTarget).length) {
                parent = parents[i];
                break;
            }
            parentChild = parents[i];
        };

        var direction = $(parentChild).index() > $(event.relatedTarget).parentsUntil(parent).last().index() ? 'first' : 'last';
        
        this._move(direction, direction, event);
    },

    _keydown: function (event) {

        switch (event.keyCode) {
            case $.ui.keyCode.TAB:
                if (event.shiftKey) {
                    if (!this.isFirstItem()) {
                        this.previous(event);
                        event.preventDefault();
                        return;
                    }
                }
                else {
                    if (!this.isLastItem()) {
                        this.next(event);
                        event.preventDefault();
                        return;
                    }
                }
                break;
            case $.ui.keyCode.ENTER:
            case $.ui.keyCode.SPACE:
                // if active is dropdown menu - close/open menu
                event.stopPropagation();
                break;
            case $.ui.keyCode.ESCAPE:
                // if active is dropdown menu - close menu
                event.stopPropagation();
                break;
        }
        this._super(event);
    },
    _closeOnDocumentClick: function (event) {
        var menu = $(event.target).closest('ul');

        return !menu.is(this.element);
    },
    _destroy: function () {

        if (this.options.responsive) {

            if (this.options.dropdownText.enabled) {
                this.linkText.remove();
            }

            this.dropdown
                .children()
                .insertBefore(this.dropdownWrapper);

            this.dropdown
                .contextMenu('destroy')
                .remove();

            this._off(this.dropdownLink, "click");

            this.dropdownLink.remove();
            this.dropdownWrapper.remove();

            this.container = null;
            this.dropdown = null;
            this.linkText = null;
            this.dropdownWrapper = null;
            this.dropdownLink = null;
        }

        this._super();
    },
    update: function () {
        if (this.container.is(':not(:visible)') || this.options.responsive == false) {
            return;
        }

        // add overflow:hidden class
        this.container.addClass('working');
        
        // move all items back to initial position
        this.dropdown.children().insertBefore(this.dropdownWrapper);
        
        // get menu items
        var items = this.element.children('li:not(.' + this.options.dropdownClass + ')');
        
        // get available width
        var width = this.container.width() - this.dropdownWrapper.outerWidth(true);

        var item, invisibles = 0, ditems = 0, $item;
        for (var i = 0; i < items.length; i++) {
            item = items.get(i);
            $item = $(item);
            if ($item.is(':not(:visible)')) {
                invisibles++;
                continue;
            }
            width -= $item.outerWidth(true);
            if (width < 0) {
                invisibles++;
                ditems++;
                this.dropdown.append(item);
            }
        }

        if (this.options.dropdownText.enabled) {
            var data = (invisibles == items.length) ? this.options.dropdownText.all : this.options.dropdownText.more;
            this.linkText.text(data.text).attr('title', data.title);
        }

        // show menu if there are hidden elements
        this.container[(invisibles > 0 && ditems > 0) ? 'addClass' : 'removeClass']('dropdown-enabled');

        this.container.removeClass('working');
    },
    refresh: function () {
        this._super();
        if (this.options.responsive) {
            this.dropdown.contextMenu('refresh');
        }
        this.update();
    }
});