/**
 * hAzzle CSS pseudo selector
 *
 * hAzzle supports CSS4!!!
 *
 */

var win = this,

    i,

    pseudos = hAzzle.pseudos,

    indexOf = Array.prototype.indexOf,

    pinput = /^(?:input|select|textarea|button)$/i,

    pheader = /^h\d$/i,

    identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',

    langidentifier = new RegExp('^' + identifier + '$'),

    whitespace = "[\\x20\\t\\r\\n\\f]",

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
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

/* =========================== PSEUDO SELECTORS ========================== */
hAzzle.extend({

    'parent': function (el) {
        return !pseudos.empty(el);
    },

    'selected': function (el) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
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
        return el === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(el.type || el.href || ~el.tabIndex);
    },

    'hover': function (el) {
        return el === el.hoverElement;
    },

    'target': function (el) {
        var hash = win.location && win.location.hash;
        return hash && hash.slice(1) === el.id;
    },    'lang': function (el, lang) {
        // lang value must be a valid identifier
        if (!langidentifier.test(lang || '')) {
            hAzzle.error('unsupported lang: ' + lang);
        }
        lang = lang.replace(runescape, funescape).toLowerCase();

        var elemLang;

        do {
            if ((elemLang = hAzzle.documentIsHTML ?
                el.lang :
                el.getAttribute('xml:lang') || el.getAttribute('lang'))) {

                elemLang = elemLang.toLowerCase();
                return elemLang === lang || indexOf(elemLang, lang + '-') === 0;
            }
        } while ((el = el.parentNode) && el.nodeType === 1);
        return false;
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
        return intersection(els, hAzzle.tricky(val, roots, matchRoots));
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

    'local-link': function (el, val) {
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
        return difference(els, hAzzle.tricky(val, roots, matchRoots));
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

            var check, m, set = [];

            if (nth) {

                m = nthPattern.exec(val);

                check = function (i) {
                    return checkNth(i, m);
                };
            }
            // Do a quick look-up

            hAzzle.each(hAzzle.tricky('table', roots), function (table) {

                var col, max, min, tbody, _i, _len, _ref;

                if (!nth) {

                    col = hAzzle.tricky(val, [table])[0];
                    min = 0;

                    eachElement(col, 'previousSibling', 'previousSibling', function (col) {

                        return min += parseInt(col.getAttribute('span') || 1);
                    });

                    max = min + parseInt(col.getAttribute('span') || 1);

                    check = function (i) {
                        return (min < i && i <= max);
                    };
                }

                _ref = table.tBodies;

                for (_i = 0, _len = _ref.length; _i < _len; _i++) {

                    tbody = _ref[_i];

                    eachElement(tbody, 'firstChild', 'nextSibling', function (row) {
                        var i;
                        if (row.tagName.toLowerCase() !== 'tr') {
                            return;
                        }

                        i = 0;

                        eachElement(row, first, next, function (col) {
                            var span;
                            span = parseInt(col.getAttribute('span') || 1);
                            while (span) {
                                if (check(++i)) {
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

    pseudos['column'] = matchColumn(false);
    pseudos['column'].batch = true;
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
                set = hAzzle.tricky(m[7], roots),
                len = set.length;

            hAzzle.each(set, function (el, i) {
                el._sel_index = (reversed ? len - i : i) + 1;
            });

            filtered = hAzzle.filter(els, function (el) {
                return checkNth(el._sel_index, m);
            });

            hAzzle.each(set, function (el) {
                el._sel_index = void 0;
            });
            return filtered;
        };
    }

    pseudos['nth-match'] = nthMatch();
    pseudos['nth-match'].batch = true;
    pseudos['nth-last-match'] = nthMatch(true);
    pseudos['nth-last-match'].batch = true;

    /**
     * CSS2 / 3 nth selectors
     */

    function nthPositional(fn, reversed) {

        var first = reversed ? 'lastChild' : 'firstChild',
            next = reversed ? 'previousSibling' : 'nextSibling';

        return function (els, val) {

            var filtered, m;

            if (val) {
                m = nthPattern.exec(val);

            }

            hAzzle.each(els, function (el) {
                var indices, parent;
                if ((parent = el.parentNode) && parent._sel_children === void 0) {
                    indices = {
                        '*': 0
                    };
                    eachElement(parent, first, next, function (el) {
                        el._sel_index = ++indices['*'];
                        el._sel_indexOfType = indices[el.nodeName] = (indices[el.nodeName] || 0) + 1;
                    });
                    parent._sel_children = indices;
                }

            });

            filtered = hAzzle.filter(els, function (el) {
                return fn(el, m);
            });

            hAzzle.each(els, function (el) {
                var parent;
                if ((parent = el.parentNode) && parent._sel_children !== void 0) {
                    eachElement(parent, first, next, function (el) {
                        el._sel_index = el._sel_indexOfType = void 0;
                    });
                    parent._sel_children = void 0;
                }
            });
            return filtered;
        };
    }

    var positionalPseudos = {

        'first-child': function (el) {
            return el._sel_index === 1;
        },
        'only-child': function (el) {
            return el._sel_index === 1 && el.parentNode._sel_children['*'] === 1;
        },
        'nth-child': function (el, m) {
            return checkNth(el._sel_index, m);
        },
        'first-of-type': function (el) {
            return el._sel_indexOfType === 1;
        },
        'only-of-type': function (el) {
            return el._sel_indexOfType === 1 && el.parentNode._sel_children[el.nodeName] === 1;
        },
        'nth-of-type': function (el, m) {
            return checkNth(el._sel_indexOfType, m);
        }
    };

    for (name in positionalPseudos) {

        fn = positionalPseudos[name];

        pseudos[name] = nthPositional(fn);
        pseudos[name].batch = true;
        if (name.substr(0, 4) !== 'only') {
            name = name.replace('first', 'last').replace('nth', 'nth-last');
            pseudos[name] = nthPositional(fn, true);
            pseudos[name].batch = true;
        }
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
        if (el.nodeType === 1) {
            if (fn(el) === false) {
                break;
            }
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