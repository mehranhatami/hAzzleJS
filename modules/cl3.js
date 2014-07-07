/*
 *
 * CSS3 pseudo-classes extension for Jiesa
 *
 * Contains all CSS Level 3 selectors
 *
 */
var win = this,
    doc = win.document,
    i,
    Jiesa = hAzzle.Jiesa,
    rinputs = /^(?:input|select|textarea|button)$/i,
    rheader = /^h\d$/i,

    nthPattern = /\s*((?:\+|\-)?(\d*))n\s*((?:\+|\-)\s*\d+)?\s*/,

    identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

    ridentifier = new RegExp("^" + identifier + "$"),

    runescape = Jiesa.runescape,

    funescape = Jiesa.funescape,

    linkNodes = {
        'a': 1,
        'A': 1,
        'area': 1,
        'AREA': 1,
        'link': 1,
        'LINK': 1
    };

hAzzle.extend({

    pseudo_filters: {

        // Mehran! You fix this. Couldn't get it to work just now
        "lang": function (el, lang) {

            if (!ridentifier.test(lang || "")) {
                hAzzle.error("unsupported lang: " + lang);
            }

            lang = lang.replace(runescape, funescape).toLowerCase();

            var elemLang;
            do {
                if ((elemLang = hAzzle.documentIsHTML ?
                    elem.lang :
                    elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

                    elemLang = elemLang.toLowerCase();
                    return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);
            return false;

        },


        'only-of-type': function (el) {

            return Jiesa.pseudo_filters['first-of-type'](el) && Jiesa.pseudo_filters['last-of-type'](el);
        },

        // first-of-type

        'first-of-type': function (el) {
            if (el.parentNode.nodeType !== 1) {
                return;
            }
            var type = el.nodeName;
            while (el = Jiesa.prev(el)) {
                if (el.nodeName === type) {
                    return;
                }
            }
            return true;
        },

        // last-of-type

        'last-of-type': function (el) {

            if (el.parentNode.nodeType !== 1) {
                return;
            }

            var type = el.nodeName;

            while ((el = Jiesa.next(el))) {

                if (el.nodeName === type) {
                    return;
                }
            }
            return true;
        },

        'nth-child': function (elem, val) {
            var p;
            if (!val || !(p = elem.parentNode)) {
                return false;
            }
            return checkNth(elem, children(p), val);
        },
        'nth-last-child': function (el, val) {
            var p;
            if (!val || !(p = el.parentNode)) {
                return false;
            }
            return checkNth(el, children(p).reverse(), val);
        },
        'nth-last-of-type': function (el, val) {
            var p;
            if (!val || !(p = el.parentNode)) {
                return false;
            }
            return checkNth(el, children(p, el.nodeName).reverse(), val);
        },
        'first-child': function (elem) {
            if ((elem === hAzzle.firstElementChild(elem.parentNode))) {
                return true;
            }
            return false;
        },
        'last-child': function (elem) {
            if ((elem === hAzzle.lastElementChild(elem.parentNode))) {
                return true;
            }
            return false;
        },
        'hidden': function (elem) {
            if (elem.style) {
                if (elem.style.display === 'none' || elem.style.visibility === 'hidden') {
                    return true;
                }
            }
            return elem.type === 'hidden';
        },
        'contains': function (elem, text) {
            text = text.replace("'", "").replace("'", "");
            text = text.replace(runescape, funescape);
            return (elem.textContent || elem.innerText || hAzzle.getText(elem)).indexOf(text) !== -1;
        },
        'notcontains': function (elem, sel) {
            return !Jiesa.pseudo_filters.contains(elem, sel);
        },
        'only-child': function (elem) {
            return !Jiesa.prev(elem) && !Jiesa.next(elem) && elem.parentNode.childElementCount == 1;
        },

        // Select all elements that have no children (including text nodes).

        'empty': function (elem) {

            elem = elem.firstChild;

            while (elem) {
                if (elem.nodeType < 6) {
                    return false;
                }
                elem = elem.nextSibling;
            }

            return true;
        },

        'input': function (elem) {
            return rinputs.test(elem.nodeName);
        },
        'parent': function (elem) {
            return !Jiesa.pseudo_filters.empty(elem);
        },

        'selected': function (elem) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (elem.parentNode) {
                elem.parentNode.selectedIndex;
            }

            return elem.selected === true;
        },

        'root': function (elem) {
            return elem === hAzzle.docElem;
        },

        'focus': function (elem) {
            return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || typeof elem.tabIndex === 'number');
        },

        'target': function (elem) {
            var hash = win.location ? win.location.hash : '';
            return hash && hash.slice(1) === elem.id;
        },
        'active': function (elem) {
            return elem === doc.activeElement;
        },

        'hover': function (elem) {
            return elem === doc.hoverElement;
        },
        'visited': function (elem, sel) {
            return isLink(sel) && elem.visited;
        },

        'visible': function (elem) {
            return !Jiesa.pseudo_filters.hidden(elem);
        },
        'enabled': function (elem) {
           return typeof elem.form !== 'undefined' && elem.disabled === false;
        },
        'disabled': function (elem) {
           return typeof elem.form !== 'undefined' && elem.disabled === true;
        },
        'text': function (elem) {
            var attr;
            return elem.nodeName.toLowerCase() === 'input' &&
                elem.type === 'text' &&
                ((attr = elem.getAttribute('type')) === null || attr.toLowerCase() === 'text');
        },
        'header': function (elem) {
            return rheader.test(elem.nodeName);
        },
        'checked': function (elem) {
            var nodeName = elem.nodeName.toLowerCase();
            return (nodeName === 'input' && !!elem.checked) || (nodeName === 'option' && !!elem.selected);
        },
        'unchecked': function (elem) {
            return !Jiesa.pseudo_filters.checked(elem);
        },

        'button': function (elem) {
            var name = elem.nodeName.toLowerCase();
            return name === 'input' && elem.type === 'button' || name === 'button';
        },
    }

}, Jiesa);

/* =========================== INTERNAL ========================== */

// Add button/input type pseudos

for (i in {
    radio: true,
    checkbox: true,
    file: true,
    password: true,
    image: true
}) {
    Jiesa.pseudo_filters[i] = createInputPseudo(i);
}
for (i in {
    submit: true,
    reset: true
}) {
    Jiesa.pseudo_filters[i] = createButtonPseudo(i);
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */

function createInputPseudo(type) {
    return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === type;
    };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo(type) {
    return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === 'input' || name === 'button') && elem.type === type;
    };
}

function children(node, ofType) {
    var r = [],
        i, l,
        nodes = node.childNodes;

    for (i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].nodeType == 1 && (!ofType || nodes[i].nodeName == ofType)) {
            r.push(nodes[i]);
        }
    }
    return r;
}

function checkNth(el, nodes, val) {
    var m;
    if (isFinite(val)) {
        return nodes[val - 1] == el;
    }

    if (val == 'odd') {
        return checkNthExpr(el, nodes, 2, 1);
    }

    if (val == 'even') {
        return checkNthExpr(el, nodes, 2, 0);
    }

    if ((m = nthPattern.exec(val))) {

        return checkNthExpr(el, nodes, (m[2] ? parseInt(m[1], 10) : parseInt(m[1] + '1', 10)), // Check case where coefficient is omitted
            (m[3] ? parseInt(m[3].replace(/\s*/, ''), 10) : 0)); // Check case where constant is omitted
    }
    return false;
}

function checkNthExpr(el, nodes, a, b) {
    if (!a) {
        return (nodes[b - 1] == el);
    }
    for (var i = b, l = nodes.length;
        ((a > 0) ? (i <= l) : (i >= 1)); i += a)
        if (el == nodes[i - 1]) return true;
    return false;
}


function isLink(elem) {
    return elem.getAttribute('href') && linkNodes[elem.nodeName];
}