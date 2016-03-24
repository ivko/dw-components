; (function ($) {
    var commentNodesHaveTextProperty = document.createComment("test").text === "<!--test-->";
    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*-->$/ : /^\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*$/;
    var endCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;

    function isStartComment(node) {
        return (node.nodeType == 8) && (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
    }

    function isEndComment(node) {
        return (node.nodeType == 8) && (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(endCommentRegex);
    }

    function traverseNode(node, func) {
        func(node);
        node = node.firstChild;
        while (node) {
            traverseNode(node, func);
            node = node.nextSibling;
        }
    }

    function removeDataBindings(element) {
        var storage = [];

        traverseNode(element, function (node) {
            if (isStartComment(node) || isEndComment(node)) {
                storage.push(node);
                return;
            }
            //remove the 'data-bind' attributes
            if (node.nodeType === 1) { //ELEMENT_NODE
                node.removeAttribute('data-bind');
            }
            if (node.nodeType === 3 || node.nodeType === 8 && !/\S/.test(node.nodeValue)) {
                //console.log('nodeValue', '"' + node.nodeValue + '"');
            }
        });

        //remove Knockout binding comments
        for (i = 0; i < storage.length; i++) {
            node = storage[i];
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    }

    ko.bindingHandlers.templateSrc = {
        timeoutId: null,
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            ko.applyBindingsToDescendants(bindingContext, element);

            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            clearTimeout(element.templateSrcTimeoutId);

            // trigger native knockout refresh mechanism 
            var refreshOn = valueAccessor().refreshOn;
            for (var prop in refreshOn) {
                if (ko.isObservable(refreshOn[prop])) {
                    refreshOn[prop]();
                }
            }

            // create callback for delayedUpdate 
            var callback = ko.bindingHandlers.templateSrc.delayedUpdate.bind(null, element, valueAccessor, allBindingsAccessor);

            // delay it
            element.templateSrcTimeoutId = setTimeout(callback, 10);
        },
        delayedUpdate: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var id = valueAccessor().name;
            var content = element.cloneNode(true);
            removeDataBindings(content);
            valueAccessor().result(id, $(content).html());
        }
    };
    ko.virtualElements.allowedBindings.templateSrc = true;

})(jQuery);