(function ($, ko) {
    ko.bindingHandlers.dwSortable = {
        init: function (element, valueAccessor, allBindingsAccessor, data) {
            var $element = $(element),
                options = $.extend({
                    placeholder: 'ui-sortable-placeholder',
                    helper: 'clone',
                    tolerance: 'pointer',
                    forcePlaceholderSize: true,
                    forceHelperSize: true
                }, ko.utils.unwrapObservable(valueAccessor()));

            //handle disposal
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('sortstart');
                $(element).off('sortstop');
                $(element).off('sortupdate');
                $(element).sortable('destroy');
                // should deattach namespaced event handlers also
            });

            $element.sortable(options);
            $element.disableSelection();

            $element.on('sortstart', function (event, ui) {
                // prevent hiding of currentItem
                ui.item.addClass('ui-sortable-item').show();

                var sortable = $(this).data('ui-sortable');
                if (sortable.options.containment) {
                    sortable._setContainment.delay(0, sortable);
                }
            });
            $element.on('sortstop', function (_, ui) {
                if (ui.item) {
                    ui.item.removeClass('ui-sortable-item');
                }
            });
            $element.on('sortupdate', function (_, ui) {
                if (!options.attr || !options.order || !$.isFunction(options.order)) return;
                var ids = $element.sortable('toArray', { attribute: options.attr });
                options.order.call(data, ids);
            });

            // TODO: ??? call $element.sortable( 'refresh' )
        }
    };
})(jQuery, ko);