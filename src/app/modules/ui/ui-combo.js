define([
    'jquery-ui',
    'knockout',
    'app/utils',
    'text!app/templates/ui/ui-combo.html',
    'dw/Widgets/select/js/ko.bindingHandlers.select2'
], function( _, ko, utils, template) {
    utils.addTemplates(template);
    return {
        value: ko.observable('Choose value'),
        template: 'template-ui-combo'
    }
});