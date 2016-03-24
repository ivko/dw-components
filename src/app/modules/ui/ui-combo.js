define([
    'app/utils',
    'text!./ui-combo.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-combo'
    }
});