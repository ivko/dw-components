define([
    'app/utils',
    'text!./ui-toast.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-toast'
    }
});