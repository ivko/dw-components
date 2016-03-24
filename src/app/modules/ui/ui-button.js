define([
    'app/utils',
    'text!./ui-button.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-button'
    }
});