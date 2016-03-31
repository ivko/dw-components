define(['jquery', 'knockout', 'beautify-html', 'prettify'], function($, ko, beautifyHtml) {
    
    var html_beautify = beautifyHtml.html_beautify;
    
    ko.bindingHandlers['prettyprint'] = {
        'update': function (element, valueAccessor) {
            
            var target = valueAccessor();
            var html = $(element).html();
            var htmlCode = html_beautify(html, { 'preserve_newlines': true }).replace(/</g, '&lt;').replace(/>/g, '&gt;');

            $(target)
                .addClass('prettyprint')
                .html(PR.prettyPrintOne(htmlCode, 'html'));
        }
    };
});