(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'horizontalMenu',
        options: ['disabled', 'icons', 'menus', 'position', 'role',
            'selector', 'containerClass', 'responsive', 'dropdownText', 'dropdownClass', 'enableDwScrollbar'
        ],
        updateTriggersMapping: { 'refresh': 'dwResize' },
        events: ['blur', 'create', 'focus', 'select'],
        hasRefresh: true,
        onDestroyed: function (element) {
            $(element).children().each(function () {
                ko.cleanNode(this);
            });
        }
    });
})(jQuery, ko);
