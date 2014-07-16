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

    white = /^\s+$/,

    equal = '(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)',
    quote = '(["\'])((?:(?=(\\\\?))\\8.)*?)\\6',
    reggy = '^(?:' + equal + ')|^#' + equal + '|^\\.' + equal + '|^\\[' + equal + '(?:([*$|~^]?=)' + quote + ')?\\]|^(\\s+)|^\\s*(,)\\s*|^' + quote.replace(6, 11).replace(8, 13),
    chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,

    // Grouped regEx types

    matchExpr = {
        id: /#((?:[\w00c0-FFFF_-]|\\.)+)/,
        class: /\.((?:[\wu00c0-uFFFF_-]|\\.)+)(?![^[\]]+])/g,
        name: /\[name=['"]*((?:[\w00c0-FFFF_-]|\\.)+)['"]*\]/,
        attr: /\[\s*((?:[\w00c0-FFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
        tag: /^((?:[\w00c0-FFFF\*_-]|\\.)+)/,
        pseudo: /\:(\d+)(?=$|[:[])/,
        combinator: /^[>~+]$/
    },

    tags = ['id', 'class', 'name', 'attr'],

    container = {

        id: function (match, node) {

            node.id = match[1];
        },
        class: function (match, node) {

            var cls = node.className.replace(white, '');
            node.className = cls ? cls + ' ' + match[1] : match[1];
        },

        name: function (match, node) {
            node.name = match[1];
        },
        attr: function (match, node) {

            var attr = match[1],
                val = match[4] || true;
       
	   // Mehran! Happy now when I used  hasOwnProperty ??
	   
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

    for (; selector && (match = selector.match(reggy));) {

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

    while (nParts--) {

        curSelector = selectorParts[nParts];

        if (matchExpr.combinator.test(curSelector)) {
            isSibling = curSelector === '~' || curSelector === '+';
            continue;
        }

        // Number of clones must be an int >= 1

        nClones = (cloneMatch = curSelector.match(matchExpr.pseudo)) ? ~~cloneMatch[1] : 1;

        prevChildren = children;

        tag = matchExpr.tag.exec(curSelector);

        // Create the node

        node = doc.createElement(tag && tag[1] !== '*' ? tag[1] : 'div');

        children = doc.createDocumentFragment();

        c = tags.length;

        while (c--) {

            regex = matchExpr[tags[c]];
            callback = container[tags[c]];

            if (regex.global) {

                while ((match = regex.exec(curSelector)) !== null) {

                    callback(match, node);
                }

                continue;
            }

            if ((match = regex.exec(curSelector))) {
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

                prevChildren = prevChildren.childNodes;

                var i = prevChildren.length,
                    parent;

                while (i--) {

                    parent = prevChildren[i];

                    if (parent.nodeName.toLowerCase() === 'table') {
                        /* IE requires table to have tbody */
                        parent.appendChild(parent = doc.createElement('tbody'));
                    }

                    parent.appendChild(prevChildren.cloneNode(true));
                }
            }
        }
    }

    fragment.appendChild(children);

    // Cache, and make a deep clone

    cache[selector] = fragment.cloneNode(true);

    return fragment.childNodes;
};