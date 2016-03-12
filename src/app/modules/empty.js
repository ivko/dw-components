define([
    'app/utils',
    'text!app/templates/empty.html'
], function(utils, template) {
    utils.addTemplates(template);
    return {
        template: 'template-empty',
        viewModel: {
            description: "Empty template description"   
        }
    }
});