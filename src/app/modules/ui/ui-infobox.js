define([
    'app/utils',
    'text!./ui-infobox.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-ui-infobox'
    }
});