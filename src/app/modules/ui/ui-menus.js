define([
    'app/utils',
    'text!./ui-menus.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-menus'
    }
});