(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "./AutocompleteVM"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    //The bahavior object decouples the implementation of the features from the actual knockout bindings
    //This behavior is responsile for the autocomplete and showing the autocomplete menu in case arrow down button is pressed
    
    var AutocompleteBehavior = new Class({
        Extends: DW.Disposable,
        options: {
            enabled: false,
            delay: 400,
            templateName: 'autocomplete-menu',
            templateClassName: 'dw-autocomplete',
            buttonTemplateName: 'text-field-button',
            activeStateButtonClassName: 'arrowUp',
            activeStateInputClassName: 'dw-activeInputDialog',
            createViewModel: null,
            useContainerIfExists: '.dw-dialogs',
            selectorScrollWrapper: '.scroll-wrapper',
            menuMaxHeight: 300,// disabled using large number // ???
            menuMinHeight: 80,
            menuIndentLeft: 40
        },
        element: null,
        _container: null,
        _autocomplete: null,
        _autocompleteVM: null,
        _operatingValue: null,
        _oldValue: "",
        bound: {},
        hideTimeoutId: null,
        initialize: function (element, options) {

            this.element = $(element);

            $.extend(this.options, options);

            $.extend(this.bound, {

                onSelectItem: this._onSelectItem.bind(this),

                onElementKeyUp: this._onKeyUp.bind(this),

                onElementKeyDown: this._onKeyDown.bind(this),

                onAutocompleteClick: function (event) {
                    event.stopPropagation();
                },

                onButtonClick: this._onButtonClick.bind(this),

                onDocumentClick: function (event) {
                    this._onDocumentClick(event);
                }.bind(this),

                onDataReady: this._onDataReady.bind(this)
            });

            //used to do computed on it so that the update of the value will be only on keyup and only once every 400 ms
            this._operatingValue = this.addDisposable(ko.observable(""));

            var computed = this.addDisposable(ko.computed(this._computeOperatingValue.bind(this), null, {
                deferEvaluation: true
            }));

            this.addDisposable(computed.extend({
                throttle: this.options.delay
            }));
        },

        _initBehavior: function () {

            //Special functionality like showing the select list autocomplete on arrow down or putting the current date on pressing x.
            this.element.on({
                "keyup.autocomplete": this.bound.onElementKeyUp,
                "keydown.autocomplete": this.bound.onElementKeyDown
            });
            var posibleContainers = this.element.parents(this.options.useContainerIfExists);

            if (posibleContainers.length > 0) {
                this._container = posibleContainers.get(0);
            }
            //Build the control
            this._autocompleteVM = this.options.createViewModel();

            this._autocompleteVM.addEvents({
                onSelectItem: this.bound.onSelectItem,
                onDataReady: this.bound.onDataReady
            });

            // Build button
            this.button = DW.Utils.renderTemplate(this.options.buttonTemplateName, this._autocompleteVM)
                .insertAfter(this.element)
                .on('click.autocomplete', this.bound.onButtonClick);

            //It is very important that this subscription occurs after the applyBindings - probably it refreshes somehow the subscribers and this makes the difference
            this.addDisposable(this._autocompleteVM.visible.subscribe(this._toggle.bind(this)));
        },
        _computeOperatingValue: function () {
            //Once the old value is changed this is triggered for all the fields above the current one!!!
            var value = this._operatingValue();

            // in this case the value is comming from a user selection so do nothing
            if (!this._autocompleteVM || this._oldValue == value) {
                return;
            }
            //because of insane reason the computed is called as many times as the changed fields!
            //If an operatingValue was changed once it changes forever on any operatingValue change
            this._oldValue = value;
            //check if the last characer was deleted (this is a business logic constraint set into the behavior!!!)
            if (value && value != "") {
                //this._autocompleteVM.filterData(value);
                if (!this._autocompleteVM.visible.peek()) {
                    this._autocompleteVM.visible(true);
                }
                else
                    this._autocompleteVM.filterData(this.getValue());
            }
            else {
                this._autocompleteVM.visible(false);
            }
            return value;
        },
        _onSelectItem: function () {
            this.element.focus();
        },
        _onKeyUp: function (eventObject) {
            //if we decide that the fieldValue should not be observable - manual wrapping will be required
            //the sucbscription will not work if the option updateKeyup is not run on the knockout
            //calculating the value changes with some daly so that the control will no spam the server on every keystroke if the user types fast
            if (eventObject.keyCode == $.ui.keyCode.DOWN && !this._autocompleteVM.visible()) {
                this._autocompleteVM.visible(true);
            }
            else if (eventObject.keyCode == $.ui.keyCode.DOWN) { //arrow keys should move the selection (up and down)
                this._autocompleteVM.moveNext();
            }
            else if (eventObject.keyCode == $.ui.keyCode.UP) {
                this._autocompleteVM.movePrevious();
            }
            else if (eventObject.keyCode == $.ui.keyCode.ENTER) {
                if (this._autocompleteVM.isHeighlightActive()) {
                    this._autocompleteVM.selectCurrentlyHeighlightedItem(); // Select on enter
                } else if (this._autocompleteVM.visible()) {
                    this._autocompleteVM.visible(false); // Close on enter
                }
            }
            //the VM value here is not yet updated
            this._operatingValue(this._getOperatingValue());
        },

        _getOperatingValue: function () {
            return this.element.val();
        },
        _onButtonClick: function (event) {
            // We need to handle button click without closing the menu.
            event.preventDefault();
            // prevent closing the menu for this instance
            clearTimeout(this.hideTimeoutId);
            var isVisible = !this._autocompleteVM.visible();
            this._autocompleteVM.fireEvent('activateManualy', [isVisible]);
            // Show/Hide the menu
            this._autocompleteVM.visible.delay(0, this, isVisible);
            this._setFocus();
        },
        _setFocus: function () {
            this.element.focus();
        },

        _onKeyDown: function (eventObject) {
            //if the tabulations are not handled this way there will be a problem with the focus (onBlur is called for clicking the side button and again getting the event two times)
            if (eventObject.keyCode == $.ui.keyCode.TAB) {
                this._autocompleteVM.visible(false);
            }
            else if (eventObject.keyCode == $.ui.keyCode.ESCAPE) {
                eventObject.preventDefault(); // with escape there is an IE known browser issue - the text of the input is returned to the old value
                eventObject.stopPropagation(); //escape is also a shortcut so stop propagation
                var wasVisible = this._autocompleteVM.visible();
                this._autocompleteVM.visible(false); //escape button should close the menu
                if (wasVisible) {
                    // put back focus to the field...
                    this._setFocus()
                } else {
                    // ...or focus parent container
                    $(eventObject.target)
                        .parent()
                        .closest(':tabbable')
                        .focus();
                }
            }
            else if (eventObject.keyCode == $.ui.keyCode.ENTER && this._autocompleteVM.isHeighlightActive()) { //select on enter
                eventObject.stopPropagation();//VO - task 68976 - do not let this get to the shortcuts listener
            }
            else if (eventObject.keyCode == $.ui.keyCode.DELETE) { //delete
                eventObject.stopPropagation();//do not let this get to the shortcuts listener
            }
        },

        _onDocumentClick: function (event) {
            // closing the menu after document click
            this.hideTimeoutId = this._autocompleteVM.visible.delay(0, this, false);
        },

        _onDataReady: function () {
            if (!this._autocompleteVM) return;
            this._setPosition();
        },

        _showUI: function () {
            if (this._autocomplete) {
                return;
            }

            if (this.element.is(':not(:focus)') || this.element.is(':not(:visible)')) {
                this._autocompleteVM.visible(false);
                return;
            }

            $(document).on('click.autocomplete', this.bound.onDocumentClick);

            // Apply binding to the menu
            this._autocomplete = DW.Utils.renderTemplate(this.options.templateName, this._autocompleteVM)
                /* Set additional styles */
                .addClass(this.options.templateClassName)
                /* clicking everywhere else but the menu should close the autocomplete control. The menu button is also outside but it blocks the click */
                .on('click.autocomplete', this.bound.onAutocompleteClick);

            this._autocomplete.hide();
            if (this._container) {
                /* insert into the beginning of the container */
                this._autocomplete.prependTo(this._container);
            } else {
                /* Insert below the element */
                this._autocomplete.insertAfter(this.element);
            }

            this._autocompleteVM.visible(true);
        },

        _getDimensions: function (elem) {
            var $elem = $(elem),
                result = $elem.offset();
            result.width = $elem.outerWidth();
            result.height = $elem.outerHeight();
            return result;
        },

        _setPosition: function () {
            if (this._autocompleteVM.visible()) {

                this.element.addClass(this.options.activeStateInputClassName);
                this.button.addClass(this.options.activeStateButtonClassName);

                var options = {
                    my: "right top-1",
                    at: "right bottom",
                    of: this.element,
                    collision: "flipfit"
                };
                if (this._autocomplete.is(':not(:visible)')) {
                    this._autocomplete.css('opacity', 0).show();
                }

                var viewport = this._container ? this._container : this.element.closest(this.options.selectorScrollWrapper + ':visible').get(0);



                if (viewport) {
                    var viewportInfo = this._getDimensions(viewport),
                        fieldInfo = this._getDimensions(this.element),
                        scrollbar = this._autocomplete.find(this.options.selectorScrollWrapper),
                        deltaY = this._autocomplete.outerHeight() - scrollbar.innerHeight(),
                        aTop = fieldInfo.top - viewportInfo.top,
                        aBottom = viewportInfo.top + viewportInfo.height - (fieldInfo.top + fieldInfo.height);

                    if (aTop > aBottom && aTop > this.options.menuMinHeight) {
                        // set size using aTop and place element at top
                        var maxHeight = Math.min(aTop - deltaY, this.options.menuMaxHeight);
                        scrollbar.css('max-height', maxHeight);
                        $.extend(options, {
                            my: "right bottom+1",
                            at: "right top",
                            collision: "none"
                        });
                    } else if (aBottom >= aTop && aBottom > this.options.menuMinHeight) {
                        // set size using aBottom and place element at bottom
                        var maxHeight = Math.min(aBottom - deltaY, this.options.menuMaxHeight);
                        scrollbar.css('max-height', maxHeight);
                        $.extend(options, {
                            collision: "none"
                        });
                    }
                }
                // set the width, position and display it
                var deltaX = this._autocomplete.outerWidth() - this._autocomplete.innerWidth();
                this._autocomplete
                    .width(this.element.outerWidth() - this.options.menuIndentLeft - deltaX)
                    .position(options)
                    .animate({ 'opacity': 1 }, 100);
            }
        },
        _hideUI: function () {
            if (!this._autocomplete) {
                return;
            }

            this.element.removeClass(this.options.activeStateInputClassName);
            this.button.removeClass(this.options.activeStateButtonClassName);

            this._autocomplete
                .off('click.autocomplete', this.bound.onAutocompleteClick);

            $(document).off('click.autocomplete', this.bound.onDocumentClick);

            ko.removeNode(this._autocomplete.get(0));

            this._autocomplete = null;
        },

        _toggle: function (state) {
            if (state) {
                this._showUI();
            } else {
                this._hideUI();
            }
            this._oldValue = this._getOperatingValue();
            this._operatingValue(this._oldValue);
            this._autocompleteVM.init();
        },

        activate: function () {
            //The autocomplete behavior should be active only in case the field is enabled
            //If field can be dynamically disabled the dispose will be not enough (use this._vm.enabled.subscribe())
            if (!this._autocompleteVM) {
                this._initBehavior();
            }
        },
        deactivate: function () {
            if (!this._autocompleteVM) {
                return;
            }
            this._hideUI();
            this.element.off('.autocomplete');
            this.button.remove();
            if (instanceOf(this._autocompleteVM, DW.Disposable)) {
                this._autocompleteVM.dispose();
            }
        },
        dispose: function () {
            this.parent();
            this.destroy();
        },

        getValue: function () {
            var value = this._autocompleteVM.getValueFromString(this.element.val());
            return (value === null) ? "" : value;
        },

        destroy: function () {
            this.deactivate();
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    delete this[key];
                }
            }
        }
    });

    DW.Autocomplete.AutocompleteBehavior = AutocompleteBehavior;
}));