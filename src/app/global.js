define(['knockout', 'jquery', 'mootools', 'text'], function (ko, $) {
    window.ko = ko;

    window.namespace = window.ns = function (namespace, value) {
        var args = Array.slice(arguments);
        return (namespace || '').split('.').reduce(function (ns, fragment, index, all) {
            var defaultValue = args.length == 2 && (index + 1) === all.length ? value : {};
            return ns[fragment] || Object.defineProperty(ns, fragment, {
                value: defaultValue,
                writable: false,
                enumerable: true,
                configurable: true
            })[fragment];
        }, this);
    };
    
    window.addTemplate = function(template) {
        $(document.body).append(template);
    };
    
});