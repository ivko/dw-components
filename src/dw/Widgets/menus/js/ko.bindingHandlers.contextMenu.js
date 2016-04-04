(function ($, ko) {
    ko.bindingHandlers.contextMenu = {
        dataKey: 'kocontextMenudatakey',
        getWidget: function (element) {
            return $(element).data(ko.bindingHandlers.contextMenu.dataKey);
        },
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var unwrapedData = ko.utils.unwrapObservable(valueAccessor()),
                commands = ($.isArray(unwrapedData)) ? valueAccessor() : unwrapedData,
                allBindings = allBindingsAccessor(),

                // Options
                options = $.extend({
                    template: 'context-menu',
                    commands: commands,
                    trigger: $(element),
                    enableDwScrollbar: false,
                    isVisible: ko.observable(false),
                    debug: false
                }, ko.utils.unwrapObservable(allBindings.contextMenuOptions)),

                // Create Menu
                $menu = DW.Utils.renderTemplate(options.template, bindingContext.createChildContext(commands)).contextMenu(options),

                // Update Triggers
                updateTriggersOptions = $.extend({}, ko.utils.unwrapObservable(allBindings.updateTriggers)),
                updateTriggers = ko.updateTriggers(updateTriggersOptions, function () {
                    if ($menu.data('ui-contextMenu')) { // initialized
                        $menu.contextMenu('refresh');
                    }
                });

            $(element).data(ko.bindingHandlers.contextMenu.dataKey, $menu);

            // Dispose callback
            var disposeContext = {
                menu: $menu,
                updateTriggers: updateTriggers
            }; 

            disposeContext.callback = function (element) {
                ko.utils.domNodeDisposal.removeDisposeCallback(element, this.callback);

                DW.Utils.dispose(this.updateTriggers);

                if (this.menu.data('ui-contextMenu')) { // initialized
                    this.menu.contextMenu('destroy');
                }

                ko.removeNode(this.menu.get(0));

                this.menu = null;

            }.bind(disposeContext);

            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeContext.callback);
        }
    };

})(jQuery, ko);