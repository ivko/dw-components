define([
    'app/utils',
    'text!app/templates/ui/ui-tabs.html',
    'knockout',
    'dw/Widgets/dwTabs/js/ko.bindingHandlers.dwTabs'
], function(utils, template, ko) {
    
    utils.addTemplates(template);
    var tabid = 1;
    function genTabName() {
        return "Tab " + (tabid++);
    }

    var TabVM = function (id, name, text, selected) {
        this.id = ko.observable(id);
        this.name = ko.observable(name);
        this.color = 'Blue';
    };

    function ViewModel() {

        this.template = 'template-ui-tabs';

        this.selectedInstance = ko.observable();
        this.selectedInstanceIndex = ko.observable(0);

        this.selectedInstance.subscribe(function (instance) {
            this.selectedInstanceIndex(this.instances().indexOf(instance));
        }, this);

        this.instances = ko.observableArray([
            new TabVM(tabid, genTabName()),
            new TabVM(tabid, genTabName()),
            new TabVM(tabid, genTabName())
        ]);
    }

    return new ViewModel();
});