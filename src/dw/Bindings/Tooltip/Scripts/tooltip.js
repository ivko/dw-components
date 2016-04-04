(function ($, ko) {
    // tooltip binding
    ko.bindingHandlers.tooltip2 = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var tooltipOptions = ko.utils.unwrapObservable(allBindingsAccessor()).tooltip2;
            var isHideableType = (tooltipOptions.tooltipType && tooltipOptions.tooltipType === 'hideable') ? true : false;
            var isHideableCoinatner = (tooltipOptions.tooltipType && tooltipOptions.tooltipType === 'hideable-container') ? true : false;
            var behaviour;
            if (isHideableType && $element.is('select')) {
                behaviour = new DWTS.Tooltip.SelectTooltip($element, tooltipOptions, ko.utils.unwrapObservable(allBindingsAccessor()).options);
            }
            else if (isHideableType) {
                behaviour = new DWTS.Tooltip.HideableTooltip($element, tooltipOptions);
            }
            else if (isHideableCoinatner) {
                behaviour = new DWTS.Tooltip.ContainerTooltip($element, tooltipOptions);
            }
            else {
                behaviour = new DWTS.Tooltip.BaseTooltip($element, tooltipOptions);
            }
            behaviour.init();
            ko.utils.domNodeDisposal.addDisposeCallback(element, behaviour.dispose.bind(behaviour));
        }
    };
})(jQuery, ko);
var DWTS;
(function (DWTS) {
    var Tooltip;
    (function (Tooltip) {
        var BaseTooltip = (function (_super) {
            __extends(BaseTooltip, _super);
            function BaseTooltip($element, options) {
                _super.call(this);
                this.options = {
                    title: null,
                    container: 'body',
                    placement: 'bottom',
                    animation: true,
                    reserveValue: undefined,
                    addWidth: null,
                    forseUpdate: false,
                    optionsTitle: undefined,
                    optionsValue: undefined,
                    optionsValueParam: undefined,
                    titles: [],
                    selectTitle: "",
                    selectValue: "",
                    trackObservable: true,
                    delay: 420
                };
                this.$element = $element;
                $.extend(this.options, options);
            }
            BaseTooltip.prototype.init = function () {
                this.isToolTipVisible = false;
                // Called on tooltip show event /mouseenter/
                this.$element.on('show.bs.tooltip', function () {
                    this.isToolTipVisible = true;
                }.bind(this));
                // Called on tooltip hide event /mouseleave/
                this.$element.on('hide.bs.tooltip', function () {
                    this.isToolTipVisible = false;
                }.bind(this));
                //this.destroyHandlerAddCheck();
                this.initOptionDetails();
            };
            //protected destroyHandlerAddCheck() : void {
            //    // hide tooltip when the element click and focus are showing new dialogs
            //    if (this.options.disableHandler) {
            //        this.$element.on("mousedown", function () {
            //            this.isToolTipVisible = false;
            //            this.$element.tooltip2('hide');
            //        }.bind(this))
            //    }
            //    // if the container element is destroying dynamicly - add remove listen event handler
            //    if (this.options.destroyHandler) {
            //        this.$element.on("remove", function () {
            //            this.isToolTipVisible = false;
            //            $(".tooltip").hide();
            //        }.bind(this))
            //    }
            //}
            BaseTooltip.prototype.initOptionDetails = function () {
                var self = this;
                this.$element.tooltip2(this.options);
                this.$element.on('click.bs.tooltip', function (e) {
                    var tooltip2 = self.$element.data('bs.tooltip');
                    if (!tooltip2 || !tooltip2.$tip)
                        return;
                    if (tooltip2.$tip.is(':visible')) {
                        self.$element.tooltip2('hide');
                    }
                });
            };
            BaseTooltip.prototype.handleTooltipVisualization = function () {
                // "true" is the bootstrap default.
                var origAnimation = this.options.animation || true;
                var title = ko.isObservable(this.options.title) ? this.options.title() : this.options.title;
                if (this.isToolTipVisible) {
                    this.$element.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
                    this.$element.tooltip2('fixTitle') // call this method to update the title
                        .tooltip2('show');
                    this.$element.data('bs.tooltip').options.animation = origAnimation;
                }
                else {
                    this.$element.tooltip2('hide');
                }
            };
            BaseTooltip.prototype.dispose = function () {
                var title = ko.isObservable(this.options.title) ? this.options.title() : this.options.title;
                this.$element.tooltip2('destroy');
                _super.prototype.dispose.call(this);
            };
            return BaseTooltip;
        })(DWTS.Disposable);
        Tooltip.BaseTooltip = BaseTooltip;
        var HideableTooltip = (function (_super) {
            __extends(HideableTooltip, _super);
            function HideableTooltip($element, options) {
                this.handleTooltipTitle(options);
                _super.call(this, $element, options);
                var placement = options.placement;
                $.extend(this.options, {
                    trigger: 'hover',
                    placement: function (tip, element) {
                        $(tip)[this.isToolTipVisible ? 'removeClass' : 'addClass']('ui-hidden');
                        return placement;
                    }.bind(this)
                });
            }
            HideableTooltip.prototype.init = function () {
                // Called on tooltip show event /mouseenter/
                this.$element.on('show.bs.tooltip', function (evt) {
                    this.isToolTipVisible = this.checkTooltipElement();
                }.bind(this));
                // Called on tooltip hide event /mouseleave/
                this.$element.on('hide.bs.tooltip', function () {
                    this.isToolTipVisible = false;
                }.bind(this));
                // ei bug prevent handlers - focus on click (input)
                //if (DW.Utils.isIE) {
                //    this.$element.on("click", function () {
                //        this.$element.focus();
                //    }.bind(this))
                //}
                // If the title is an observable, make it auto-updating.
                if (ko.isObservable(this.options.title) && this.options.trackObservable) {
                    this.isToolTipVisible = false;
                    this.addChangeHandler();
                }
                // this.destroyHandlerAddCheck();
                this.initOptionDetails();
            };
            HideableTooltip.prototype.handleTooltipTitle = function (options) {
                if (ko.isObservable(options.title) && options.title() === undefined && options.reserveValue !== undefined) {
                    options.title = ko.observable(options.reserveValue);
                }
            };
            HideableTooltip.prototype.checkTooltipElement = function () {
                if (this.$element.is('input') && DW.Utils.isIE) {
                    return this._compareInputInIE();
                }
                else {
                    return this.$element.is(':truncated');
                }
            };
            HideableTooltip.prototype.updateTextContainer = function () {
                if (!this.$defaultTextContainer) {
                    this.$defaultTextContainer = $('<div style="position: absolute; top: 0; left: 0; visibility: hidden"><div>');
                    this.$textWidth = this.$defaultTextContainer.css('font-weight', this.$element.css("font-weight")).css('font-size', this.$element.css("font-size")).appendTo('body');
                }
                else {
                    this.$defaultTextContainer.empty();
                }
            };
            HideableTooltip.prototype.addChangeHandler = function () {
                this.addDisposable(this.options.title.subscribe(function () {
                    if (this.checkTooltipElement()) {
                        this.isToolTipVisible = true;
                        this.handleTooltipVisualization();
                    }
                }, this));
            };
            HideableTooltip.prototype._compareInputInIE = function () {
                this.updateTextContainer();
                this.$defaultTextContainer.text(this.$element.val());
                // TODO fix console.log(this.$element.filter('::-ms-clear')); ie clear input
                return this.$defaultTextContainer.width() > this.$element.width();
            };
            return HideableTooltip;
        })(BaseTooltip);
        Tooltip.HideableTooltip = HideableTooltip;
        var ContainerTooltip = (function (_super) {
            __extends(ContainerTooltip, _super);
            function ContainerTooltip($element, options) {
                _super.call(this, $element, options);
            }
            ContainerTooltip.prototype.checkTooltipElement = function () {
                if (this.$element.find(':truncated').length == 0) {
                    return false;
                }
                else {
                    return true;
                }
            };
            ContainerTooltip.prototype.handleTooltipTitle = function (options) {
                if (!options.title) {
                    var title = '';
                    options.titles.forEach(function (currentText) {
                        title += (currentText + ' ');
                    });
                    options.title = title.slice(0, -1);
                }
            };
            return ContainerTooltip;
        })(HideableTooltip);
        Tooltip.ContainerTooltip = ContainerTooltip;
        var SelectTooltip = (function (_super) {
            __extends(SelectTooltip, _super);
            function SelectTooltip($element, options, selectArray) {
                this.selectArray = selectArray;
                _super.call(this, $element, options);
                this._updateElements();
            }
            SelectTooltip.prototype.checkTooltipElement = function () {
                this._updateElements();
                if (this.maxTextWidth <= this.elementWidth) {
                    this.isToolTipVisible = false;
                }
                else {
                    this.isToolTipVisible = true;
                }
                return this.isToolTipVisible;
            };
            SelectTooltip.prototype.handleTooltipTitle = function (options) {
                // get the text value direct from value 
                if (options.hasOwnProperty('selectTitle')) {
                    if (options.selectTitle === undefined) {
                        options.selectTitle = options.reserveValue;
                    }
                    options.title = ko.observable(options.selectTitle);
                }
                else if (options.hasOwnProperty('selectValue')) {
                    if (options.selectValue === undefined) {
                        options.title = ko.observable(options.reserveValue);
                    }
                    else {
                        this.selectArray().forEach(function (element) {
                            if (element[options.optionsValueParam] === options.selectValue) {
                                options.title = ko.observable(element.displayName);
                            }
                        }.bind(this));
                    }
                }
                else if (!options.title) {
                    options.title = ko.observable(options.reserveValue);
                }
            };
            SelectTooltip.prototype.addChangeHandler = function () {
                this.$element.on('change', function (e) {
                    this.options.title(this.$element.find(":selected").text());
                    this._updateElements();
                    this.isToolTipVisible = (this.maxTextWidth <= this.elementWidth) ? false : true;
                    this.handleTooltipVisualization();
                }.bind(this));
            };
            SelectTooltip.prototype._updateElements = function () {
                this.updateTextContainer();
                this._updateElementsWidth();
            };
            SelectTooltip.prototype._updateElementsWidth = function () {
                var selectPadding = (DW.Utils.isIE ? 24 : 26);
                this.$textWidth.text(this.$element.find(":selected").text());
                this.elementWidth = this.$element.width() - selectPadding;
                this.maxTextWidth = this.$textWidth.width();
            };
            return SelectTooltip;
        })(HideableTooltip);
        Tooltip.SelectTooltip = SelectTooltip;
    })(Tooltip = DWTS.Tooltip || (DWTS.Tooltip = {}));
})(DWTS || (DWTS = {}));
//# sourceMappingURL=tooltip.js.map