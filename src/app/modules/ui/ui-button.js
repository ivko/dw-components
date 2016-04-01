define([
    'app/utils',
    'text!app/templates/ui/ui-button.html',
    'dw/knockout-jquery-ui-widget'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-button'
    }
});