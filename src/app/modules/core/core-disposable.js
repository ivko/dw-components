define([
    'app/utils',
    'text!./core-disposable.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-core-disposable'
    }
});