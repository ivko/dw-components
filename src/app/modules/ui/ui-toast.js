define([
    'app/utils',
    'text!app/templates/ui/ui-toast.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-toast'
    }
});