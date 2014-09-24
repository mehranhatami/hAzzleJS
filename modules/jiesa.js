// Jiesa - selector engine
var join = Array.prototype.join,
    push = Array.prototype.push,
    funcToString = Function.prototype.toString,

    // Holder for querySelector / query (DOM Level 4)
    // Default: querySelector

    _query = 'querySelector',

    // Holder for querySelectorAll / queryAll (DOM Level 4)
    // Default: querySelectorAll

    _queryAll = 'querySelectorAll',

    // Expando used for attributes and the translation

    attrExpando = 'Jiesa-' + 1 * hAzzle.now(),

    escaped = /'|\\/g,

    sibling = /[+~]/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    propsExpr = /\.|\[|\]|"|'/,

    // IF you remove this one Mehran, you break this things:
    //
    //  dom.js  module
    //  event.js module  

    eoeglnfl = /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i,

    // Combine regExes

    combineRegEx = function combineRegEx() {
        return '(?:(?:' + join.call(arguments, ')|(?:') + '))';
    },
    jwhitespace = '[^\\x00-\\xFF]',
    jwrapps = '\\\\' + combineRegEx('[\\da-fA-F]{1,6}(?:(?:\\r\\n)|\\s)?', '[^\\n\\r\\f\\da-fA-F]'),
    jnewLine = '\\n|(?:\\r\\n)|\\f',
    jfirstString = '\'(?:[^\\n\\r\\f\\\\\']|(?:\\\\' + jnewLine + ')|(?:' + jwrapps + '))*\'',
    jsecondString = jfirstString.replace('\'', '"'),
    jcombinedString = combineRegEx(jfirstString, jsecondString),
    jcommaCombinators = '\\s*([+>~,\\s])\\s*',
    jargReference = '{[^}]+}',
    jnumbstart = combineRegEx('[_a-zA-Z]', jwhitespace, jwrapps),
    jdumbchar = combineRegEx(jnumbstart, '[\\w-]'),
    jidentifier = '-?' + jnumbstart + jdumbchar + '*',
    jidentityFlag = '(' + combineRegEx(jidentifier, jcombinedString, jargReference) + ')(?:\\s+([a-zA-Z]*))?',
    jattributeQuotes = '\\[\\s*(\\.?' + jidentifier + ')\\s*(?:([|^$*~!]?=)\\s*' + jidentityFlag + '\\s*)?\\]',
    jkfpseudo = '[:.](' + combineRegEx(jidentifier, jargReference) + ')',
    jhashes = '#' + jdumbchar + '+',
    jrtype = combineRegEx(jidentifier, '\\*'),
    jspaceReplace = /\s+/g,
    jstripReplace = /^\s*--/,
    jescapeReplace = /\\./g,

    // regEx we are using through the code

    compileExpr = {
        regexPattern: new RegExp('^(' + combineRegEx(jcommaCombinators, jrtype, jhashes, jkfpseudo, jattributeQuotes) + ')(.*)$'),
        anbPattern: /(?:([+-]?\d*)n([+-]\d+)?)|((?:[+-]?\d+)|(?:odd)|(?:even)|(?:first))/i,
        identPattern: new RegExp('^' + jidentifier + '$'),
        containsArg: new RegExp('^' + jidentityFlag + '$'),
        referencedByArg: /^\s*(\S+)(?:\s+in\s+([\s\S]*))?\s*$/i,
        beginEndQuoteReplace: /^(['"])(.*)\1$/,
    },

    tokenCache = hAzzle.createCache(),

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

    attributeGetters = {

        'class': function(elem, attr) {
            attr = elem.className;

            if (attr === '' && elem.getAttribute('class') === null) {
                attr = null;
            }
            return attr;
        },
        'href': function(elem) {
            return elem.getAttribute('href', 2);
        },
        'title': function(elem) {
            // getAttribute('title') can be '' when non-existent sometimes?
            return elem.getAttribute('title') || null;
        }

    },

    isNative = function(context, name) {
        if (!context[name]) {
            return false;
        }
        return (
            funcToString.call(context[name]) ===
            funcToString.call(document.querySelector).replace(/\bquerySelector\b/g, name)
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

function markElements(elems, attr, attrValue, filterFn, args) {

    if (!elems) {
        return '';
    }

    // Can't calculate length if 'elems' don't exist

    var i = elems.length;

    args = args || [];

    function filter(i) {
        var params = [elems[i]],
            info = {
                elems: elems,
                currentIndex: i
            };
        push.apply(params, args);
        return filterFn.apply(info, params);
    }

    while (i--) {
        if (filter(i)) {
            elems[i].setAttribute(attr, attrValue);
        }
    }

    // If all of the elems matched the filter return empty string

    return '[' + attr + '=\'' + attrValue + '\']';
}

function objValue(obj, props) {
    var keys = props.split(propsExpr).filter(function(value) {
            return value !== '';
        }),
        current = obj,
        key,
        i = 0,
        len = keys.length;

    for (; i < len; i += 1) {
        key = keys[i];
        if (current.hasOwnProperty(key)) {
            current = current[key];
        } else {
            return '';
        }
    }

    return current;
}

// Create a fake path for comparison

var fakePath = (function() {
        var path,
            a = document.createElement('a');
        a.href = '/';

        path = a.pathname;

        // release memory in IE
        a = null;

        return path;

    }()),

    Expr = {

        'filter': {},

        /* ============================ INTERNAL =========================== */

        'attr': function(el, attr, operator, value, flags, ref) {
            flags = (flags || '').toLowerCase();
            value = value || '';

            var property = attr[0] == '.' ? attr.slice(1) : undefined,
                result = property ? el[property] : getAttr(el, attr) || '',

                // Strip out beginning and ending quotes if present

                check = value[0] == '{' ? objValue(ref, value.slice(1, -1)) :
                value.replace(compileExpr.beginEndQuoteReplace, '$2'),

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
                operator === '!*=' ? reg ? reg.test(result) : result.indexOf(check) === 0 :
                operator === '$=' ? check && result.slice(-check.length) === check :
                operator === '!$=' ? check && result.slice(-check.length) !== check :
                operator === '~=' ? (' ' + result.replace(jspaceReplace, ' ') + ' ').indexOf(' ' + check + ' ') > -1 :
                operator === '!~=' ? (' ' + result.replace(jspaceReplace, ' ') + ' ').indexOf(' ' + check + ' ') === -1 :
                operator === '|=' ? result == check || !result.indexOf(check + '-') :
                operator === '!|=' ? result == check || result.indexOf(check + '-') :
                property in el;
        },

        /* ============================ GLOBAL =========================== */

        'CONTAINS': function(el, args, p, arrfunc) {
            args = compileExpr.containsArg.exec(args);
            return Expr.attr(el, '.textContent', '*=', args[1], args[2], arrfunc);
        },

        // Same as the 'has' pseudo - what is the point?

        'WITH': function(el, args, p, arrfunc) {
            return quickQuery(tokenize(args, el, arrfunc), el.ownerDocument);
        },

        'HAS': function(el, args, p, arrfunc) {
            return quickQuery(tokenize(args, el, arrfunc), el.ownerDocument);
        },

        'ANY-LINK': function(el) {
            var id = el.id;
            if (id) {
                return quickQuery('a[href$=\'#' + id + '\']', el.ownerDocument);
            }
        },

        'EVEN': function() {
            return !Boolean(this.currentIndex % 2);
        },

        'ODD': function() {
            return Boolean(this.currentIndex % 2);
        },

        'EQ': function(el, args) {
            return (hAzzle.isNumeric(args) && parseInt(args, 10) === this.currentIndex);
        },

        'FIRST': function() {
            return (this.currentIndex === 0);
        },

        'LAST': function() {
            var info = this;
            return (info.currentIndex === info.elems.length - 1);
        },

        'GT': function(el, args) {
            var info = this,
                ind = parseInt(args, 10),
                len = info.elems.length;

            return (info.currentIndex > (len + ind) % len);
        },

        'LT': function(el, args) {
            var info = this,
                ind = parseInt(args, 10),
                len = info.elems.length;

            return (info.currentIndex < (len + ind) % len);
        }
    },
    transformers = {

        'LOCAL-LINK': function(args, attr, attrValue, p, context) {
            var pathnameParts, selector,
                ctx = context.ownerDocument || context,
                pathname = ctx.location.pathname;

            pathname = fakePath ? pathname : pathname.slice(1);

            if (!args) {

                selector = 'a[.protocol=\'' + ctx.location.protocol + '\'][.host=\'' + ctx.location.host + '\'][.pathname=\'' + pathname + '\']';

            } else {

                //convert the string to a number
                args -= fakePath ? -1 : 0;
                pathnameParts = pathname.split('/');
                if (pathnameParts.length >= args) {
                    pathname = pathnameParts.slice(0, args).join('/');
                    selector = 'a[.host=\'' + ctx.location.host + '\'][.pathname^=\'' + pathname + '\']';
                }
            }

            if (selector) {

                markElements(JiesaFind(selector, ctx), attr, attrValue, returnTrue);
            }
        },

        'NOT': function(args, attr, attrValue, p, context, arrfunc) {
            return ':not(' + markElements(JiesaFind(args, context, arrfunc), attr, attrValue, returnTrue) + ')';
        },

        'REFERENCED-BY': function(args, attr, attrValue, p, context, arrfunc) {
            var element, refEl, found = compileExpr.referencedByArg.match(args),
                ctx = context.ownerDocument || context,
                referenceAttr = found[1],
                elements = JiesaFind(':matches(' + (found[2] || '*') + ')[' + referenceAttr + ']', ctx, arrfunc),
                l = elements.length;

            while ((element = elements[--l])) {

                refEl = grabID(referenceAttr[0] == '.' ?
                    element[referenceAttr.slice(1)] :
                    getAttr(element, referenceAttr), ctx);

                if (refEl) {
                    refEl.setAttribute(attr, attrValue);
                }

            }
        },

        /**
         * The matches pseudo selector selects elements which meet the sub-selector. This can be especially helpful
         * in simplifying complex selectors.
         *
         * Example:
         * -------
         *
         * div > p:nth-child(2n+1), div > a:nth-child(2n+1), div > h1:nth-child(2n+1)
         *
         * can be simplified too:
         *
         * div > :matches(p, a, h1):nth-child(2n+1)
         *
         */

        'MATCHES': function(args, attr, attrValue, p, context, arrfunc) {
            markElements(JiesaFind(args, context.ownerDocument || context, arrfunc), attr, attrValue, returnTrue);
        }
    },

    /*
     * JiesaFind
     *
     * @param {String} selector
     * @param {Array|Object|String} context
     * @param {Array|Function|Object} arrfunc
     * @return {Array|hAzzle}
     *
     * The 'arrfunc' parameter can be used to create ad-hoc pseudo selectors which behave as filters.
     * Additionally, some selectors can utilize arrfunc to make element selection even more
     * powerful (attribute/property selectors, contains).
     *
     * 'arrfunc' are defined within an object or an array, and elements within are referenced by their
     * associated key. Keys can be any number of character but cannot contain a closing curly brace }.
     *
     */

    JiesaFind = function(selector, context, arrfunc) {

        var found, results = [],
            m, elem, isDoc = isDocument(context),
            scopedContext = context;

        if (!selector || typeof selector !== 'string') {
            return results;
        }

        if (!(arrfunc || isDoc || isElement(context))) {
            arrfunc = context;
            context = document;
            isDoc = 1;
        }

        // Set context

        context = context.ownerDocument || context;

        if (isDoc && hAzzle.documentIsHTML) {

            // Do a quick look-up         

            if (context.nodeType !== 11 && (found = rquickExpr.exec(selector))) {

                if ((m = found[1])) {
                    if (context.nodeType === 9) {
                        elem = context.getElementById(m);
                        if (elem && elem.parentNode) {
                            if (elem.id === m) {
                                return [elem];
                            }
                        } else {
                            return [];
                        }
                    } else {

                        // context is not a document
                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            hAzzle.contains(context, elem) && elem.id === m) {
                            return [elem];
                        }
                    }
                } else if (found[2]) {
                    return context.getElementsByTagName(selector);
                } else if ((m = found[3])) {
                    return context.getElementsByClassName(m);
                }
            }
        }

        // Everything else

        var token = tokenize(selector, context, arrfunc, scopedContext);

        return context.nodeType === 9 && token ?
            quickQueryAll(token, context) : [];
    },

    /*
     * anb
     *
     * @param {String} str
     * @return {Array|hAzzle}
     *
     */

    anb = function(str) {
        //remove all spaces and parse the string
        var match = str.replace(jspaceReplace, '')
            .match(compileExpr.anbPattern),
            a = match[1],
            n = !match[3],
            b = n ? match[2] || 0 : match[3];

        if (b == 'even') {
            a = 2;
            b = 0;
        }

        if (b == 'odd') {
            a = 2;
            b = 1;
        }

        if (a == '+' || a == '-') {
            a += 1;
        }

        if (!a && !n) {
            a = 0;
        }

        if (!a) {
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
                'next': function() {
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


    /*
     * Tokenize
     *
     * @param {String} str
     * @return {Array|hAzzle}
     *
     * The 'tokenize' function, tokenize the queries in the following
     * order:
     *
     * 1 - whole match
     * 2 - combinator/comma
     * 3 - class/pseudo
     * 4 - attribute name
     * 5 - attribute operator
     * 6 - attribute value
     * 7 - attribute flags
     * 8 - right context
     *
     */
    tokenize = function(selector, context, arrfunc, scopedContext) {

        if (!selector || typeof selector !== 'string') {
            return [];
        }

        var cScope, group, str, n, j, k, found, args, pseudo, filterFn, ctx,
            wholeSelector = '',
            lastMatchCombinator = '*',
            cached,
            contextCached,
            baseSelector = selector + '';

        if (!(arrfunc || isDocument(context) || isElement(context))) {
            arrfunc = context;
            context = document;
        }
        if (scopedContext === undefined) {
            scopedContext = context;
        }

        // New caching approach
        contextCached = tokenCache.val(scopedContext);
        if (contextCached) {
            if ((cached = contextCached[baseSelector])) {
                return cached;
            }
        }

        group = cScope = getSelector(context) + ' ';

        ctx = context.ownerDocument || context;

        //if no other instances of JiesaFind are in progress

        if (!(runningCount++)) {

            rCount = 0;
            tCount++;
            scope = cScope;
        }

        selector = selector.replace(jstripReplace, '');

        // Mehran! Find an better solution then try / catch

        try {
            while ((found = compileExpr.regexPattern.exec(selector))) {

                selector = found[8] || '';

                // Combinator or comma

                if (found[2]) {

                    if (found[2] == ',') {

                        wholeSelector = wholeSelector + group + ',';
                        group = cScope;

                    } else {

                        group += found[2];
                    }

                    lastMatchCombinator = '*';

                } else {

                    // Pseudo

                    if (found[3] && found[0][0] == ':') {

                        pseudo = found[3];

                        if (pseudo[0] == '{') {

                            filterFn = arrfunc[pseudo.slice(1, -1)];

                        } else {

                            pseudo = pseudo.toUpperCase();
                            filterFn = Expr[pseudo];
                        }

                        // If there is an opening parents, get everything inside the parentes

                        if (selector[0] == '(') {
                            // Locate the position of the closing parents
                            selector = hAzzle.trim(selector.slice(1));
                            // Blank out any escaped characters
                            str = selector.replace(jescapeReplace, '  ');
                            n = 1;

                            // If the args start with a quote, search for the closing parents after the closing quote

                            j = selector[0] == '"' || selector[0] == '\'' ? selector.indexOf(selector[0], 1) : 0;

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

                            args = hAzzle.trim(selector.slice(0, j));
                            if (args && args[0] == '{') {
                                args = objValue(arrfunc, args.slice(1, -1));
                            }
                            selector = selector.substr(j + 1);
                        }

                        if (filterFn) {

                            group = markElements(quickQueryAll(group + lastMatchCombinator, ctx), attrExpando + rCount++, tCount, filterFn, [args, pseudo, arrfunc]);


                        } else if (transformers[pseudo]) {
                            n = rCount++;
                            group += transformers[pseudo].apply(null, [args, attrExpando + n, tCount, pseudo, context, arrfunc]) || '[' + attrExpando + n + '=\'' + tCount + '\']';
                        } else {
                            group += found[1];

                            if (args) {
                                group += '(' + args + ')';
                            }
                        }

                        args = 0;

                    } else if (found[7] || (found[4] && found[4][0] == '.') || (found[6] && found[6][0] == '{')) {

                        group += markElements(ctx.queryAll(group + lastMatchCombinator), attrExpando + rCount++, tCount, Expr.attr, [found[4], found[5], found[6], found[7], arrfunc]);

                    } else if (found[5] == '!=' ||
                        found[5] == '!==') {

                        group += ':not([' + found[4] + '=' + found[6] + '])';

                    } else {

                        group += found[1];
                    }

                    lastMatchCombinator = '';
                }
            }

            // New caching approach

            cached = hAzzle.trim(wholeSelector + group + selector);

            if (contextCached) {
                contextCached[baseSelector] = cached;
            } else {
                contextCached = {};
                contextCached[baseSelector] = cached;
                tokenCache.cache(scopedContext, contextCached);
            }

            return cached;
        } finally {

            runningCount--;
        }
    },

    /**
     * The 'getSelector' function takes an element and returns a string value for a
     * simple CSS selector which uniquely identifies that element.
     *
     * @param {Object|Array|String} el
     * @return {Object|hAzzle}
     */

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

        return '[' + attr + '=\'' + value + '\']';
    };

/* ============================ UTILITY METHODS =========================== */

// Grab childnodes

function grab(context, tag) {
    var ret = context.getElementsByTagName(tag || '*');
    return tag === undefined || tag && hAzzle.nodeName(context, tag) ?
        hAzzle.merge([context], ret) :
        ret;
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

        nid = '[id=\'' + nid + '\'] ';

        context = sibling.test(selector) ? context.parentElement : context;
        selector = nid + selector.split(',').join(',' + nid);
    }

    try {

        return context.nodeType === 9 ?
            context[_queryAll](selector + '') : [];

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
    return context[_query](selector + '');
}

function isElement(o) {
    return o && o.nodeType === 1;
}

function isDocument(o) {
    return o && o.nodeType === 9;
}

function extend(pseudo, type, fn) {

    // Pseudo are allways upperCase
    // Except for internals

    pseudo = pseudo.toUpperCase() || null;

    // Check that the pseudo matches the css pseudo pattern, is 
    // not already in use and that fn is a function

    if (pseudo && compileExpr.identPattern.test(pseudo) &&
        !Expr[pseudo] && !transformers[pseudo] && typeof(fn) === 'function') {
        type[pseudo] = fn;
        return 1;
    }
    return 0;
}

function getAttr(elem, attr) {
    // Set document vars if needed

    if ((elem.ownerDocument || elem) !== document) {
        hAzzle.setDocument(elem);
    }
    if (features.isHTMLDocument) {
        var method = attributeGetters[attr];
        if (method) {
            return method.call(elem, elem, attr);
        }
        var attributeNode = node.getAttributeNode(attr);
        return (attributeNode) ? attributeNode.nodeValue : null;
    } else {
        var method = attributeGetters[attr];
        return (method) ? method.call(elem, elem, attr) : elem.getAttribute(attr);
    }
}

/* ============================ FEATURE / BUG DETECTION =========================== */

// Avoid getElementById bug
// Support: IE<10
// Check if getElementById returns elements by name
// The broken getElementById methods don't pick up programatically-set names,
// so use a roundabout getElementsByName test

var grabID = hAzzle.features['bug-GEBI'] ? function(id, context) {
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

function byIdRaw(id, elements) {
    var i = -1,
        element = null;
    while ((element = elements[++i])) {
        if (getAttr(element, 'id') === id) {
            break;
        }
    }
    return element;
}

function returnTrue() {
    return true;
}

/* ============================ UTILITY METHODS =========================== */

/**
 * The nth-match and nth-last-match selectors work similar to the match and nth-child/nth-last-child pseudo
 * selectors by selecting the nth element which matches the sub-selector. The grammar for the
 * argument works by specifying an anb value followed by jwhitespace, the word "of", jwhitespace and a sub-selector.
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

transformers['NTH-MATCH'] = transformers['NTH-LAST-MATCH'] = function(args, attr, attrValue, pseudo, context, arrfunc) {
    var element,
        ofPos = args.indexOf('of'),
        anbIterator = anb(args.substr(0, ofPos)),
        elements = JiesaFind(args.substr(ofPos + 2), (context.ownerDocument || context), arrfunc),
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



// Expose

hAzzle.Expr = Expr;
hAzzle.find = JiesaFind;
hAzzle.grab = grab;
hAzzle.anb = anb;
hAzzle.tokenize = tokenize;
hAzzle.getSelector = getSelector;