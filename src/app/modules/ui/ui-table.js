define([
    'app/utils',
    'text!app/templates/ui/ui-table.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-table'
    }
});