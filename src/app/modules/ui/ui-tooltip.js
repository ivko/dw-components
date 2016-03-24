define([
    'app/utils',
    'text!./ui-tooltip.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-tooltip'
    }
});