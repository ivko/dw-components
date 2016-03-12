define([
    'app/utils',
    'text!app/templates/ui/ui-checkbox.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-checkbox'
    }
});