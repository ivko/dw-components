define([
    'app/utils',
    'text!app/templates/ui/ui-radio.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-radio'
    }
});