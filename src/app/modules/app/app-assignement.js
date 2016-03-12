define([
    'app/utils',
    'text!app/templates/app/app-assignement.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-app-assignement'
    }
});