define(['knockout', 'sammy', './viewModels/Disposable'], function (ko, Sammy) {
    
    var Router = new Class({
        Extends: DW.Disposable,
        Implements: [Options],
        options: {
            modules: [],
            defaultModuleId: 'index',
            errorModuleId: '404' 
        },
        initialize: function(options) {
            this.setOptions(options);
            
            var options = this.options;
            
            this.module = this.addDisposable(ko.observable());

            var self = this;
            this.appSammy = Sammy(function() {
                
                this.get('#:moduleId', function() {
                    
                    var moduleId = this.params.moduleId;

                    if (options.modules[moduleId]) {
                        self.module(options.modules[moduleId]);    
                    } else {
                        self.module(options.modules[options.errorModuleId]);
                    }
                });

                this.get('', function() {
                    this.app.runRoute('get', '#' + options.defaultModuleId)
                });
            });
            
            this.appSammy.around(function(callback) {
                if (this.path=='#undefined') return;
                callback.call(null);
            });
        },
        run: function() {
            this.appSammy.run();
        }
    });

    return namespace('App.Router', Router);
});