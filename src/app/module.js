define(['jquery', 'knockout', 'app/utils', 'app/viewModels/Disposable'], function ($, ko, utils) {
    var Module = new Class({
        Extends: DW.Disposable,
        Implements: [Options],
        children: null,
        attr: {},
        template: null,
        getUrl: function(sufix) {
            return this.attr.id() + (sufix ? '/' + sufix : '');
        },
        initialize: function(options) {

            if (options.children) {
                this.children = options.children
                delete options['children'];
            }

            this.attr = Object.map(options, function(value, key) {
                return this.addDisposable($.isArray(value) ? ko.observableArray(value) : ko.observable(value));
            }, this);
            
            this.activeChild = this.addDisposable(this.addDisposable(ko.computed(function() {
                if (!this.children) return false;
                return this.children.some(function(item) {return item.active()});
            }, this)).extend({ rateLimit: 100 }));
            
            this.active = this.addDisposable(ko.observable(false));
            this.url = this.getUrl();
            this.viewModel = this.addDisposable(ko.observable());
            this.moduleId = ko.unwrap(this.attr.moduleId);
            this.hidden = ko.unwrap(this.attr.hidden);
            
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