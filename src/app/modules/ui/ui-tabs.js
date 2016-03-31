define([
    'app/utils',
    'text!./ui-tabs.html',
    'knockout',
    'dw/Widgets/dwTabs/js/ko.bindingHandlers.dwTabs'
], function(utils, template, ko) {
    
    utils.addTemplates(template);
    
    function genTabName() {
        var textSrc = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere';
        var textArr = textSrc.replace(/,|\?!/g, '.').split('.').map(String.trim);
        var text = textArr[Math.round(Math.random() * (textArr.length - 1))];
        return text.substr(0, Math.round(Math.random() * (text.length - 1)));
    }

    var TabVM = function (id, name, text, selected) {
        var tab = this;
        tab.id = ko.observable(id);
        tab.name = ko.observable(name);
        tab.color = 'Blue';
        tab.text = ko.observable(text || id);
        tab.active = ko.observable(selected || false);
        tab.isDefault = ko.observable(!!Math.round(Math.random()));
        tab.hasLink = ko.observable(tab.isDefault() ? false : !!Math.round(Math.random() * .7));
        tab.hasBadge = ko.observable(tab.isDefault() ? false : !!Math.round(Math.random() * .8));
        tab.badgeText = ko.observable(tab.hasBadge() ? Math.round(Math.random() * 100) : 0);
        return tab;
    };

    function ViewModel() {
        this.template = 'template-ui-tabs';
        this.active = ko.observable(true);
        this.selectedInstance = ko.observable();
        this.selectedInstanceIndex = ko.observable(0);

        this.selectedInstance.subscribe(function (instance) {
            this.selectedInstanceIndex(this.instances().indexOf(instance));
        }, this);

        this.instances = ko.observableArray([
            new TabVM(1, genTabName()),
            new TabVM(2, genTabName()),
            new TabVM(3, genTabName()),
            new TabVM(4, genTabName())
        ]);

        this.removeInstance = function (tab) {
            this.instances.remove(tab);
        }

        this.addInstance = function () {
            var nextId = this.instances().length + 1;
            var instance = new TabVM(nextId, genTabName() + ' ' + nextId);
            this.instances.push(instance);
        }

        this.removeAll = function () {
            this.instances.removeAll();
        }

        return this;
    }

    return new ViewModel();
});