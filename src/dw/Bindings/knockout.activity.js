// By: Hans Fjällemark and John Papa
// https://github.com/CodeSeven/KoLite

; (function ($) {
    "use strict";

    /* ACTIVITY INDICATOR EXTENDED CLASS DEFINITION
    * ========================= */
    var Indicator = function ($element, options) {
        this.$element = $element;
        this.onlyIcon = this.$element.contents().length === 1 && this.$element.children('i').length === 1;
        this.activityText = this.$element.data('activity-text');
        this.isIndicatorOnly = this.$element.is('i');
        this.icons = this.$element.children('i');
        this.options = options;

        // the following line is work around to not allow the indicator make the button on which it is applied larger
        // probably not the best solution but quick one
        this.createIndicatorTag = options && options.createIndicatorTag ? options.createIndicatorTag : false;
    };

    Indicator.prototype = {
        createTemporaryIcon: function () {
            if (this.onlyIcon || !this.createIndicatorTag)
                return;
            //this.temporaryIcon = $('<i class="icon-" style="padding-left: 5px"></i>');
            this.temporaryIcon = $('<i style="display: inline-block; padding-left: 5px; width: 14px;"></i>');
            this.$element.append(this.temporaryIcon);
        },

        hideExistingIcons: function () {
            if (this.onlyIcon)
                this.icons.css('visibility', 'hidden');
        },

        moveSpinnerToFront: function () {
            $('body > div, body > group').first().css('z-index', 9999);
        },

        removeTemporaryIcon: function () {
            if (!this.temporaryIcon)
                return;

            this.temporaryIcon.remove();
            this.temporaryIcon = null;
        },

        setText: function (state) {
            if (!this.activityText)
                return;
            var data = this.$element.data(),
                val = this.$element.is('input') ? 'val' : 'html';
            if (state === 'activity')
                this.$element.data('resetText', this.$element[val]());
            this.$element[val](data[state + 'Text']);
        },

        showExistingIcons: function () {
            this.icons.css('visibility', 'visible');
        },

        start: function () {
            this.isBusy = true;
            this.setText('activity');
            this.createTemporaryIcon();
            this.hideExistingIcons();
            if (this.$element.is('button'))
                this.$element.addClass('disabled').attr('disabled', 'disabled');
            this.$element.activity({
                align: this.options.align ? this.options.align : this.onlyIcon || this.isIndicatorOnly ? 'center' : 'right',
                valign: options.valign ? options.valign : 'center',
                length: this.isIndicatorOnly ? 5 : 2,
                padding: this.options.padding ? this.options.padding : 12, // 12 is default
                color: this.options.color, // if it is not set, by defualt it will set its own color
                segments: this.options.segments ? this.options.segments : this.isIndicatorOnly ? 12 : 10,
                space: this.options.space ? this.options.space : this.isIndicatorOnly ? 2 : 1,
                width: this.options.width ? this.options.width : 1.5
            });
            this.moveSpinnerToFront();
        },

        stop: function () {
            this.removeTemporaryIcon();
            this.showExistingIcons();
            this.isBusy = false;
            this.setText('reset');
            this.$element.activity(false);
            this.$element.removeClass('disabled').removeAttr('disabled');
        },

        update: function (isLoading) {
            if (isLoading && !this.isBusy) {
                this.start();
            }

            if (!isLoading && this.isBusy) {
                this.stop();
            }
        }
    };

    /* ACTIVITY INDICATOR EXTENDED PLUGIN DEFINITION
    * ========================== */

    $.fn.activityEx = function (isLoading, options) {
        var destroyTextElement = function ($element) {
            var $activityText = $element.data('activityText');
            if ($activityText) {
                ko.removeNode($activityText.get(0));
                $element.removeData('activityText');
                $activityText.remove();
            }
        };
        var activity = function ($element) {
            destroyTextElement($element);

            if (!isLoading) {
                $element.activity(false);
                return;
            }

            var temp = Math.round($element.height() / 4);
            var length = options.length && options.length < temp ? options.length : temp; // if the passed length is smaller than 1/4 of element's length use it, and vice versa

            var isInput = $element.is('input');

            var opts = $.extend({
                align: isInput ? 'right' : 'center',
                valign: 'center',
                length: length,
                padding: isInput ? length : 0,
                outside: true,
                segments: Math.max(10, 10 + (length - 5)),
                space: 1,
                width: 5,
                text: null
            }, options);

            $element.activity(opts);

            var el = $element.data('activity')
                .css('z-index', 9999);

            if (opts.text) {
                var activityText;
                if (typeOf(opts.text) == "object" && opts.text.template) {
                    activityText = DW.Utils.renderTemplate(opts.text.template, opts.text.data);
                } else {
                    activityText = $(opts.text);
                }
                activityText
                    .insertAfter(el)
                    .position({
                        my: 'center bottom',
                        at: 'center top',
                        of: el,
                        colision: 'none'
                    }).css('z-index', 10000);
                $element.data('activityText', activityText);
            }
        },
            buttonActivity = function ($element) {
                var data = $element.data('activityEx');
                if (!data)
                    $element.data('activityEx', (data = new Indicator($element, options)));
                data.update(isLoading);
            };
        return this.each(function () {
            $(this).is('button, input, a') ? buttonActivity($(this)) : activity($(this));
        });
    };
})(jQuery);



var ActivityBehaviour = function (element) {
    var self = this;

    self.isActive = false;
    self.options = {};

    self.doActivity = function () {
        typeof self.isActive !== 'boolean' || $(element).activityEx(self.isActive, self.options);
    };

    self._onResize = function () {
        if (self.isActive) self.doActivity();
    };

    self.init = function () {
        $(element).bind('dwResize', self._onResize);
    };

    self.update = function (isActive, options) {
        self.isActive = isActive;
        self.options = options;
        self.doActivity();
    };

    self.dispose = function () {
        $(element).unbind('dwResize', self._onResize);
    };
};


; (function ($, ko) {
    ko.bindingHandlers.activity = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var behaviour = $(element).data("activityBehaviour"),
                disposables = [];
            if (!behaviour) {
                $(element).data("activityBehaviour", (behaviour = new ActivityBehaviour(element)));
                behaviour.init();

                var update = function (activity) {
                    var options = ko.utils.unwrapObservable(allBindingsAccessor().activityOptions) || {};
                    behaviour.update(activity, options);
                },
                    computed = ko.computed(function () {
                        return valueAccessor()();
                    }),
                    subscribtion = computed.subscribe(function (activity) {
                        update(activity);
                    });

                update(valueAccessor()());

                disposables.push(computed, subscribtion);
            }


            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                DW.Utils.dispose(disposables);
                $(element).activityEx(false);

                var behaviour = $(element).data("activityBehaviour");
                if (behaviour) {
                    behaviour.dispose();
                    $(element).removeData("activityBehaviour");
                }
            });
        }/*,

        update: function (element, valueAccessor, allBindingsAccessor) {
            var activity = valueAccessor()();
            var options = ko.utils.unwrapObservable(allBindingsAccessor().activityOptions) || {};

            var behaviour = $(element).data("activityBehaviour");
            if (behaviour) {
                behaviour.update(activity, options);
            }
        }*/
    };
})(jQuery, ko);