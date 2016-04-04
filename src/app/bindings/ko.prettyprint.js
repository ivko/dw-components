define(['jquery', 'knockout', 'beautify-html', 'beautify', 'prettify'], function($, ko, beautifyHtml, beautify) {
    
    var html_beautify = beautifyHtml.html_beautify;
    var js_beautify = beautify.js_beautify;
    
    ko.bindingHandlers['prettyprint'] = {
        'update': function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());
            if (typeof value === 'string') {
                value = {
                    target: value
                }
            }
            var options = $.extend({
                lang: 'html',
                target: element,
                content: element,
                code: false
            }, value);
            
            var code = options.code ? options.code : $(options.content).eq(0).html();

            switch (options.lang) {
                case 'javascript':
                    code = js_beautify(code, { 'preserve_newlines': false });
                    break;
                default:
                    code = html_beautify(code, { 'preserve_newlines': true }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    break
            }
            
            $(options.target)
                .addClass('prettyprint')
                .html(PR.prettyPrintOne(code, options.lang));
        }
    };
});