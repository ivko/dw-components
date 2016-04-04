(function () {

    ko.bindingHandlers.uncheck = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            //uncheck radio button
            var $element = $(element),
                checked = valueAccessor();

            onMousedown = function (e) {
                if ($element.is(':checked')) {
                    var uncheck = function () {
                        setTimeout(function () {
                            $element.removeAttr('checked');
                            checked(null);
                            $element.off("mouseup", uncheck);
                        }, 0);
                    };
                    $element.on("mouseup", uncheck);
                }
            };

            $element.on("mousedown", onMousedown);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off("mousedown", onMousedown);
            });
        }
    };
})();