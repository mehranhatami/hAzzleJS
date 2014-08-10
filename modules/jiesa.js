// Jiesa - selector engine
var i,

    slice = Array.prototype.slice,
    push = Array.prototype.push,
    join = Array.prototype.join,

    // Holder for querySelector / query (DOM Level 4)
    // Default: querySelector

    _query = 'querySelector',

    // Holder for querySelectorAll / queryAll (DOM Level 4)
    // Default: querySelectorAll

    _queryAll = 'querySelectorAll',

    // Expando used for attributes and the translation

    attrExpando = 'Jiesa-' + String(Math.random()).replace(/\D/g, ''),

    escaped = /'|\\/g,

    sibling = /[+~]/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    whitespace = '[^\\x00-\\xFF]',

    wrapps = '\\\\' + combineRegEx('[\\da-fA-F]{1,6}(?:(?:\\r\\n)|\\s)?', '[^\\n\\r\\f\\da-fA-F]'),
    nl = '\\n|(?:\\r\\n)|\\f',
    firstString = "'(?:[^\\n\\r\\f\\\\']|(?:\\\\" + nl + ")|(?:" + wrapps + "))*'",
    secondString = firstString.replace("'", "\""),
    string = combineRegEx(firstString, secondString),
    commaCombinators = '\\s*([+>~,\\s])\\s*',
    argReference = '{[^}]+}',
    numbstart = combineRegEx('[_a-zA-Z]', whitespace, wrapps),
    dumbchar = combineRegEx(numbstart, '[\\w-]'),
    ident = '-?' + numbstart + dumbchar + '*',
    identityFlag = '(' + combineRegEx(ident, string, argReference) + ')(?:\\s+([a-zA-Z]*))?',
    attrib = '\\[\\s*(\\.?' + ident + ')\\s*(?:([|^$*~!]?=)\\s*' + identityFlag + '\\s*)?\\]',
    pseudoClass = '[:.](' + combineRegEx(ident, argReference) + ')',
    hashes = '#' + dumbchar + '+',
    rtype = combineRegEx(ident, '\\*'),
    spaceReplace = /\s+/g,
    escapeReplace = /\\./g,

    // regEx we are using through the code

    compileExpr = {
        header: /^h\d$/i,
        inputs: /^(?:input|select|textarea|button)$/i,
        radicheck: /radio|checkbox/i,
        selectorPattern: new RegExp('^(' + combineRegEx(commaCombinators, rtype, hashes, pseudoClass, attrib) + ')(.*)$'),
        anbPattern: /(?:([+-]?\d*)n([+-]\d+)?)|((?:[+-]?\d+)|(?:odd)|(?:even))/i,
        identReg: new RegExp('^' + ident + '$'),
        hashReg: new RegExp('^' + hashes + '$'),
        typeReg: new RegExp('^' + rtype + '$'),
        containsArg: new RegExp('^' + identityFlag + '$'),
        referencedByArg: /^\s*(\S+)(?:\s+in\s+([\s\S]*))?\s*$/i,
        beginEndQuoteReplace: /^(['"])(.*)\1$/,
    },

    scope,

    // Cache for regEx

    regExCache = {},

    // Increments each time getSelector is called, used for the unique attribute value

    iCount = 0,

    // Increments every time tokenize is called (recursive calls do not increment it)

    tCount = 0,

    // Reset every time tokenize is called (recursive calls do not reset it) and incremented
    //for attribute names

    rCount,

    runningCount = 0,

    isNative = function(context, name) {
        if (!context[name]) {
            return false;
        }
        return (
            toString.call(context[name]) ===
            toString.call(document.querySelector).replace(/\bquerySelector\b/g, name)
        );
    };

/* ============================ AUTO-DETECTION =========================== */

// Auto-detect if the browsers supports the new DOM Level 4 query / queryAll
// If zero support, fallback to querySelector, and querySelectorAll

if ('Element' in window) {

    if (!isNative(Element.prototype, 'query')) {
        _query = 'query';
    }

    if (!isNative(Element.prototype, 'queryAll')) {
        _queryAll = 'queryAll';
    }
}

var Expr = {

        /* ============================ INTERNAL =========================== */

        'attr': function(el, attr, operator, value, flags, ref) {
            flags = (flags || '').toLowerCase();
            value = value || '';
            var property = attr[0] == '.' ? attr.slice(1) : undefined,
                result = property ? el[property] : getAttr(el, attr) || '',
                check = value[0] == '{' ? ref[value.slice(1, -1)] : value.replace(compileExpr.beginEndQuoteReplace, '$2'), // Strip out beginning and ending quotes if present
                regProp = check + '-' + flags,
                reg = hAzzle.isRegExp(check) ? check : flags.indexOf('r') > -1 ?
                (regExCache[regProp] || (regExCache[regProp] = new RegExp(check, flags.replace('r', '')))) : undefined;

            if (flags.indexOf('i') > -1 && !reg) {
                result = result.toUpperCase();
                check = check.toUpperCase();
            }
            return operator === '=' ? (reg ? reg.test(result) : result === check) :
                operator === '!=' ? (reg ? !reg.test(result) : result !== check) :
                operator === '^=' ? !result.indexOf(check) :
                operator === '*=' ? reg ? reg.test(result) : result.indexOf(check) >= 0 :
                operator === '$=' ? check && result.slice(-check.length) == check :
                operator === '~=' ? (' ' + result.replace(spaceReplace, ' ') + ' ').indexOf(' ' + check + ' ') > -1 :
                operator === '|=' ? result == check || !result.indexOf(check + '-') :
                property in el;
        },

        'tru': function() {
            return true;
        },

        /* ============================ GLOBAL =========================== */

        'CONTAINS': function(el, args, p, references) {
            args = compileExpr.containsArg.exec(args);
            return Expr.attr(el, '.textContent', '*=', args[1], args[2], references);
        },

        // Same as the 'has' pseudo - what is the point?

        'WITH': function(el, args, p, references) {
            return quickQuery(tokenize(args, el, references), el.ownerDocument);
        },

        'HAS': function(el, args, p, references) {

            return quickQuery(tokenize(args, el, references), el.ownerDocument);
        },

        'ANY-LINK': function(el) {
            var id = el.id;
            if (id) {
                return quickQuery("a[href$='#" + id + "']", el.ownerDocument);
            }
        }
    },
    transformers = {

        'LOCAL-LINK': function(args, attr, attrValue, p, context) {
            var pathnameParts, selector,
                ctx = context.ownerDocument || context,
                pathname = ctx.location.pathname;

            pathname = fakePath ? pathname : pathname.slice(1);

            if (!args) {

                selector = "a[.protocol='" + ctx.location.protocol + "'][.host='" + ctx.location.host + "'][.pathname='" + pathname + "']";

            } else {

                //convert the string to a number
                args -= fakePath ? -1 : 0;
                pathnameParts = pathname.split('/');
                if (pathnameParts.length >= args) {
                    pathname = pathnameParts.slice(0, args).join('/');
                    selector = "a[.host='" + ctx.location.host + "'][.pathname^='" + pathname + "']";
                }
            }

            if (selector) {

                filter(Kenny(selector, ctx), attr, attrValue, Expr.tru);
            }
        },

        'NOT': function(args, attr, attrValue, p, context, references) {
            args = filter(Kenny(args, context, references), attr, attrValue, Expr.tru);
            return ':not(' + args + ')';
        },

        'REFERENCED-BY': function(args, attr, attrValue, p, context, references) {
            var element, refEl,
                found = compileExpr.referencedByArg.match(args),
                ctx = context.ownerDocument || context,
                referenceAttr = found[1],
                elements = Kenny(':matches(' + (found[2] || '*') + ')[' + referenceAttr + ']', ctx, references),
                l = elements.length;
            while ((element = elements[--l])) {
                refEl = grabID(referenceAttr[0] == '.' ? element[referenceAttr.slice(1)] : getAttr(element, referenceAttr), ctx);
                if (refEl) {
                    refEl.setAttribute(attr, attrValue);
                }
            }
        },

        'MATCHES': function(args, attr, attrValue, p, context, references) {
            filter(Kenny(args, context.ownerDocument || context, references), attr, attrValue, Expr.tru);
        }
    },

    fakePath = (function() {
        var a = document.createElement('a');
        a.href = '/';
        return a.pathname;
    }()),

    Kenny = function(selector, context, references) {

        var ctx, results = [],
            match, m, elem,
            isDoc = isDocument(context);

        if (!(references || isDoc || isElement(context))) {
            references = context;
            context = document;
            isDoc = 1;
        }

        selector = hAzzle.trim(selector);

        if (isDoc && hAzzle.documentIsHTML) {

            // Do a quick look-up         

            if ((match = rquickExpr.exec(selector))) {

                if ((m = match[1])) {
                    if (context.nodeType === 9) {
                        elem = context.getElementById(m);
                        if (elem && elem.parentNode) {
                            if (elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        } else {
                            return results;
                        }
                    } else {

                        // Context is not a document
                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            hAzzle.contains(context, elem) && elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    }
                } else if (match[2]) {
                    push.apply(results, context.getElementsByTagName(selector));
                    return results;
                } else if ((m = match[3])) {
                    push.apply(results, context.getElementsByClassName(m));
                    return results;
                }
            }
        }

        // Set context

        ctx = context.ownerDocument || context;

        // A dirty trick here to get it faster - split selectors by comma if it's exists.
        // Comma separated selectors. E.g hAzzle('p, a');
        // Unique result, e.g "ul id=foo class=foo" should not appear two times.

        if (hAzzle.inArray(selector, ',') !== -1 && (m = selector.split(','))) {
            var i = 0,
                l = m.length;
            for (; i < l; i++) {
                hAzzle.each(Kenny(m[i]), function(el) {
                    if (!hAzzle.contains(results, el)) {
                        results.push(el);
                    }
                });
            }

            return results;
        }

        // Everything else

        return slice.call(quickQueryAll(tokenize(selector, context, references), ctx));
    },

    anb = function(str) {
        //remove all spaces and parse the string
        var match = str.replace(spaceReplace, '')
            .match(compileExpr.anbPattern),
            a = match[1],
            n = !match[3],
            b = n ? match[2] || 0 : match[3];

        if (b == 'even') {
            a = 2;
            b = 0;
        } else if (b == 'odd') {
            a = 2;
            b = 1;
        } else if (a == '+' || a == '-') {
            a += 1;
        } else if (!a && !n) {
            a = 0;
        } else if (!a) {
            a = 1;
        }

        // Return an iterator

        return (function(a, b) {
            var y,
                posSlope = a >= 0,

                // If no slope or the y-intercept >= 0 with a positive slope start x at 0
                // otherwise start x at the x-intercept rounded

                startX = !a || (b >= 0 && posSlope) ? 0 : posSlope ? Math.ceil(-b / a) : Math.floor(-b / a),
                x = startX;

            return {
                next: function() {

                    // For positive slopes increment x, otherwise decrement

                    return x < 0 || (!a && y == b) ? -1 : (y = a * (posSlope ? x++ : x--) + b);

                },
                'reset': function() {
                    x = startX;
                    y = undefined;
                },

                'matches': function(y) {
                    if (!a) {
                        return y == b;
                    }
                    var x = (y - b) / a;

                    //Check that x is a whole number

                    return x >= 0 && x == (x | 0);
                }
            };
        }(a - 0, b - 1)); // Convert a and b to a number (if string), subtract 1 from y-intercept (b) for 0-based indices
    },

    tokenize = function(selector, context, references) {

        if (!selector) {
            return;
        }

        var cScope, group, str, n, j, k, match, args, pseudo, filterFn, ctx,
            wholeSelector = '',
            lastMatchCombinator = '*';

        if (!(references || isDocument(context) || isElement(context))) {
            references = context;
            context = document;
        }

        group = cScope = getSelector(context) + ' ';

        ctx = context.ownerDocument || context;

        //if no other instances of Kenny are in progress

        if (!(runningCount++)) {

            rCount = 0;
            tCount++;
            scope = cScope;
        }

        selector = selector.replace(/^\s*--/, '');

        // Mehran! Find an better solution then try / catch

        try {
            while ((match = compileExpr.selectorPattern.exec(selector))) {

                selector = match[8] || '';

                // Combinator or comma

                if (match[2]) {

                    if (match[2] == ',') {

                        wholeSelector = wholeSelector + group + ',';
                        group = cScope;

                    } else {

                        group += match[2];
                    }

                    lastMatchCombinator = '*';

                } else {

                    // Pseudo

                    if (match[3] && match[0][0] == ':') {

                        pseudo = match[3];

                        if (pseudo[0] == '{') {

                            filterFn = references[pseudo.slice(1, -1)];

                        } else {

                            pseudo = pseudo.toUpperCase();
                            filterFn = Expr[pseudo];
                        }

                        // If there is an opening parents, get everything inside the parentes

                        if (selector[0] == '(') {
                            // Locate the position of the closing parents
                            selector = selector.substr(1).trim();
                            // Blank out any escaped characters
                            str = selector.replace(escapeReplace, '  ');
                            n = 1;

                            // If the args start with a quote, search for the closing parents after the closing quote

                            j = selector[0] == "\"" || selector[0] == "'" ? selector.indexOf(selector[0], 1) : 0;

                            while (n) {

                                k = str.indexOf(')', ++j);
                                j = str.indexOf('(', j);
                                if (k > j && j > 0) {
                                    n++;
                                } else {

                                    n--;
                                    j = k;
                                }
                            }

                            if (j < 0) {
                                break;
                            }

                            args = selector.substr(0, j).trim();
                            selector = selector.substr(j + 1);
                        }

                        if (filterFn) {

                            group = filter(quickQueryAll(group + lastMatchCombinator, ctx), attrExpando + rCount++, tCount, filterFn, [args, pseudo, references]);

                        } else if (transformers[pseudo]) {
                            n = rCount++;
                            group += transformers[pseudo].apply(null, [args, attrExpando + n, tCount, pseudo, context, references]) || "[" + attrExpando + n + "='" + tCount + "']";
                        } else {
                            group += match[1];

                            if (args) {
                                group += "(" + args + ")";
                            }
                        }

                        args = 0;

                    } else if (match[7] || (match[4] && match[4][0] == '.') || (match[6] && match[6][0] == '{')) {

                        group += filter(ctx.queryAll(group + lastMatchCombinator), attrExpando + rCount++, tCount, Expr.attr, [match[4], match[5], match[6], match[7], references]);

                    } else if (match[5] == '!=' ||
                        match[5] == '!==') {

                        group += ':not([' + match[4] + '=' + match[6] + '])';

                    } else {

                        group += match[1];
                    }

                    lastMatchCombinator = '';
                }
            }

            return hAzzle.trim(wholeSelector + group + selector);

        } finally {

            runningCount--;
        }
    },

    getSelector = function(el) {

        if (!el || isDocument(el)) {
            return '';
        }

        if (el.id) {

            return '#' + el.id;
        }

        var attr = attrExpando + 'c',
            value = getAttr(el, attr);
        if (!value) {

            value = iCount++;
            el.setAttribute(attr, value);
        }

        return '[' + attr + "='" + value + "']";
    };

    /* ============================ UTILITY METHODS =========================== */

    // Combine regExes

    function combineRegEx() {
        return "(?:(?:" + join.call(arguments, ")|(?:") + "))";
    }

   function quickQueryAll(selector, context) {

        if (!selector || !context) {
            return [];
        }
        var old = true,
            nid = attrExpando;

        if (context !== document) {

            // Thanks to Andrew Dupont for the technique

            old = context.getAttribute('id');

            if (old) {

                nid = old.replace(escaped, '\\$&');

            } else {

                context.setAttribute('id', nid);
            }

            nid = "[id='" + nid + "'] ";

            context = sibling.test(selector) ? context.parentElement : context;
            selector = nid + selector.split(',').join(',' + nid);
        }

        try {

            return context[_queryAll](selector);

        } finally {

            if (!old) {

                context.removeAttribute('id');
            }
        }
    }

    function quickQuery(selector, context) {

        if (!selector || !context) {
            return [];
        }
        return context[_query](selector);
    }
	
    function filter(elems, attr, attrValue, filterFn, args) {

        if (!elems) {
            return '';
        }

        // Can't calculate length if 'elems' don't exist

        var i = elems.length;

        args = args || [];

        while (i--) {

            if (filterFn.apply(undefined, [elems[i]].concat(args))) {

                elems[i].setAttribute(attr, attrValue);
            }
        }

        // If all of the elems matched the filter return empty string

        return "[" + attr + "='" + attrValue + "']";
    }
	
    function isElement (o) {
        return o && o.nodeType === 1;
    }

    function  isDocument(o) {
        return o && o.nodeType === 9;
    }

    function extend(pseudo, type, fn) {

        // Pseudo are allways upperCase
        // Except for internals

        pseudo = pseudo.toUpperCase() || null;

        // Check that the pseudo matches the css pseudo pattern, is 
        // not already in use and that fn is a function

        if (pseudo && compileExpr.identReg.test(pseudo) &&
            !Expr[pseudo] && !transformers[pseudo] && typeof(fn) === 'function') {
            type[pseudo] = fn;
            return 1;
        }
        return 0;
    }

    function getAttr(elem, attr) {

        if (!elem) {
            return '';
        }

        // Set document vars if needed

        if ((elem.ownerDocument || elem) !== document) {
            hAzzle.setDocument(elem);
        }

        // Performance speed-up

        if (attr === 'class') {
            // className is '' when non-existent
            // getAttribute('class') is null

            attr = elem.className;

            if (attr === '' && elem.getAttribute('class') === null) {
                attr = null;
            }
            return attr;
        }
        if (attr === 'href') {
            return elem.getAttribute('href', 2);
        }
        if (attr === 'title') {
            // getAttribute('title') can be '' when non-existent sometimes?
            return elem.getAttribute('title') || null;
        }
        if (attr === 'style') {
            return elem.style.cssText || '';
        }
        var val;
        return hAzzle.documentIsHTML ?
            elem.getAttribute(attr) :
            (val = elem.getAttributeNode(attr)) && val.specified ?
            val.value :
            null;
    }

    /* ============================ FEATURE / BUG DETECTION =========================== */

    // Avoid getElementById bug
    // Support: IE<10
    // Check if getElementById returns elements by name
    // The broken getElementById methods don't pick up programatically-set names,
    // so use a roundabout getElementsByName test

    var grabID = Jiesa.has['bug-GEBI'] ? function(id, context) {
        var elem = null;
        if (hAzzle.documentIsHTML || context.nodeType !== 9) {
            return byIdRaw(id, context.getElementsByTagName('*'));
        }
        if ((elem = context.getElementById(id)) &&
            elem.name == id && context.getElementsByName) {
            return byIdRaw(id, context.getElementsByName(id));
        }
        return elem;
    } :
    function(id, context) {
        var m = context.getElementById(id);
        return m && m.parentNode ? [m] : [];
    };

    function byIdRaw (id, elements) {
        var i = -1,
            element = null;
        while ((element = elements[++i])) {
            if (getAttr(element, 'id') === id) {
                break;
            }
        }
        return element;
    };

/* ============================ UTILITY METHODS =========================== */

/**
 * The nth-match and nth-last-match selectors work similar to the match and nth-child/nth-last-child pseudo
 * selectors by selecting the nth element which matches the sub-selector. The grammar for the
 * argument works by specifying an anb value followed by whitespace, the word "of", whitespace and a sub-selector.
 *
 * EXAMPLES:
 * ---------
 *
 * Select the odd elements which match the selector "div > mehran.js":
 *
 * hAzzle(":nth-match(odd of div > mehran.js)");
 *
 * Select the "4n-2" last elements which match the selector "footer :any-link":
 *
 * hAzzle(":nth-last-match(4n-2 of footer :any-link)");
 */

transformers['NTH-MATCH'] = transformers['NTH-LAST-MATCH'] = function(args, attr, attrValue, pseudo, context, references) {
    var element,
        ofPos = args.indexOf('of'),
        anbIterator = anb(args.substr(0, ofPos)),
        elements = Kenny(args.substr(ofPos + 2), (context.ownerDocument || context), references),
        l = elements.length - 1,
        nthMatch = pseudo[4] !== 'L';
    while ((element = elements[nthMatch ? anbIterator.next() : l - anbIterator.next()])) {
        element.setAttribute(attr, attrValue);
    }
};

/* ============================ TRANSFORMERS =========================== */

/**
 * The scope pseudo selector matches the context element that was passed into hAzzle.find()() or
 * hAzzle.tokenize(). When no context element is provided, scope is the equivalent of :root.
 *
 * EXAMPLE:
 * --------
 *
 * Select even div elements that are descendants of the provided context element:
 *
 * hAzzle(":nth-match(even of :scope div)", document.getElementsByTagName("footer")[0]);
 *
 *
 * NOTE!! The name on the 'scope' selector have changed from draft to draft, and still
 * we can't be sure what name to be used. It has been known as 'SCOPE', but in
 * the new DOM Level 4 drafts, it named 'SCOPED' and used in the
 * query() and queryAll() that will replace querySelectorAll():

 *
 * For now hAzzle are supporting both names
 */
transformers.scoped = transformers.scope = function() {
    return scope;
};


/* ============================ PLUGIN METHODS =========================== */

hAzzle.addFilter = function(pseudo, fn) {
    return typeof fn === 'function' && extend(pseudo, Expr, fn);
};

hAzzle.addTransformer = function(pseudo, fn) {
    return typeof fn === 'function' && extend(pseudo, transformers, fn);
};

/* ============================ GLOBAL =========================== */

// Expose

hAzzle.Expr = Expr;
hAzzle.find = Kenny;
hAzzle.anb = anb;
hAzzle.tokenize = tokenize;
hAzzle.getSelector = getSelector;