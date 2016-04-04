ko.bindingHandlers.infobox = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var bindingValue = ko.utils.unwrapObservable(valueAccessor()),
            options = $.extend(true, {
                key: '',
                template: false,
                data: false,
                options: {
                    placement: function (context, source) { // API for position - (called on every popover call)
                        if ($(element).offset().top > ($(document).height() / 2)) 
                            return "top";
                        else
                            return "bottom";
                    },
                    title: false,
                    container: 'body',
                    trigger: 'hover',
                    html: true,
                    delay: { hide: 600 },
                    localize: $R
                }
            }, $.type(bindingValue) === 'string' ? {
                key: bindingValue
            } : bindingValue),
            info_key = options.key + '_Infobox_Content',
            title_key = options.key + '_Infobox_Title',
            content = options.options.localize(info_key),
            title = options.options.localize(title_key),
            $element = $(element);

        if (info_key === content) {
            $(element).hide();
            return;
        }

        if (title_key === title) {
            title = '';
        }

        $.extend(options.options, {
            content: content,
            title: title
        });

        $element.data('ko.infobox.options', options);

        var hidePopup = function () {
            this.hide();
            this.$tip.off('mouseenter mouseleave');
        };

        $element.on('mouseleave.bs.popover', function (evt) {
            var popoverAPI = $element.data('bs.popover'),
                inPopup = false;

            popoverAPI.$tip.one('mouseenter', function () {
                inPopup = true;
                clearTimeout(popoverAPI.timeout);
                popoverAPI.$tip.one('mouseleave', hidePopup.bind(popoverAPI));
            });

            setTimeout(function () {
                if (!inPopup) hidePopup.bind(popoverAPI);
            }, options.options.delay.hide);

            return true;
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $element.off('mouseleave.bs.popover');
        });

        return ko.bindingHandlers.popover.init(element, function () { return options }, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var options = $(element).data('ko.infobox.options');
        if (!options) {
            return;
        }
        ko.bindingHandlers.popover.update(element, function () { return options }, allBindingsAccessor, viewModel, bindingContext)
    }
};


