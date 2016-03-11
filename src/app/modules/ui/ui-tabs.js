define([
    'app/utils',
    'text!app/templates/ui/ui-tabs.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-tabs'
    }
});