define(['jquery', 'knockout', 'app/utils', 'app/viewModels/Disposable'], function ($, ko, utils) {
    var Module = new Class({
        Extends: DW.Disposable,
        Implements: [Options],
        children: [],
        attr: {},
        template: null,
        getUrl: function(sufix) {
            return this.attr.id() + (sufix ? '/' + sufix : '');
        },
        initialize: function(options) {
            
            this.attr = Object.map(options, function(value, key) {
                return this.addDisposable($.isArray(value) ? ko.observableArray(value) : ko.observable(value));
            }, this);
            
            this.active = this.addDisposable(ko.observable(false));
            this.url = this.getUrl();
            this.content = this.addDisposable(ko.observable());
            this.viewModel = this.addDisposable(ko.observable());
            this.moduleId = ko.unwrap(this.attr.moduleId);
        },
        activate: function() {
            utils.log('Activate module: ' + this.moduleId);
            return utils.defer(function(dfd){
                utils.acquire(this.moduleId).then(function(module){
                    this.active(true);
                    if (module) {
                        this.template = module.getTemplate ? module.getTemplate() : module.template;
                        this.viewModel(module);
                    }
                    dfd.resolve(this);
                }.bind(this)).fail(function(err){
                    utils.error('Failed to load module. Details: ' + err.message);
                }.bind(this));
            }.bind(this)).promise();
        },
        deactivate: function() {
            return $.Deferred(function(defer) {
                this.active(false);
                defer.resolve(this);
            }.bind(this)).promise();
        }
    });
    
    return namespace('App.Module', Module);
});