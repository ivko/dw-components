define([
    'app/utils',
    'text!app/templates/ui/ui-combo.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-combo'
    }
});