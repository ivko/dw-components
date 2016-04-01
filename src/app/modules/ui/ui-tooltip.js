define([
    'app/utils',
    'text!app/templates/ui/ui-tooltip.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-tooltip'
    }
});