define(['knockout', 'sammy', 'app/viewModels/Disposable'], function (ko, Sammy) {
    
    var Router = new Class({
        Extends: DW.Disposable,
        defaultPage: 'index',
        initialize: function(pages) {
            var self = this;
            this.page = this.addDisposable(ko.observable());
            
            this.appSammy = Sammy(function() {
                
                this.get('#:page', function() {
                    
                    var page = this.params.page;
                    console.log('page', page, pages[page])
                    if (pages[page]) {
                        self.page(pages[page]);    
                    } else {
                        self.page(pages['404']);
                    }
                });

                this.get('', function() {
                    this.app.runRoute('get', '#' + self.defaultPage)
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