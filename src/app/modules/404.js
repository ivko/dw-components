define([
    'app/utils',
    'text!app/templates/404.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: '_404'
    }
});