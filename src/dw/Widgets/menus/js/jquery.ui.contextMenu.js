$.widget('ui.contextMenu', $.ui.baseMenu, {
    // You can specify the following menu options including standart jQuery UI Menu options -> http://api.jqueryui.com/menu/.
    options: {
        contextMenuHolder: '#ContextMenuHolder',
        contextMenuClass: 'contextMenu',
        commands: null,
        selector: null,             /* If specified the menu will not be attached directly to the element to which it is applied. 
                                         Instead it will use the selector to attach to any child elements of the element matching the selector. */
        positionAtElement: false,   /* true / false - using mouse position if false */
        positionAt: "left bottom",    /* for 'at','my' and 'collision' see:  http://api.jqueryui.com/position/  */
        positionMy: "left top",
        positionCollision: "fit fit",

        showAt: null,               /* If specified he menu will not be shown automatically where you have pressed the mouse.
                                         Instead showAt must be called passing the event to show the menu. */
        contextMenu: false,          /* true / false - left or right mouse button show */
        isVisible: null,
        stopPropagation: true,
        cssClass: '',
        refreshOn: null,
        debug: false
    },
    previousActiveElement: null,
    trigger: null,
    _create: function () {

        this.subscriptions = [];
        this.element
            .appendTo(this.options.contextMenuHolder)
            .hide();

        this.element = this.element.filter(this.options.menus);

        if (this.element.length == 0) {
            return;
        }

        this.element
            .addClass(this.options.contextMenuClass)
            .addClass(this.options.cssClass)
            // add li.ui-state-disabled in order to fix the menu widget which selects the fisrt item if you mouse over an disabled item
            .prepend('<li class="ui-state-disabled"></li>');

        this._super();

        this.bound = {
            show: this.show.bind(this),
            hide: this.hide.bind(this),
            toggle: this.toggle.bind(this),
            keydown: this._handleKeyDown.bind(this)
        };

        if (typeof this.options.showAt == 'function') {
            this.subscriptions.push(this.options.showAt.subscribe(function (e) {
                if (!e)
                    this.bound.hide(e);
                else
                    this.bound.show(e);
            }.bind(this)));
        } else {
            this.trigger = this.options.trigger;

            if (this.options.selector) {
                this.trigger = this.trigger.find(this.options.selector);
            }

            if (this.options.contextMenu) {
                this._on(this.trigger, { contextmenu: this.bound.show });
            } else {
                this._on(this.trigger, { click: this.bound.toggle, keydown: '_handleTriggerKeydown' });
            }
        }

        if (typeof this.options.refreshOn == 'function') {
            var self = this;
            this.subscriptions.push(this.options.refreshOn.subscribe(function (value) {
                self.refresh();
            }));
        }
    },
    _destroy: function () {
        for (var i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i].dispose();
        }

        this.subscriptions = [];

        if (this.trigger) {
            this._off(this.trigger);
        }

        this._super();
    },
    toggle: function (e) {

        if (this.element.is(':visible')) {
            this.hide();
        } else {
            this.show(e); 
        }
    },
    show: function (e, customPosition) {
        // hide all menus
        $('.' + this.options.contextMenuClass + ':visible').each(function (idx, menu) {
            $(menu).contextMenu('hide');
        });

        if (this.options.enabled || this.options.commands.enabled()) {

            this.refresh();

            var position = $.extend({
                my: this.options.positionMy,
                at: this.options.positionAt,
                collision: this.options.positionCollision,
                of: e
            }, customPosition);

            if (this.options.positionAtElement) {
                position.of = this.trigger;
            }

            this.previousActiveElement = $(':focus');

            this.element.show().position(position);
            this._trigger("show");

            setTimeout(function () {
                this.element.position(position).focus();
                this._trigger("update");
            }.bind(this), 0);

            this._on.delay(0, this, [this.document, { 'click': this.bound.hide }]);
            if (this.options.enableKeyboard) {
                this.element.on('keydown', this.bound.keydown);
            }

            this.options.isVisible(true);
            $(this.trigger).addClass('menu-activated');
        }

        e.preventDefault();

        if (this.options.stopPropagation) {
            e.stopPropagation();
        }
    },
    _handleKeyDown: function (event) {
        if (event.keyCode == $.ui.keyCode.ESCAPE || event.keyCode == $.ui.keyCode.TAB) {
            this.hide();
        }
    },
    _handleTriggerKeydown: function (event) {
        if (event.keyCode == $.ui.keyCode.SPACE || event.keyCode == $.ui.keyCode.ENTER) {
            event.stopPropagation();
            event.preventDefault();
            this.toggle(event);
        }
    },
    hide: function (e) {
        if (e && this._hideIsPrevented(e)) {
            return;
        }

        if (this.previousActiveElement && this.previousActiveElement.is(':visible') && this.element.is(':focus') && this.element.is(this.previousActiveElement) == false) {
            this.previousActiveElement.focus();
        }
        this.previousActiveElement = null;

        this._trigger("hide");
        this.collapseAll(e);
        this.element.hide();
        this.element.off('keydown', this.bound.keydown); 

        this.options.isVisible(false);
        this._off(this.document);

        $(this.trigger).removeClass('menu-activated');

        if (this.element.is(':focus')) {
            this.element.blur();
        }
    },
    _hideIsPrevented: function (event) {
        if (this.trigger && $(event.target).closest(this.trigger).get(0)) { // ???
            return true;
        }
        return this._super(event);
    },
    refresh: function () {
        this._super();
        this.element.toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length);
    }
});