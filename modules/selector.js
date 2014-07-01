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

        var match, elem, m, res;

        // Allways make sure we are on the correct document 

        if ((context ? context.ownerDocument || context : winDoc) !== document) {
            hAzzle.setDocument(context);
        }

        context = context || document;

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


        // Everything else

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

    return hAzzle.filter(els, function (el, i) {
        return el && !(i && (els[i - 1] === el || hAzzle.contains(els[i - 1], el)));
    });
}


function outerParents(els) {
    return filterDescendents(selMap(els, function (el) {
        return el.parentNode;
    }));
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
    var x, i = 0,
        len = b.length;

    for (; i < len; i++) {
        x = b[i];
        a.push(x);
    }
    return a;
}



function compile(selector) {



    if (selector in compile.cache) {

        return compile.cache[selector];
    }

    var ps = parseSimple(selector),
        e = ps,
        last = ps,
        result = ps;

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

    return compile.cache[selector] = result;
}

compile.cache = {};

function parseSimple(selector) {

    var e, group, name;

    if ((e = combinatorPattern.exec(selector))) {

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

                e.pseudos.push({
                    name: name.toLowerCase(),
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

    var els, fr;

    // Find by 'id'

    if (e.id) {

        els = [];
        roots.forEach(function (root) {
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

        // Find by 'class'

    } else if (e.classes) {

        els = selMap(roots, function (root) {
            return selMap(e.classes, function (cls) {
                return root.getElementsByClassName(cls);
            }).reduce(union);
        }).reduce(extend, []);
        e.ignoreClasses = true;

    } else {

        // selMap() quicker then native map()

        els = selMap(roots, function (root) {

            return root.getElementsByTagName(e.tag || '*');

        }).reduce(extend, []);

        e.ignoreTag = true;
    }

    if (els && els.length) {

        els = filter(els, e, roots, matchRoots);

    } else {

        els = [];
    }

    e.ignoreTag = undefined;
    e.ignoreClasses = undefined;
    if (matchRoots) {

        fr = hAzzle.filter(roots, function (el) {
            return el.nodeType === 1;
        });


        els = union(els, filter(fr, e, roots, matchRoots));
    }
    return els;
}

// Filter 

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
        e.classes.forEach(function (cls) {
            els = els.filter(function (el) {
                return (" " + el.className + " ").indexOf(" " + cls + " ") >= 0;
            });
        });
    }

    if (e.attrs) {

        var len = e.attrs.length,
            aarg,
            b = 0,
            attr,
            value,
            ignoreCase, name, op, val;

        for (; b < len; b++) {

            aarg = e.attrs[b];

            name = aarg.name;
            op = aarg.op;
            val = aarg.val;
            ignoreCase = aarg.ignoreCase;

            //	Filter

            els = hAzzle.filter(els, function (el) {
				
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
        }
    }

    // Process CSS pseudo selectors	

    if (e.pseudos) {

        var arg,
            pseudo,
            i = 0,
            l = e.pseudos.length;

        for (; i < l; i++) {

            arg = e.pseudos[i];

            pseudo = hAzzle.pseudos[arg.name];

            if (!pseudo) {

                hAzzle.error("no pseudo with name: " + arg.name);
            }

            if (pseudo.batch) {

                els = pseudo(els, arg.val, roots, matchRoots);

            } else {

                els = hAzzle.filter(els, function (el) {

                    return pseudo(el, arg.val);
                });
            }
        }
    }
    return els;
}


function evaluate(e, roots, matchRoots) {

    var els = [],
        ids, outerRoots, sibs, type = e.type;

    if (roots.length) {

        if (type === ' ' || type === '>') {

            // Keep track of the roots

            outerRoots = filterDescendents(roots);

            els = find(e, outerRoots, matchRoots);

            // Child Selector

            if (type === '>') {

                var i = 0,
                    el,
                    l = roots.length;

                for (; i < l; i++) {
                    el = roots[i];
                    el._hAzzle_mark = true;
                }

                els = hAzzle.filter(els, function (el) {
                    if (el.parentNode) {
                        return el.parentNode._hAzzle_mark;
                    }
                });

                // Always zero out !                

                i = 0;

                for (; i < l; i++) {
                    el = roots[i];
                    el._hAzzle_mark = undefined;
                }
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

        } else if (type === '+' ||
            type === '~' ||
            type === ',' ||
            type === '/') {

            if (e.children.length === 2) {
                sibs = evaluate(e.children[0], roots, matchRoots);
                els = evaluate(e.children[1], roots, matchRoots);
            } else {
                sibs = roots;
                els = evaluate(e.children[0], outerParents(roots), matchRoots);
            }

            if (type === ',') {

                els = union(sibs, els);

            } else if (type === '/') {

                ids = selMap(sibs, function (el) {

                    return hAzzle.attr(el, e.idref).replace(sibreg, '');
                });

                els = hAzzle.filter(els, function (el) {
                    return ~ids.indexOf(el.id);
                });

            } else if (type === '+') {

                hAzzle.each(sibs, function (el) {
                    if ((el = nextElementSibling(el))) {
                        el._hAzzle_mark = true;
                    }
                });

                els = hAzzle.filter(els, function (el) {

                    return el._hAzzle_mark;
                });

                hAzzle.each(sibs, function (el) {

                    if ((el = nextElementSibling(el))) {
                        el._hAzzle_mark = undefined;
                    }
                });

            } else if (type === '~') {

                hAzzle.each(sibs, function (el) {

                    while ((el = nextElementSibling(el)) && !el._hAzzle_mark) {

                        el._hAzzle_mark = true;
                    }
                });

                els = hAzzle.filter(els, function (el) {
                    return el._hAzzle_mark;
                });

                hAzzle.each(sibs, function (el) {

                    while ((el = nextElementSibling(el)) && el._hAzzle_mark) {

                        el._hAzzle_mark = undefined;
                    }
                });
            }
        }
    }

    return els;
}

function nextElementSibling(el) {
    return el.nextElementSibling;
}




function findRoots(els) {

    var r = [],
        i = 0,
        el,
        len = els.length;

    for (; i < len; i++) {

        el = els[i];

        while (el.parentNode) {

            el = el.parentNode;
        }

        if (r[r.length - 1] !== el) {
            r.push(el);
        }
    }
    return r;
}


/**
 * Special map function for mapping
 * through our selects.
 */

function selMap(obj, iterator, context) {

    var results = [],
        i = 0,
        l;

    if (obj === null) {

        return results;

    }

    l = obj.length;

    for (; i < l; i++) {

        results.push(iterator.call(context, obj[i], i));
    }

    return results;
}