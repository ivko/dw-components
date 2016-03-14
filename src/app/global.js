define(['knockout', 'jquery', 'mootools', 'text', 'bootstrap'], function (ko, $) {

    function ns(path, value) {
        var args = Array.slice(arguments);
        return (path || '').split('.').reduce(function (ns, fragment, index, all) {
            var defaultValue = args.length == 2 && (index + 1) === all.length ? value : {};
            return ns[fragment] || Object.defineProperty(ns, fragment, {
                value: defaultValue,
                writable: false,
                enumerable: true,
                configurable: true
            })[fragment];
        }, this);
    };

    $.extend(window, {
        ko: ko,
        ns: ns,
        namespace: ns
    });
});