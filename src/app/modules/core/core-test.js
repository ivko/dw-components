define(['app/utils', 'text!app/templates/core/core-test.html'], function(utils, template) {
    utils.addTemplates(template);
    return {
        test: 'test text',
        template: 'template-core-test'
    }
    
})