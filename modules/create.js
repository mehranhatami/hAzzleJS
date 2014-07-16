/**
 * hAzzle.parseHTML - generate HTML from CSS selectors
 *
 */
var win = this,
    doc = win.document,

    attrMap = {
        'for': 'htmlFor',
        'class': 'className',
        'html': 'innerHTML'
    },

    cache = {},

    // DocumentFragment prototype	

    createDocumentFragment = Document.prototype.createDocumentFragment,

    // Various regEx

    MATCH = '(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)',
    QUOTE = '(["\'])((?:(?=(\\\\?))\\8.)*?)\\6',
    REGEX = '^(?:' + MATCH + ')|^#' + MATCH + '|^\\.' + MATCH + '|^\\[' + MATCH + '(?:([*$|~^]?=)' + QUOTE + ')?\\]|^(\\s+)|^\\s*(,)\\s*|^' + QUOTE.replace(6, 11).replace(8, 13),
    chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
    exprRegex = {
        ID: /#((?:[\w00c0-FFFF_-]|\\.)+)/,
        CLASS: /\.((?:[\wu00c0-uFFFF_-]|\\.)+)(?![^[\]]+])/g,
        NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
        ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
        TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
        CLONE: /\:(\d+)(?=$|[:[])/,
        COMBINATOR: /^[>~+]$/
    },

    callbackTypes = ['ID', 'CLASS', 'NAME', 'ATTR'],

    exprCallback = {

        ID: function (match, node) {

            node.id = match[1];
        },
        CLASS: function (match, node) {

            var cls = node.className.replace(/^\s+$/, '');
            node.className = cls ? cls + ' ' + match[1] : match[1];
        },
        NAME: function (match, node) {
            node.name = match[1];
        },
        ATTR: function (match, node) {

            var attr = match[1],
                val = match[4] || true;

            if (val === true || attr === 'innerHTML' || attrMap.hasOwnProperty(attr)) {
                node[attrMap[attr] || attr] = val;
            } else {
                node.setAttribute(attr, val);
            }

        }
    };

/* =========================== DANGEROUS !!! ========================== */

// Overwrite default createDocumentFragment() with a better one
Document.prototype.createDocumentFragment = function (selector) {
    var self = this,
        documentFragment = createDocumentFragment.call(self),
        createElement = self.createElement.bind(self),
        element = selector && documentFragment.appendChild(createElement('div')),
        match, temp;

    for (; selector && (match = selector.match(REGEX));) {

        if (match[1]) {
            element.parentNode.replaceChild(temp = createElement(match[1]), element);
            element = temp;
        }

        if (match[2]) {

            element.id = match[2];
        }

        if (match[3]) {

            element.classList.add(match[3]);
        }

        if (match[4]) {

            element.setAttribute(match[4], match[7] || '');
        }

        if (match[9]) {

            element = element.appendChild(createElement('div'));
        }

        if (match[10]) {

            element = documentFragment.appendChild(createElement('div'));
        }

        if (match[11]) {
            element.parentNode.replaceChild(temp = self.createTextNode(match[12]), element);
            element = temp;
        }

        selector = selector.slice(match[0].length);
    }

    return documentFragment;
};

/* =========================== HTML CREATION ========================== */

/**
 * parseHTML
 *
 * @param {String} selector
 * @return {Object}
 *
 */

hAzzle.parseHTML = function (selector) {

    if (!selector) {
        return;
    }

    if (selector in cache) {

        return cache[selector].cloneNode(true).childNodes;
    }

    var selectorParts = [],
        fragment = doc.createDocumentFragment(),
        children,
        prevChildren,
        curSelector,
        nClones = 1,
        nParts = 0,
        isSibling = false,
        cloneMatch,
        tag, node, c, match, regex, callback,
        m;

    while ((m = chunker.exec(selector)) !== null) {

        ++nParts;
        selectorParts.push(m[1]);
    }

    // We're going in reverse

    while (nParts--) {

        curSelector = selectorParts[nParts];

        if (exprRegex.COMBINATOR.test(curSelector)) {
            isSibling = curSelector === '~' || curSelector === '+';
            continue;
        }

        // Number of clones must be an int >= 1

        nClones = (cloneMatch = curSelector.match(exprRegex.CLONE)) ? ~~cloneMatch[1] : 1;

        prevChildren = children;

        tag = exprRegex.TAG.exec(curSelector);

        // Create the node

        node = doc.createElement(tag && tag[1] !== '*' ? tag[1] : 'div');

        children = doc.createDocumentFragment();

        c = callbackTypes.length;

        match, regex, callback;

        while (c--) {

            regex = exprRegex[callbackTypes[c]];
            callback = exprCallback[callbackTypes[c]];

            if (regex.global) {

                while ((match = regex.exec(curSelector)) !== null) {

                    callback(match, node);
                }

                continue;

            }

            if (match = regex.exec(curSelector)) {
                callback(match, node);
            }

        }

        while (nClones--) {

            children.appendChild(node.cloneNode(true));
        }
        if (prevChildren) {

            if (isSibling) {

                children.appendChild(prevChildren);
                isSibling = false;

            } else {

                multiAppend(children, prevChildren);
            }

        }

    }

    fragment.appendChild(children);

    // Cache, and make a deep clone

    cache[selector] = fragment.cloneNode(true);

    return fragment.childNodes;

};

// Expose to the global hAzzle Object


/* =========================== PRIVATE FUNCTIONS ========================== */



function multiAppend(parents, children) {

    parents = parents.childNodes;

    var i = parents.length,
        parent;

    while (i--) {

        parent = parents[i];

        if (parent.nodeName.toLowerCase() === 'table') {
            /* IE requires table to have tbody */
            parent.appendChild(parent = doc.createElement('tbody'));
        }

        parent.appendChild(children.cloneNode(true));

    }

}