define([
    'app/utils',
    'text!app/templates/ui/ui-infobox.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-infobox'
    }
});