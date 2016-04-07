define([
    'app/utils',
    'text!app/templates/example.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-example'
    }
});