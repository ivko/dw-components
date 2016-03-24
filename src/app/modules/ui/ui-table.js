define([
    'app/utils',
    'text!./ui-table.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-table'
    }
});