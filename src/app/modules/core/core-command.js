define([
    'app/utils',
    'text!./core-command.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-core-command'
    }
});