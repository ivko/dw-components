define([
    'app/utils',
    'text!app/templates/core/core-disposable.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-core-disposable'
    }
});