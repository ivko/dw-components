define([
    'app/utils',
    'text!./ui-radio.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-radio'
    }
});