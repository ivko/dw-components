define([
    'app/utils',
    'text!app/templates/ui/ui-button.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-button'
    }
});