define([
    'app/utils',
    'text!./ui-checkbox.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-checkbox'
    }
});