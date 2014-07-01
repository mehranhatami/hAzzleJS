/**
 * hAzzle CSS pseudo selector
 *
 * hAzzle supports CSS4!!!
 */
var win = this,

    doc = win.document,

    i,

    pseudos = hAzzle.pseudos,

    pinput = /^(?:input|select|textarea|button)$/i,

    pheader = /^h\d$/i,

    whitespace = "[\\x20\\t\\r\\n\\f]",

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),

    funescape = function (_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    };

/* =========================== PSEUDO SELECTORS ========================== */

hAzzle.extend({

    'parent': function (el) {
        return !pseudos.empty(el);
    },

    'selected': function (el) {

        if (el.parentNode) {
            el.parentNode.selectedIndex;
        }

        return el.selected === true;
    },

    'link': function (el) {
        return el.nodeName.toLowerCase() === 'a' && el.href;
    },

    'visited': function (el) {
        return el.nodeName.toLowerCase() === 'a' && el.href && el.visited;
    },

    'active': function (el) {

        return el === el.activeElement;
    },

    'focus': function (el) {
        return el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || ~el.tabIndex);
    },

    'hover': function (el) {
        return el === el.hoverElement;
    },

    'target': function (el) {
        var hash = win.location && win.location.hash;
        return hash && hash.slice(1) === el.id;
    },

    'has': function (el, selector) {
        return hAzzle.select(selector, el).length > 0;
    },

    'header': function (el) {

        return pheader.test(el.nodeName);
    },

    'input': function (el) {

        return pinput.test(el.nodeName);
    },

    'text': function (el) {
        var attr;
        return el.nodeName.toLowerCase() === 'input' &&
            el.type === 'text' &&
            ((attr = el.getAttribute('type')) === null || attr.toLowerCase() === 'text');
    },

    'enabled': function (el) {

        return el.disabled === false;
    },

    'checked': function (el) {
        return el.checked === true;
    },

    // non-standard

    'unchecked': function (el) {

        return el.checked === false;
    },

    'disabled': function (el) {

        return el.disabled === true;
    },

    'root': function (el) {

        return el === hAzzle.docElem;
    },

    'empty': function (el) {
        // http://www.w3.org/TR/selectors/#empty-pseudo
        // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
        //   but not by others (comment: 8; processing instruction: 7; etc.)
        // nodeType < 6 works because attributes (2) do not appear as children
        for (el = el.firstChild; el; el = el.nextSibling) {
            if (el.nodeType < 6) {
                return false;
            }
        }
        return true;
    },

    'contains': function (el, text) {
        text = text.replace(runescape, funescape);
        return (el.textContent || el.innerText || hAzzle.getText(el)).indexOf(text) > -1;
    },

    // CSS 4

    'matches': function (els, val, roots, matchRoots) {
        return intersection(els, hAzzle.select(val, roots, matchRoots));
    },

    'in-range': function (el) {
        return el.value > el.min && el.value <= el.max;
    },
    ':out-of-range': function (el) {

        return !pseudos['in-range'](el);
    },
    'required': function (el) {
        return !!el.required;
    },
    'optional': function (el) {
        return !el.required;
    },
    'links-here': function (el) {
        return el + '' === win.location + '';
    },
    'any-link': function (el) {
        return typeof el.href === 'string';
    },

   'local-link': function (el) {
        if (el.nodeName) return el.href && el.host === win.location.host;

        var param = +el + 1;

        return function (el) {
            if (!el.href) return;

            var url = win.location + '',
                href = el + '';

            return truncateUrl(url, param) === truncateUrl(href, param);
        };
    },

    'dir': function (el, param) {

        while (el) {

            if (el.dir) {

                return el.dir === param;

            }

            el = el.parentNode;
        }
    },
    'scope': function (el, con) {
        var context = con || el.ownerDocument;
        if (context.nodeType === 9) {
            return el === context.documentElement;
        }
        return el === context;
    },

    'default': function (el) {
        return !!el.defaultSelected;
    },
    'valid': function (el) {
        return el.willValidate || (el.validity && el.validity.valid);
    },
    'invalid': function (el) {

        return !pseudos.valid(el);
    },

    'read-only': function (el) {
        if (el.readOnly) return true;

        var attr = el.getAttribute('contenteditable'),
            prop = el.contentEditable,
            name = el.nodeName.toLowerCase();

        name = name !== 'input' && name !== 'textarea';

        return (name || el.disabled) && attr === null && prop !== 'true';
    },

    'read-write': function (el) {

        return !pseudos['read-only'](el);
    },

    // Complex pseudos

    'not': function (els, val, roots, matchRoots) {
        return difference(els, hAzzle.select(val, roots, matchRoots));
    }

}, pseudos);

pseudos.matches.batch = true;
pseudos.not.batch = true;


/* =========================== PRIVATE FUNCTIONS ========================== */

// Deal with nth for CSS2, CSS3, and CSS4 selectors

(function () {

    var fn, name, nthPattern = /^\s*(even|odd|(?:(\+|\-)?(\d*)(n))?(?:\s*(\+|\-)?\s*(\d+))?)(?:\s+of\s+(.*?))?\s*$/;

    function checkNth(i, m) {

        var a = parseInt((m[2] || '+') + (m[3] === '' ? (m[4] ? '1' : '0') : m[3])),
            b = parseInt((m[5] || '+') + (m[6] === '' ? '0' : m[6]));

        if (m[1] === 'even') {

            return i % 2 === 0;

        } else if (m[1] === 'odd') {

            return i % 2 === 1;

        } else if (a) {

            return ((i - b) % a === 0) && ((i - b) / a >= 0);

        } else if (b) {

            return i === b;

        } else {

            hAzzle.error('Invalid nth expression');
        }
    }

    /**
     * Check for match with CSS4 match column selectors
     *
     */

    function matchColumn(nth, reversed) {

        var first = reversed ? 'lastChild' : 'firstChild',
            next = reversed ? 'previousSibling' : 'nextSibling';

        return function (els, val, roots) {

            var check, m, set = [],
                table = hAzzle.select('table', roots);

            if (nth) {

                m = nthPattern.exec(val);

                check = function (i) {
                    return checkNth(i, m);
                };
            }

            // Do a quick look-up

            // Todo! Need to be re-developed to normal for-loop for
            // better performance.

            hAzzle.each(table, function (table) {

                var col, max, min, tbody, i = 0,
                    len, ref, span, ib = 0;

                if (!nth) {

                    col = hAzzle.select(val, [table])[0];
                    min = 0;

                    eachElement(col, 'previousSibling', 'previousSibling', function (col) {

                        return min += parseInt(col.getAttribute('span') || 1);
                    });

                    max = min + parseInt(col.getAttribute('span') || 1);

                    check = function (i) {
                        return (min < i && i <= max);

                    };
                }

                ref = table.tBodies;
                len = ref.length;

                for (; i < len; i++) {

                    tbody = ref[i];

                    eachElement(tbody, 'firstChild', 'nextSibling', function (row) {

                        if (row.tagName.toLowerCase() !== 'tr') {
                            return;
                        }

                        ib = 0;

                        eachElement(row, first, next, function (col) {
                            span = parseInt(col.getAttribute('span') || 1);
                            while (span) {
                                if (check(++ib)) {
                                    set.push(col);
                                }
                                span--;
                            }
                        });
                    });
                }
            });
            return intersection(els, set);
        };
    }

    pseudos.column = matchColumn(false);
    pseudos.column.batch = true;
    pseudos['nth-column'] = matchColumn(true);
    pseudos['nth-column'].batch = true;
    pseudos['nth-last-column'] = matchColumn(true, true);
    pseudos['nth-last-column'].batch = true;

    /**
     * CSS4 nth-match selectors
     */

    function nthMatch(reversed) {

        return function (els, val, roots) {

            var filtered,
                m = nthPattern.exec(val),
                set = hAzzle.select(m[7], roots),
                len = set.length;

            hAzzle.each(set, function (el, i) {
                el._hAzzle_index = (reversed ? len - i : i) + 1;
            });

            filtered = hAzzle.filter(els, function (el) {
                return checkNth(el._hAzzle_index, m);
            });

            hAzzle.each(set, function (el) {
                el._hAzzle_index = void 0;
            });
            return filtered;
        };
    }

    pseudos['nth-match'] = nthMatch();
    pseudos['nth-match'].batch = true;
    pseudos['nth-last-match'] = nthMatch(true);
    pseudos['nth-last-match'].batch = true;

    /**
     * Parse CSS2 / 3 nth selectors
     */

    function parseNth(fn, reversed) {

        var first = reversed ? 'lastChild' : 'firstChild',
            next = reversed ? 'previousSibling' : 'nextSibling';

        return function (els, val) {

            var filtered, m, parent, i = 0,
                el, len = els.length,
                indices;

            if (val) {

                m = nthPattern.exec(val);
            }

            // Loop through

            for (; i < len; i++) {

                el = els[i];

                if ((parent = el.parentNode) && parent._hAzzle_children === undefined) {

                    indices = {

                        '*': 0
                    };

                    eachElement(parent, first, next, function (el) {

                        el._hAzzle_index = ++indices['*'];
                        el._hAzzle_indexOfType = indices[el.nodeName] = (indices[el.nodeName] || 0) + 1;
                    });

                    parent._hAzzle_children = indices;
                }

            }

            filtered = hAzzle.filter(els, function (el) {
                return fn(el, m);
            });

            for (; i < len; i++) {

                el = els[i];

                if ((parent = el.parentNode) && parent._hAzzle_children !== undefined) {

                    eachElement(parent, first, next, function (el) {

                        el._hAzzle_index = el._hAzzle_indexOfType = undefined;
                    });

                    parent._hAzzle_children = undefined;
                }
            }

            return filtered;
        };
    }

    var positionalPseudos = {

        'first-child': function (el) {

            return el._hAzzle_index === 1;
        },

        'only-child': function (el) {

            return el._hAzzle_index === 1 && el.parentNode._hAzzle_children['*'] === 1;
        },
        'nth-child': function (el, m) {

            return checkNth(el._hAzzle_index, m);
        },
        'first-of-type': function (el) {

            return el._hAzzle_indexOfType === 1;
        },
        'only-of-type': function (el) {

            return el._hAzzle_indexOfType === 1 && el.parentNode._hAzzle_children[el.nodeName] === 1;
        },
        'nth-of-type': function (el, m) {

            return checkNth(el._hAzzle_indexOfType, m);
        }
    };

    for (name in positionalPseudos) {
        fn = positionalPseudos[name];
        pseudos[name] = parseNth(fn, false);
        pseudos[name].batch = true;
        hAzzle.each(['last-child', 'nth-last-child', 'last-of-type', 'nth-last-of-type'], function (name) {
            pseudos[name] = parseNth(fn, true);
            pseudos[name].batch = true;
        });
    }
})();

/**
 * Truncate given url
 *
 * @param {String} url
 * @param {String} num
 *
 * @return {Object}
 */

function truncateUrl(url, num) {
    return url
        .replace(/^(?:\w+:\/\/|\/+)/, '')
        .replace(/(?:\/+|\/*#.*?)$/, '')
        .split('/', num)
        .join('/');
}

function eachElement(el, first, next, fn) {

    if (first) {
        el = el[first];
    }

    while (el) {

        if (el.nodeType === 1 && fn(el) === false) {
            break;
        }

        el = el[next];
    }
}


function intersection(a, b) {
    return hAzzle.combine(a, b, false, false, {
        '0': 0,
        '-1': -1,
        '1': -2
    });
}

function difference(a, b) {
    return hAzzle.combine(a, b, true, false, {
        '0': -1,
        '-1': 1,
        '1': -2
    });
}


/* =========================== INTERNAL ========================== */

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

// Add button/input type pseudos
for (i in {
    radio: true,
    checkbox: true,
    file: true,
    password: true,
    image: true
}) {
    pseudos[i] = createInputPseudo(i);
}

for (i in {
    submit: true,
    reset: true
}) {
    pseudos[i] = createButtonPseudo(i);
}