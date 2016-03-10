/* global ko */
/* global Class */
/* global Options */
/* global DW */
/* global App */
define(['jquery', 'app/utils', 'app/navigation', 'app/templates', 'app/viewModels', 'app/bindings'], function ($, utils, navigation, templates) {

    var Main = new Class({
        Extends: DW.Disposable,
        Implements: [Options],
        defaultPage: 'index',
        initialized: false,
        initialize: function(navigation) {

            var pages = {
                // make sure that we have default page (homepage and errorpage) 
                "index": new App.Page({"id": "index", "moduleId": "app/modules/index", "label": "Index"}),
                "404": new App.Page({"id": "404", "moduleId": "app/modules/404", "label": "Error404"}),
            };
            
            navigation.forEach(function(section) {
                pages[section.id] = new App.Page(section);
                
                section.pages.forEach(function(page) {
                    pages[page.id] = new App.Page(page);
                }, this)
            }, this);
            
            this.navigation = navigation;
            this.chosenPage = this.addDisposable(ko.observable(null));

            this.router = new App.Router(pages);

            this.router.page.subscribe(function(page) {
                var chosen = this.chosenPage();
                
                if (chosen) {
                    if (chosen.attr.id() == page.attr.id()) return;
                    chosen.deactivate();
                }
                
                $.when(page.activate()).then(function(page) {
                    this.chosenPage(page);
                }.bind(this));
            }, this);
            
            this.chosenPage.subscribe(function(page) {
                console.log('chosenPage', page);
            });
            
            this.start();
        },
        start: function() {
            this.initialized = true;
            this.router.run();
        }
    });

    utils.addTemplates(templates);

    var vm = new Main(navigation);
    
    ko.applyBindings(vm, document.id('ko-root'));
});