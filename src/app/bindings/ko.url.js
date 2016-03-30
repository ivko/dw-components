define(['jquery', 'knockout'], function($, ko) {
   ko.bindingHandlers['url'] = {
        'update': function (element, valueAccessor) {
            $(element).attr({
                href: '#' + ko.unwrap(valueAccessor())
            });
        }
    };
});