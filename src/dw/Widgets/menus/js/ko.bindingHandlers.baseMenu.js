(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'baseMenu',
        options: ['disabled', 'icons', 'menus', 'position', 'role', 'enableDwScrollbar', 'autohideUnnesessaryItems', 'enableKeyboard', 'handlePropagationStopped'],
        events: ['blur', 'create', 'focus', 'select'],
        hasRefresh: true
    });
})(jQuery, ko);
