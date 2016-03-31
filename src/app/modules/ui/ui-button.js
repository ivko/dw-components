define([
    'app/utils',
    'text!./ui-button.html',
    'dw/knockout-jquery-ui-widget'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-button'
    }
});