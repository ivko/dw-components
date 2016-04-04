define([
    'jquery-ui',
    'knockout',
    'app/utils',
    'text!app/templates/ui/ui-combo.html',
    'dw/Bindings/Autocomplete/Scripts/ko.autocompleteMenu'
], function( _, ko, utils, template) {
    utils.addTemplates(template);
    return {
        value: ko.observable('Text value'),
        template: 'template-ui-combo'
    }
});