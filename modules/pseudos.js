// Jiesa CSS pseudo selectors
var win = this,
    doc = win.document,
    i,
    Jiesa = hAzzle.Jiesa,
    rinputs = /^(?:input|select|textarea|button)$/i,
    rheader = /^h\d$/i,

    nthPattern = /\s*((?:\+|\-)?(\d*))n\s*((?:\+|\-)\s*\d+)?\s*/,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    whitespace = "[\\x20\\t\\r\\n\\f]",

    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),

    funescape = function (_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        // Support: Firefox<24
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    };

hAzzle.extend({

    pseudo_filters: {

        'only-of-type': function (el) {

            return Jiesa.pseudo_filters['first-of-type'](el) && Jiesa.pseudo_filters['last-of-type'](el);
        },

        // first-of-type

        'first-of-type': function (el) {


            if (el.parentNode.nodeType !== 1) return;
            var type = el.nodeName;
            while (el = prev(el)) {
                if (el.nodeName === type) return;
            }
            return true;
        },

        // last-of-type

        'last-of-type': function (el) {

            if (el.parentNode.nodeType !== 1) {
                return;
            }

            var type = el.nodeName;

            while ((el = next(el))) {

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
            if ((elem === firstElementChild(elem.parentNode))) {
                return true;
            }
            return false;
        },
        'last-child': function (elem) {
            if ((elem === lastElementChild(elem.parentNode))) {
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
            return !prev(elem) && !next(elem) && elem.parentNode.childElementCount == 1;

        },
        'empty': function (elem) {
            // http://www.w3.org/TR/selectors/#empty-pseudo
            // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
            //   but not by others (comment: 8; processing instruction: 7; etc.)
            // nodeType < 6 works because attributes (2) do not appear as children
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                if (elem.nodeType < 6) {
                    return false;
                }
            }
            return true;
        },

        "input": function (elem) {
            return rinputs.test(elem.nodeName);
        },
        'parent': function (elem) {
            return !Jiesa.pseudo_filters.empty(elem);
        },

        'not': function (elem, sel) {
            return Jiesa.parse(sel.replace(rtrim, "$1")).indexOf(elem) == -1;
        },
        'has': function (elem, sel) {
            return Jiesa.parse(sel, elem).length > 0;
        },
        'nothas': function (elem, sel) {
            return !Jiesa.pseudo_filters.has(elem, sel);
        },
        'selected': function (elem) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (elem.parentNode) {
                elem.parentNode.selectedIndex;
            }

            return elem.selected === true;
        },

        "root": function (elem) {
            return elem === hAzzle.docElem;
        },

        "focus": function (elem) {
            return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },
        "target": function (elem) {
            var hash = win.location && win.location.hash;
            return hash && hash.slice(1) === elem.id;
        },

        'visible': function (elem) {
            return !Jiesa.pseudo_filters.hidden(elem);
        },
        'enabled': function (elem) {
            return elem.disabled === false;
        },
        'disabled': function (elem) {
            return elem.disabled === true;
        },
        'text': function (elem) {
            var attr;
            return elem.nodeName.toLowerCase() === "input" &&
                elem.type === "text" &&

                // Support: IE<8
                // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
                ((attr = elem.getAttribute("type")) === null || attr.toLowerCase() === "text");
        },
        'header': function (elem) {
            return rheader.test(elem.nodeName);
        },
        'checked': function (elem) {
            var nodeName = elem.nodeName.toLowerCase();
            return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
        },
        'unchecked': function (elem) {
            return !Jiesa.pseudo_filters.checked(elem);
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
        return name === "input" && elem.type === type;
    };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo(type) {
    return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
    };
}

function children(node, ofType) {
    var r = []
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
        return (nodes[b - 1] == el)
    }
    for (i = b, l = nodes.length;
        ((a > 0) ? (i <= l) : (i >= 1)); i += a)
        if (el == nodes[i - 1]) return true;
    return false;
}

function next(el) {
    while ((el = el.nextSibling) && el.nodeType !== 1);
    return el;
}

function prev(el) {
    while ((el = el.previousSibling) && el.nodeType !== 1);
    return el;
}

function lastElementChild(el) {
    var child = el.lastElementChild;
    if (!child) {
        child = el.lastChild;
        while (child && child.nodeType !== 1)
            child = child.previousSibling;
    }
    return child;
}

function firstElementChild(el) {
    var child = el.firstElementChild;
    if (!child) {
        child = el.firstChild;
        while (child && child.nodeType !== 1)
            child = child.nextSibling;
    }
    return child;
}