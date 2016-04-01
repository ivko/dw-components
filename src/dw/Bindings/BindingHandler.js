(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["../global"], factory);
    } else { // Global
        factory();
    }
}(function () {
    var BindingHandler = new Class({
        Implements: Options,

        options: {},

        initialize: function (options) {
            this.setOptions(options);
            return {
                init: this.init.bind(this),
                update: this.update.bind(this)
            };
        },
        init: function () { },
        update: function () { }
    });
    
    this.BindingHandler = BindingHandler;
}));