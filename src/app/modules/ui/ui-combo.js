define([
    'app/utils',
    'text!app/templates/ui/ui-combo.html',
    'dw/Bindings/Autocomplete/Scripts/ko.autocompleteMenu'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-combo'
    }
});