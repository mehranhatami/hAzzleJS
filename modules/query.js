(function(window) {

    var push = Array.prototype.push,
        array = [],
        nativeToString = Function.prototype.toString,
        nativeQuerySelector = nativeToString.call(document.querySelector),
        nameRE = /\bquerySelector\b/g,
        unique = -1,
        expando = String(Math.random()).replace(/\D/g, ''),
        attributeName = 'data-dom-elements-id-' + expando,
        propertyName = 'domElementsId' + expando,
        id = -1,
        supportsScoped = hAzzle.assert(function() {
            return document.createElement('i').querySelector(':scoped *');
        });

    var elementsPrototype = Elements.prototype = [];

    // Elements.queryAll(selector);
    elementsPrototype.queryAll = function(selector) {

        return this.reduce(function(results, element) {
            return pushUniq(methods.queryAll.call(element, selector));
        }, null);
    };

    // Elements.query(selector);
    elementsPrototype.query = function(selector) {
        return elementsPrototype.queryAll.call(this, selector)[0] || null;
    };

    function Elements() {}

    var methods = {

        query: function(selector) {
            return methods.queryAll.call(this, selector)[0] || null;
        },

        queryAll: function(sourceSelector) {
           var element = this,
                elements,
                selector,
                result;

            if (!supportsScoped) {
                element.setAttribute(attributeName, ++unique);
            }

            selector = supportsScoped ?
                scope(sourceSelector, scopeSelector) :
                scope(sourceSelector, absolutizeSelector(unique));
            elements = element.querySelectorAll(selector);

            if (!supportsScoped) {
                element.removeAttribute(attributeName);
            }

            result = new Elements();

            result.push.apply(result, toArray(elements));

            return result;
        },

        queryAllWrapper: function(selector) {
            var elements = this.querySelectorAll(selector);
            var result = new Elements();
            result.push.apply(result, toArray(elements));
            return result;
        },

        queryWrapper: function(selector) {
            return this.querySelector(selector);
        }
    };

    function isNative(context, name) {
        if (!context[name]) {
            return false;
        }
        return (
            nativeToString.call(context[name]) ===
            nativeQuerySelector.replace(nameRE, name)
        );
    }

    if (typeof document === 'undefined' ||
        !('map' in array) ||
        !('reduce' in array) ||
        !('querySelectorAll' in document)
    ) {
        throw new TypeError('Missing browser features to initiantiate dom-elements');
    }

    if ('Element' in window) {
        if (!isNative(Element.prototype, 'query')) {
            Element.prototype.query = methods.query;
        }
        if (!isNative(Element.prototype, 'queryAll')) {
            Element.prototype.queryAll = methods.queryAll;
        }
    }

    ['Document', 'DocumentFragment'].forEach(function(ParentNode) {
        var prototype;
        // Don't throw errors if these globals don't exist — just move on.
        if (!(ParentNode in window)) {
            return;
        }
        prototype = window[ParentNode].prototype;
        if (!isNative(prototype, 'query')) {
            prototype.query = methods.queryWrapper;
        }
        if (!isNative(prototype, 'queryAll')) {
            prototype.queryAll = methods.queryAllWrapper;
        }
    });

    function scopeSelector(item) {
        return ':scoped ' + item;
    }

    function scope(selector, method) {
        var selectors = separateSelector(selector);
        var scopedSelectors = selectors.map(method);
        return scopedSelectors.join();
    }

    function separateSelector(selector) {
        return selector.split(/\s*,\s*/);
    }

    function pushUniq(original) {
        var target = new Elements(),
            map = {};

        function pusher(source) {
            var index = -1,
                length = source.length,
                item;
            while (++index < length) {
                item = source[index];
                if (!item || item.nodeType !== 1) {
                    continue;
                }
                if (propertyName in item && map.hasOwnProperty(item[propertyName])) {
                    continue;
                }
                item[propertyName] = ++id;
                map[id] = 1;
                target.push(item);
            }
            return target;
        }

        if (arguments.length) {
            pusher(original);
        }

        return pusher;
    }

    function toArray(nodeList) {
        var index = -1,
            length = nodeList.length,
            array = Array(length);
        while (++index < length) {
            array[index] = nodeList[index];
        }
        return array;
    }

    function absolutizeSelector(attributeValue) {
        return function(item) {
            return '[' + attributeName + '="' + attributeValue + '"] ' + item;
        };
    }
}(window));