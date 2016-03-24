define([
    'app/utils',
    'text!./ui-tabs.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-tabs'
    }
});