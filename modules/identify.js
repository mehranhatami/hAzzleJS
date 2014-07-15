// identify.js
// Identify the selector and return it's
hAzzle.identify = function (selector, context) {

    if (typeof selector === 'string') {

        if (/<[^>]+>/.test(selector)) {

            selector = fragment(selector.replace(/^\s+|\s+$/g, '')).childNodes;

        } else if (/^[a-zA-Z1-6]+$/.test(selector) && typeof context === Object) {

            selector = [element(selector, context)];

        } else {

            selector = hAzzle.find(selector, context);
        }

        // document fragment

    } else if (selector.nodeType === 11) {

        // collect the child nodes
        selector = selector.childNodes;

        // nodeType			

    } else if (selector.nodeType) {

        selector = [selector];

        // Document Ready

    } else if (hAzzle.isNodeList(selector)) {

        selector = hAzzle.makeArray(selector);
    }

    if (selector.selector !== undefined) {

        selector = selector;
    }

    return selector;
};

function element(tag, props) {

    var p, elem = document.createElement(tag);

    if (hAzzle.isObject(props)) {

        // Copy over the properties

        for (p in props) {

            elem[p] = props[p];
        }
    }

    return elem;
}

// Create a document fragment from a string

function fragment(html) {

    var frag = document.createDocumentFragment();

    if (hAzzle.isString(html)) {
        var cur, div = hAzzle.elem('div', {
            innerHTML: html
        });

        while (cur = div.firstChild) {
            frag.appendChild(cur);
        }
    } else {
        hAzzle(html).all(function (n) {
            frag.appendChild(n);
        });
    }

    return frag;
}