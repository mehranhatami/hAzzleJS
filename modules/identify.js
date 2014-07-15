// identify.js
// Identify the selector and return it's
hAzzle.identify = function (selector, context) {

    if (typeof selector === 'string') {

        if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {

            // Grab the childNodes of the fragment

            selector = fragment(selector).childNodes;

            // NOTE!! hAzzle are an Object too, so don't try to create some HTML out of it !!

        } else if (/^[a-zA-Z1-6]+$/.test(selector) && hAzzle.isObject(context) && !selector instanceof hAzzle) {

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

/**
 * Create single element tags ( e.g. div, span, b)
 *
 *  @param {String} html
 * @return {Object}
 *
 */

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

/**
 * Create a document fragment from a string
 *
 * @param {String} html
 * @return {Object}
 */

function fragment(html) {

    // Get rid of whitespace e.g.

    html = hAzzle.trim(html);

    var frag = document.createDocumentFragment();

    if (typeof html === 'string') {

        var cur, div = element('div', {

            // Danger or not, Mehran??

            innerHTML: html
        });

        while ((cur = div.firstChild)) {
            frag.appendChild(cur);
        }

    } else {

        hAzzle(html).all(function (n) {
            frag.appendChild(n);
        });
    }
    return frag;
}