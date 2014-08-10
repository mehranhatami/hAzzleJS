/* ============================ CL3 SELECTORS =========================== */

var header = /^h\d$/i,
    inputs = /^(?:input|select|textarea|button)$/i,
    identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

    ridentifier = new RegExp("^" + identifier + "$"),

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters

    runescape = new RegExp("\\\\([\\da-f]{1,6}" + '[\\x20\\t\\r\\n\\f]' + "?|(" + '[\\x20\\t\\r\\n\\f]' + ")|.)", "ig"),
    funescape = function(_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    };

// NOTE!! This pseudo selectors are not nativelly supported by
// QSA, query (DL 4) / queryAll (DL 4), and added here just to
// keep up with Sizzle
hAzzle.extend({

    // Nativelly supported, but buggy

    'EMPTY': function(elem) {
        // DomQuery and jQuery get this wrong, oddly enough.
        // The CSS 3 selectors spec is pretty explicit about it, too.
        var cn = elem.childNodes,
            cnl = elem.childNodes.length,
            nt,
            x = cnl - 1;

        for (; x >= 0; x--) {
            nt = cn[x].nodeType;

            if ((nt === 1) || (nt == 3)) {
                return false;
            }
        }
        return true;
    },

    'HIDDEN': function(elem) {
        if (elem.style) {
            if (elem.style.display === 'none' || elem.style.visibility === 'hidden') {
                return true;
            }
        }
        return elem.type === 'hidden';
    },

    'TARGET': function(elem) {
        var hash = window.location ? window.location.hash : '';
        return hash && hash.slice(1) === elem.id;
    },
    'ACTIVE': function(elem) {
        return elem === document.activeElement;
    },

    'HOVER': function(elem) {
        return elem === document.hoverElement;
    },

    'VISIBLE': function(elem) {
        return !hAzzle.Expr.HIDDEN(elem);
    },

    'TEXT': function(elem) {
        var attr;
        return elem.nodeName.toLowerCase() === 'input' &&
            elem.type === 'text' &&
            ((attr = elem.getAttribute('type')) === null || attr.toLowerCase() === 'text');
    },
    'HEADER': function(elem) {
        return header.test(elem.nodeName);
    },
    'BUTTON': function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === 'button' || name === 'button';
    },
    'INPUT': function(elem) {
        return inputs.test(elem.nodeName);
    },
    'PARENT': function(elem) {
        return !hAzzle.Expr.EMPTY(elem);
    },
    'SELECTED': function(elem) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
            elem.parentNode.selectedIndex;
        }


        return elem.selected === true;
    },
    'LANG': function(lang) {
        // lang value must be a valid identifier
        if (!ridentifier.test(lang || "")) {
            hAzzle.error("unsupported lang: " + lang);
        }
        lang = lang.replace(runescape, funescape).toLowerCase();
        return function(elem) {
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
        };
    }
}, hAzzle.Expr);

// Add button/input type pseudos

hAzzle.each({
    RADIO: true,
    CHECKBOX: true,
    FILE: true,
    PASSWORD: true,
    IMAGE: true
}, function(value, prop) {
    hAzzle.Expr[prop] = createInputPseudo(prop);
});

hAzzle.each({
    SUBMIT: true,
    RESET: true
}, function(value, prop) {
    hAzzle.Expr[prop] = createButtonPseudo(prop);
});


/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */

function createInputPseudo(type) {
    return function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === type.toLowerCase();
    };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */

function createButtonPseudo(type) {
    return function(elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === 'input' || name === 'button') && elem.type === type.toLowerCase();
    };
}