define([
    'app/utils',
    'text!app/templates/core/core-command.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-core-command'
    }
});