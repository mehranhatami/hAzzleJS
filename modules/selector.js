var win = this,

    winDoc = win.document,

    cache = [],

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,

    sibreg = /^.*?#/,

    attrPattern = /\[\s*([-\w]+)\s*(?:([~|^$*!]?=)\s*(?:([-\w]+)|['"]([^'"]*)['"])\s*(i)?\s*)?\]/g,

    pseudoPattern = /::?([-\w]+)(?:\((\([^()]+\)|[^()]+)\))?/g,

    combinatorPattern = /^\s*([,+~]|\/([-\w]+)\/)/,

    selectorPattern = RegExp("^(?:\\s*(>))?\\s*(?:(\\*|\\w+))?(?:\\#([-\\w]+))?(?:\\.([-\\.\\w]+))?((?:" + attrPattern.source + ")*)((?:" + pseudoPattern.source + ")*)(!)?"),

    hasDuplicate,

    selectorGroups = {
        type: 1,
        tag: 2,
        id: 3,
        classes: 4,
        attrsAll: 5,
        pseudosAll: 11,
        subject: 14
    },

    sortOrder = function (a, b) {

        // Flag for duplicate removal

        if (a === b) {

            hasDuplicate = true;
            return 0;
        }

        var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);

        if (compare) {

            // Disconnected nodes

            if (compare & 1) {

                // Choose the first element that is related to our document
                if (a === document || hAzzle.contains(document, a)) {
                    return -1;
                }
                if (b === document || hAzzle.contains(document, b)) {
                    return 1;
                }

                // Maintain original order
                return 0;
            }

            return compare & 4 ? -1 : 1;
        }

        // Not directly comparable, sort on existence of method

        return a.compareDocumentPosition ? -1 : 1;
    };

hAzzle.extend({

    // Contain all CSS pseudo selectors

    pseudos: {},

    /**
     * NOTE!!
     *
     * hAzzle.select supports multiple roots, meaning it can use any
     * number of nodes as roots for the query.
     *
     * Examples:
     *
     * hAzzle('div', node); // a DOM node
     * hAzzle('div', [node1, node2, node3]); // a list of DOM nodes
     * hAzzle('div', '#foo'); // a selector
     * hAzzle('div', hAzzle('div')); // previous result set
     *
     */

    select: function (selector, context, matchRoots) {

        var match, elem, m, nodeType, res;

        if (cache[selector] && !context) {

            return cache[selector];
        }
        // Allways make sure we are on the correct document 

        if ((context ? context.ownerDocument || context : winDoc) !== document) {
            hAzzle.setDocument(context);
        }

        context = context || document;

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        if (!selector) {

            return [];
        }

        if (selector === window || selector === 'window') {

            return [window];
        }

        if (selector === document || selector === 'document') {

            return [document];
        }

        if (hAzzle.documentIsHTML) {

            if ((match = rquickExpr.exec(selector))) {
                if ((m = match[1])) {
                    if (context.nodeType === 9) {
                        elem = context.getElementById(m);
                        if (elem && elem.parentNode) {
                            if (elem.id === m) {
                                res = [elem];
                            }
                        } else {
                            res = [];
                        }
                    } else {

                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            hAzzle.contains(context, elem) && elem.id === m) {
                            res = [elem];
                        }
                    }

                } else if (match[2]) {

                    res = hAzzle.makeArray(context.getElementsByTagName(selector));

                } else if ((m = match[3])) {

                    res = context.getElementsByClassName(m);
                }

                return cache[selector] = res;
            }
        }

        // Normalize our multiple roots

        context = normalizeRoots(context);

        return evaluate(compile(selector), context, matchRoots);
    },

    combine: function (a, b, aRest, bRest, map) {

        var r = [],
            i = 0,
            j = 0;

        while (i < a.length && j < b.length) {
            switch (map[sortOrder(a[i], b[j])]) {
            case -1:
                i++;
                break;
            case -2:
                j++;
                break;
            case 1:
                r.push(a[i++]);
                break;
            case 2:
                r.push(b[j++]);
                break;
            case 0:
                r.push(a[i++]);
                j++;
            }
        }
        if (aRest) {
            while (i < a.length) {
                r.push(a[i++]);
            }
        }
        if (bRest) {
            while (j < b.length) {
                r.push(b[j++]);
            }
        }
        return r;
    },

    matches: function (selector, context) {

        if (typeof selector !== 'string') {

            return null;
        }

        var quick = rquickIs.exec(selector),
            i = 0,
            l = context.length,
            result = [];

        if (quick) {
            //   0  1    2   3          4
            // [ _, tag, id, attribute, class ]
            if (quick[1]) {

                quick[1] = quick[1].toLowerCase();
            }

            if (quick[3]) {

                quick[3] = quick[3].split('=');
            }

            if (quick[4]) {

                quick[4] = ' ' + quick[4] + ' ';
            }
        }

        // Always make sure we have a nodeName

        if (quick && context.nodeName) {

            result = (
                (!quick[1] || context.nodeName.toLowerCase() === quick[1]) &&
                (!quick[2] || context.id === quick[2]) &&
                (!quick[3] || (quick[3][1] ? context.getAttribute(quick[3][0]) === quick[3][1] : context.hasAttribute(quick[3][0]))) &&
                (!quick[4] || (' ' + context.className + ' ').indexOf(quick[4]) >= 0)
            );

            // Fallback to hAzzle.matchesSelector

        } else {


            // Do a quick look-up if no array-context
            //
            // matchesSelector can't be run on XML docs,
            // but we are solving this inside the 
            // matchesSelector.js module

            if (!l) {

                result = hAzzle.matchesSelector(context, selector);

            } else {

                // loop through

                for (; i < l; i++) {

                    if (hAzzle.matchesSelector(context[i], selector)) {

                        result.push(context[i]);
                    }
                }

                if (!result) {

                    var e = compile(selector);

                    if (!e.child && !e.children && !e.pseudos) {

                        return filter(selector, e);

                    } else {

                        return hAzzle.combine(selector, hAzzle.select(selector, findRoots(selector), true), false, false, {
                            '0': 0,
                            '-1': -1,
                            '1': -2
                        });
                    }
                }
            }
        }
        return result;
    }

}, hAzzle);

/* =========================== PRIVATE FUNCTIONS ========================== */

function filterDescendents(els) {
    return els.filter(function (el, i) {

        return el && !(i && (els[i - 1] === el || hAzzle.contains(els[i - 1], el)));
    });
}

function union(a, b) {
    return hAzzle.combine(a, b, true, true, {
        '0': 0,
        '-1': 1,
        '1': 2
    });
}


/**
 * Normalize roots
 */

function normalizeRoots(roots) {

    if (!roots) {

        return [document];

    }


    if (typeof roots === 'string') {

        return hAzzle.select(roots, [document]);

    }

    if (typeof roots === 'object' && isFinite(roots.length)) {

        if (roots.sort) {

            roots.sort(sortOrder);

        } else {

            roots = extend([], roots);
        }

        return roots;

    } else {

        return [roots];
    }
}


function extend(a, b) {
    var x, _i, _len;
    for (_i = 0, _len = b.length; _i < _len; _i++) {
        x = b[_i];
        a.push(x);
    }
    return a;
}

function takeElements(els) {
    return els.filter(function (el) {
        return el.nodeType === 1;
    });
}


function compile(selector) {

    var e, last, result;

    if (selector in compile.cache) {
        return compile.cache[selector];
    }

    result = last = e = parseSimple(selector);
    if (e.compound) {
        e.children = [];
    }
    while (e[0].length < selector.length) {
        selector = selector.substr(last[0].length);
        e = parseSimple(selector);
        if (e.compound) {
            e.children = [result];
            result = e;
        } else if (last.compound) {
            last.children.push(e);
        } else {
            last.child = e;
        }
        last = e;
    }
    return (compile.cache[selector] = result);
}

compile.cache = {};

function parseSimple(selector) {
    var e, group, name;
    if (e = combinatorPattern.exec(selector)) {
        e.compound = true;
        e.type = e[1].charAt(0);
        if (e.type === '/') {
            e.idref = e[2];
        }
    } else if ((e = selectorPattern.exec(selector)) && e[0].trim()) {
        e.simple = true;
        for (name in selectorGroups) {
            group = selectorGroups[name];
            e[name] = e[group];
        }
        e.type || (e.type = ' ');
        e.tag && (e.tag = e.tag.toLowerCase());
        if (e.classes) {
            e.classes = e.classes.toLowerCase().split('.');
        }
        if (e.attrsAll) {
            e.attrs = [];
            e.attrsAll.replace(attrPattern, function (all, name, op, val, quotedVal, ignoreCase) {
                name = name.toLowerCase();
                val || (val = quotedVal);
                if (op === '=') {
                    if (name === 'id' && !e.id) {
                        e.id = val;
                        return "";
                    } else if (name === 'class') {
                        if (e.classes) {
                            e.classes.append(val);
                        } else {
                            e.classes = [val];
                        }
                        return "";
                    }
                }
                if (ignoreCase) {
                    val = val.toLowerCase();
                }
                e.attrs.push({
                    name: name,
                    op: op,
                    val: val,
                    ignoreCase: ignoreCase
                });
                return "";
            });
        }
        if (e.pseudosAll) {
            e.pseudos = [];
            e.pseudosAll.replace(pseudoPattern, function (all, name, val) {
                name = name.toLowerCase();
                e.pseudos.push({
                    name: name,
                    val: val
                });
                return "";
            });
        }
    } else {
        hAzzle.error("Compile error at: " + selector);
    }
    return e;
}


function find(e, roots, matchRoots) {
    var els;

    if (e.id) {
        els = [];
        hAzzle.each(roots, function (root) {
            var doc, el;
            doc = root.ownerDocument || root;
            if (root === doc || (root.nodeType === 1 && hAzzle.contains(doc.documentElement, root))) {
                el = doc.getElementById(e.id);
                if (el && hAzzle.contains(root, el)) {
                    els.push(el);
                }
            } else {
                extend(els, root.getElementsByTagName(e.tag || '*'));
            }
        });
    } else if (e.classes && find.byClass) {
        els = hAzzle.map(roots, function (root) {
            return hAzzle.map(e.classes, function (cls) {
                return root.getElementsByClassName(cls);
            }).reduce(union);
        }).reduce(extend, []);
        e.ignoreClasses = true;
    } else {
        els = hAzzle.map(roots, function (root) {
            return root.getElementsByTagName(e.tag || '*');
        }).reduce(extend, []);
        if (find.filterComments && (!e.tag || e.tag === '*')) {
            els = takeElements(els);
        }
        e.ignoreTag = true;
    }
    if (els && els.length) {
        els = filter(els, e, roots, matchRoots);
    } else {
        els = [];
    }
    e.ignoreTag = void 0;
    e.ignoreClasses = void 0;
    if (matchRoots) {
        els = union(els, filter(takeElements(roots), e, roots, matchRoots));
    }
    return els;
}

function filter(els, e, roots, matchRoots) {

    if (e.id) {
        els = hAzzle.filter(els, function (el) {
            return el.id === e.id;
        });
    }
    if (e.tag && e.tag !== '*' && !e.ignoreTag) {
        els = hAzzle.filter(els, function (el) {
            return el.nodeName.toLowerCase() === e.tag;
        });
    }
    if (e.classes && !e.ignoreClasses) {

        hAzzle.each(e.classes, function (cls) {
            els = hAzzle.filter(els, function (el) {
                return (" " + el.className + " ").indexOf(" " + cls + " ") >= 0;
            });
        });
    }
    if (e.attrs) {

        hAzzle.each(e.attrs, function (_arg) {
            var ignoreCase, name, op, val;
            name = _arg.name, op = _arg.op, val = _arg.val, ignoreCase = _arg.ignoreCase;
            els = els.filter(function (el) {
                var attr, value;
                attr = hAzzle.attr(el, name);
                value = attr + "";
                if (ignoreCase) {
                    value = value.toLowerCase();
                }

                /**
                 * Mehran!
                 *
                 * I'm so sorry for this, but I think you have to simplify this one :)
                 *
                 * Kenny
                 *
                 */


                return (attr || (el.attributes && el.attributes[name] && el.attributes[name].specified)) && (!op ? true : op === '=' ? value === val : op === '!=' ? value !== val : op === '*=' ? value.indexOf(val) >= 0 : op === '^=' ? value.indexOf(val) === 0 : op === '$=' ? value.substr(value.length - val.length) === val : op === '~=' ? (" " + value + " ").indexOf(" " + val + " ") >= 0 : op === '|=' ? value === val || (value.indexOf(val) === 0 && value.charAt(val.length) === '-') : false);
            });
        });
    }

    // Pseudo

    if (e.pseudos) {

        hAzzle.each(e.pseudos, function (arg) {

            var name = arg.name,
                pseudo = hAzzle.pseudos[name],
                val = arg.val;

            if (!pseudo) {

                hAzzle.error("no pseudo with name: " + name);
            }

            if (pseudo.batch) {

                els = pseudo(els, val, roots, matchRoots);

            } else {

                els = hAzzle.filter(els, function (el) {
                    return pseudo(el, val);
                });
            }
        });
    }
    return els;
}


function evaluate(e, roots, matchRoots) {
    var els = [],
        ids,
        outerRoots,
        sibs,
        filterParents;

    if (roots.length) {

        switch (e.type) {

        case ' ':
        case '>':

            outerRoots = filterDescendents(roots);

            els = find(e, outerRoots, matchRoots);

            if (e.type === '>') {

                hAzzle.each(roots, function (el) {
                    el._hAzzle_mark = true;
                });
                els = hAzzle.filter(els, function (el) {
                    if (el.parentNode) {
                        return el.parentNode._hAzzle_mark;
                    }
                });

                hAzzle.each(roots, function (el) {
                    el._hAzzle_mark = void 0;
                });
            }
            if (e.child) {
                if (e.subject) {
                    els = hAzzle.filter(els, function (el) {
                        return evaluate(e.child, [el]).length;
                    });
                } else {
                    els = evaluate(e.child, els);
                }
            }
            break;
        case '+':
        case '~':
        case ',':
        case '/':

            if (e.children.length === 2) {

                sibs = evaluate(e.children[0], roots, matchRoots);
                els = evaluate(e.children[1], roots, matchRoots);

            } else {

                sibs = roots;

                filterParents = filterDescendents(hAzzle.map(roots, function (el) {
                    return el.parentNode;
                }));

                els = evaluate(e.children[0], filterParents, matchRoots);
            }

            // Splitted by comma

            if (e.type === ',') {

                els = union(sibs, els);

            } else if (e.type === '/') {

                ids = hAzzle.map(sibs, function (el) {

                    return hAzzle.attr(el, e.idref).replace(sibreg, '');
                });

                els = els.filter(function (el) {
                    return ~ids.indexOf(el.id);
                });

            } else if (e.type === '+') {

                hAzzle.each(sibs, function (el) {
                    if (el.nextElementSibling) {
                        el._hAzzle_mark = true;
                    }
                });

                els = hAzzle.filter(els, function (el) {

                    return el._hAzzle_mark;
                });

                hAzzle.each(sibs, function (el) {
                    if (el.nextElementSibling) {
                        el._hAzzle_mark = void 0;
                    }
                });

            } else if (e.type === '~') {

                hAzzle.each(sibs, function (el) {

                    while (el.nextElementSibling && !el._hAzzle_mark) {
                        el._hAzzle_mark = true;
                    }
                });

                els = hAzzle.filter(els, function (el) {
                    return el._hAzzle_mark;
                });

                hAzzle.each(sibs, function (el) {
                    while (el.nextElementSibling && el._hAzzle_mark) {
                        el._hAzzle_mark = void 0;
                    }
                });
            }
        }
    }
    return els;
}



function findRoots(els) {
    var r = [];
    hAzzle.each(els, function (el) {
        while (el.parentNode) {
            el = el.parentNode;
        }
        if (r[r.length - 1] !== el) {
            r.push(el);
        }
    });
    return r;
}