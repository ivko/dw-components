define([
    'app/utils',
    'text!app/templates/ui/ui-tabs.html',
    'knockout',
    'dw/Widgets/dwTabs/js/ko.bindingHandlers.dwTabs'
], function(utils, template, ko) {
    
    utils.addTemplates(template);
    
    function TabVM (id, name) {
        this.id = id;
        this.name = name;
    };

    function ViewModel() {

        this.selectedInstanceIndex = ko.observable(0);

        this.instances = ko.observableArray([
            new TabVM(1, "Tab 1"),
            new TabVM(2, "Tab 2"),
            new TabVM(3, "Tab 3")
        ]);
    }
    
    return {
        template: 'template-ui-tabs',
        simple: {
            code: TabVM.toString() + ViewModel.toString(),
            model: new ViewModel()
        }
    };
});