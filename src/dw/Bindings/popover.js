(function ($, ko) {

    var unwrapProperties = function (wrappedProperies) {
        if (wrappedProperies === null || typeof wrappedProperies !== 'object') {
            return wrappedProperies;
        }
        var options = {};
        ko.utils.objectForEach(wrappedProperies, function (propertyName, propertyValue) {
            options[propertyName] = ko.unwrap(propertyValue);
        });
        return options;
    },
    uniqueId = (function () {
        var prefixesCounts = {};
        return function (prefix) {
            prefix = prefix || 'bs-unique-';
            if (!prefixesCounts[prefix]) {
                prefixesCounts[prefix] = 0;
            }
            return prefix + prefixesCounts[prefix]++;
        };
    })();

    ko.bindingHandlers.popover = {
        templateKey: '__popoverTemplateKey__',
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element),
                value = ko.unwrap(valueAccessor()),
                options = (!value.options && !value.template ? unwrapProperties(value) : unwrapProperties(value.options)) || {};
            
            // decide if there is template or just content property
            if (value.template) {

                // use unwrap to track dependency from template, if it is observable
                ko.unwrap(value.template);

                var id = uniqueId();
                
                ko.utils.domData.set(element, ko.bindingHandlers.popover.templateKey, id);

                // replace content with template logic
                options.content = '<div id="' + id + '" >r</div>';
                options.html = true;

                // place template rendering after popover is shown, because we don't have root element for template before that
                $element.on('shown.bs.popover', function () {
                    
                    var id = ko.utils.domData.get(element, ko.bindingHandlers.popover.templateKey);
                    // this works for observable template property
                    ko.renderTemplate(ko.unwrap(value.template), bindingContext.createChildContext(value.data), value.templateOptions, document.getElementById(id));

                    // bootstrap's popover calculates position before template renders,
                    // so we recalculate position, using bootstrap methods
                    var $popover = $('#' + id).parents('.popover'),
                        popoverAPI = $element.data('bs.popover'),
                        options = popoverAPI.options,
                        offset = popoverAPI.getCalculatedOffset(options.placement, popoverAPI.getPosition(), $popover.outerWidth(), $popover.outerHeight());

                    popoverAPI.applyPlacement(offset, options.placement);
                });
            }
            
            $element.popover(options);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.popover('destroy');
            });
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
           var $element = $(element),
                value = ko.unwrap(valueAccessor()),
                options = (!value.options && !value.template ? unwrapProperties(value) : unwrapProperties(value.options)) || {},
                popoverAPI = $element.data('bs.popover'),
                id = ko.utils.domData.get(element, ko.bindingHandlers.popover.templateKey);

            ko.utils.extend(popoverAPI.options, options);

            if (!value.template && $('#' + id).is(':visible')) {
                popoverAPI.setContent();
            }
        }
    };
})(jQuery, ko);