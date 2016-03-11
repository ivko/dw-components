define([
    'app/utils',
    'text!app/templates/index.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'index'
    }
});