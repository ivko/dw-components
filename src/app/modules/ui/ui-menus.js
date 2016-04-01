define([
    'app/utils',
    'text!app/templates/ui/ui-menus.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-menus'
    }
});