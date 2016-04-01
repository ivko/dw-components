(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./jquery.ui.dwTabs", "../../../Bindings/koJquiBindingFactory"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.jqui.bindingFactory.create({
        name: 'dwTabs',
        options: ['active', 'collapsible', 'disabled', 'event', 'heightStyle', 'hide', 'show', 'navigationHidden',
            'orientation',
            'scrollable', 'changeOnScroll',
            'sortable',
            'buttonClassPrev', 'buttonClassNext', 'buttonClassQuickMenu',
            'showQuickMenu', 'quickMenuSelector', 'quickMenuHolder',
            'debug', 'cssQueries', 'flex'],
        events: ['activate', 'beforeActivate', 'beforeLoad', 'create', 'load', 'resize'],
        updateTriggersMapping: { 'resize': 'dwResize' },
        postInit: function(element, valueAccessor) {
            // Keeps the active binding property in sync with the tabs' state.
            var value = valueAccessor();
            var $element = $(element);
            $element.on('dwResize.kodwtabs', $.proxy($element.dwTabs, $element, 'resize'));

            if (ko.isWriteableObservable(value.active)) {
                $element.on('dwtabsactivate.kodwtabs', function(ev, ui) {
                    if ($element.get(0) === ev.target) {
                        // Only activate if this is the right tab widget.
                        value.active(ui.newTab.index());
                    }
                });

                $element.on('dwtabssort.kodwtabs', function(ev, ui) {
                    var cActive = value.active();

                    value.refreshOn.move(ui.oldIndex, ui.newIndex);
                    // old and new are less or bigger
                    if ((ui.oldIndex < cActive && ui.newIndex >= cActive) || (ui.oldIndex > cActive && ui.newIndex <= cActive)) {
                        value.active(ui.oldIndex < cActive ? cActive - 1 : cActive + 1);
                    }
                    else if (ui.oldIndex === cActive) { // old is the same as current
                        value.active(ui.newIndex);
                    }
                });
            }

            //handle disposal
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $element.off('.kodwtabs');
            });
        },
        onDestroyed: function(element) {
            $(element).children().each(function() {
                ko.cleanNode(this);
            });
        },
        hasRefresh: true
    });
}));