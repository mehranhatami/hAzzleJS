// identify.js
// Identify the selector and return it's
// Mehran! Fill out this lists with valid tags
var validTags = ['div', 'span', 'b', 'p', 'href', 'img', 'button', 'textarea', 'form', 'table', 'input'];

hAzzle.identify = function (selector, context) {

    if (typeof selector === 'string') {

        if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {

            // Grab the childNodes of the fragment

            selector = fragment(selector).childNodes;

            // Create tags with properties (e.g.   div  { id: 'mehran'  }

        } else if (/^[a-zA-Z1-6]+$/.test(selector) && hAzzle.isObject(context)) {

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

    // Only allow valid HTML tags
    var p, elem = document.createElement(tag);
    if (validTags[tag]) {
        if (hAzzle.isObject(props)) {

            // Copy over the properties

            for (p in props) {

                elem[p] = props[p];
            }
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

    var frag = document.createDocumentFragment();

    if (typeof html === 'string') {

        // Get rid of whitespace e.g.

        html = hAzzle.trim(html);

        var cur, elem = element('div', {

            // Danger or not, Mehran??

            innerHTML: html
        });

        while ((cur = elem.firstElementChild)) {
            frag.appendChild(cur);
        }

    } else {

        hAzzle(html).all(function (n) {
            frag.appendChild(n);
        });
    }
    return frag;
}