(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['knockout', './global'], factory);
    } else { // Global
        factory(ko);
    }
}(function (ko) {
    var allWsRegex = /\S/, // performance ? [^\t\n\r ]
        isAllWsNode = function (node) {
            return ((node.nodeType == 3) && !(allWsRegex.test(node.data)));
        },
        removeWsChildNodes = function (node) {
            var child = node && node.firstChild;
            while (child) {
                if (isAllWsNode(child)) {
                    next = child.nextSibling;
                    child.parentNode.removeChild(child);
                    child = next;
                }
                else {
                    removeWsChildNodes(child);
                    child = child.nextSibling;
                }
            }
        };

    var FilteredTemplateEngine = function () {
        ko.templateEngine.call(this);
        this.allowTemplateRewriting = false;
    }

    FilteredTemplateEngine.prototype = Object.create(ko.templateEngine.prototype);
    FilteredTemplateEngine.prototype.constructor = FilteredTemplateEngine;
    FilteredTemplateEngine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
            templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
            templateNodes = templateNodesFunc ? templateSource['nodes']() : null,
            nodes;

        if (templateNodes) {
            var node = templateNodes.cloneNode(true);
            removeWsChildNodes(node);
            nodes = Array.from(node.childNodes);
        } else {
            var templateText = templateSource['text']();
            nodes = ko.utils.parseHtmlFragment(templateText).filter(function (node) {
                if (isAllWsNode(node)) {
                    return false;
                }
                else {
                    removeWsChildNodes(node);
                    return true;
                }
            });
        }

        return nodes;
    };

    extend(ns('DW.Utils'), {
        filteredTemplateEngine: new FilteredTemplateEngine()
    });

    //ko.setTemplateEngine(DW.Utils.filteredTemplateEngine); // default engine
}));