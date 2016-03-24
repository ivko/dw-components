/* global ko */
/* global Class */
/* global Options */
/* global DW */
/* global App */
define(['jquery', './utils', './navigation', './templates', './router', './module', './bindings'], function ($, utils, navigation, templates) {

    var Main = new Class({
        Extends: DW.Disposable,
        Implements: [Options],
        defaultPage: 'index',
        initialized: false,
        initialize: function(navigation) {

            var modules = {};

            navigation.forEach(function(section, idx, arr) {
                if (section.children) {
                    section.children.forEach(function(page, idx, arr) {
                        arr[idx] = modules[page.id] = new App.Module(page);
                    }, this)
                }
                arr[idx] = modules[section.id] = new App.Module(section);
            }, this);
            
            this.navigation = navigation;
            this.moduleId = this.addDisposable(ko.observable(null));
            this.chosenModule = this.addDisposable(ko.observable(null));
            this.router = new App.Router({modules: modules});
            
            this.router.module.subscribe(function(module) {
                var chosen = this.chosenModule();
                
                if (chosen) {
                    if (chosen.attr.id() == module.attr.id()) return;
                    chosen.deactivate();
                    this.chosenModule(null);
                }
                
                $.when(module.activate()).then(function(module) {
                    this.chosenModule(module);
                }.bind(this));
            }, this);
            
            this.chosenModule.subscribe(function(module) {
                this.moduleId(module ? module.attr.id() : null);
            }.bind(this));
            
            this.start();
        },
        start: function() {
            this.initialized = true;
            this.router.run();
        }
    });

    utils.addTemplates(templates);

    var vm = new Main(navigation);
    
    ko.applyBindings(vm, document.getElementById('ko-root'));
});