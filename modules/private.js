/**
 * PRIVATE USE - NOT FOR PUBLIC!!!
 *
 * Experimental selector engine, supports CL4
 *
 * Copyright (c) 2014 - Kenny Flashlight
 *
 */
var i,

    slice = Array.prototype.slice,
    push = Array.prototype.push,
    join = Array.prototype.join,

    // Expando used for attributes
    // Instance-specific data

    attrExpando = 'Jiesa-' + String(Math.random()).replace(/\D/g, ''),

    // Easily-parseable/retrievable ID or TAG or CLASS selectors

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
    whitespace = '[^\\x00-\\xFF]',
    wrapper = '\\\\' + combineRegEx('[\\da-fA-F]{1,6}(?:(?:\\r\\n)|\\s)?', '[^\\n\\r\\f\\da-fA-F]'),
    nmstart = combineRegEx('[_a-zA-Z]', whitespace, wrapper),
    nmchar = combineRegEx(nmstart, '[\\w-]'),
    ident = '-?' + nmstart + nmchar + '*',
    nl = '\\n|(?:\\r\\n)|\\f',
    str1 = "'(?:[^\\n\\r\\f\\\\']|(?:\\\\" + nl + ")|(?:" + wrapper + "))*'",
    str2 = str1.replace("'", "\""),
    string = combineRegEx(str1, str2),
    combinatorComma = '\\s*([+>~,\\s])\\s*',
    argReference = '{[^}]+}',
    stringIdentFlag = '(' + combineRegEx(ident, string, argReference) + ')(?:\\s+([a-zA-Z]*))?',
    attrib = '\\[\\s*(\\.?' + ident + ')\\s*(?:([|^$*~!]?=)\\s*' + stringIdentFlag + '\\s*)?\\]',
    pseudoClass = '[:.](' + combineRegEx(ident, argReference) + ')',
    rhash = '#' + nmchar + '+',
    rtype = combineRegEx(ident, '\\*'),
    spaceReplace = /\s+/g,
    escapeReplace = /\\./g,

    // regEx we are using through the code

    compileExpr = {
        header: /^h\d$/i,
        inputs: /^(?:input|select|textarea|button)$/i,
        radicheck: /radio|checkbox/i,
        selectorPattern: new RegExp('^(' + combineRegEx(combinatorComma, rtype, rhash, pseudoClass, attrib) + ')(.*)$'),
        anbPattern: /(?:([+-]?\d*)n([+-]\d+)?)|((?:[+-]?\d+)|(?:odd)|(?:even))/i,
        identReg: new RegExp('^' + ident + '$'),
        hashReg: new RegExp('^' + rhash + '$'),
        typeReg: new RegExp('^' + rtype + '$'),
        containsArg: new RegExp('^' + stringIdentFlag + '$'),
        referencedByArg: /^\s*(\S+)(?:\s+in\s+([\s\S]*))?\s*$/i,
        beginEndQuoteReplace: /^(['"])(.*)\1$/,
    },

    scope,

    // Cache for regEx

    regExCache = {},

    // Increments each time getSelector is called, used for the unique attribute value

    iCount = 0,

    // Increments every time translate is called (recursive calls do not increment it)

    tCount = 0,

    // Reset every time translate is called (recursive calls do not reset it) and incremented
    //for attribute names

    rCount,

    runningCount = 0,

    /**
     * Filter
     *
     * NOTE!!! Lowercase are used internally, and will not recive
     * the same arguments as uppercase.
     *
     * Example:
     *
     * 'attr' - used by some pseudo selectors, natively supported in
     *          query() and queryAll(). Therefor used internally.
     *
     * 'ANY-LINK' - are an CSS Level 4 selector, and not supported
     *              natively in query() and queryAll(). Therefor uppercase.
     *
     *****************************************************************/

    // Expr that are lowercase are used internally and do not receive the 
    // same arguments as normal Expr

    Expr = {

        /* ============================ INTERNAL =========================== */

        'attr': function(el, attr, operator, value, flags, ref) {
            flags = (flags || '').toLowerCase();
            value = value || '';
            var property = attr[0] == '.' ? attr.slice(1) : undefined,
                result = property ? el[property] : getAttributes(el, attr) || '',
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
                operator === '*=' ? reg ? reg.test(result) : result.indexOf(check) > -1 :
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

            return quickQuery(translate(args, el, references), el.ownerDocument);
        },

        'HAS': function(el, args, p, references) {
            return quickQuery(translate(args, el, references), el.ownerDocument);
        },

        'ANY-LINK': function(el) {
            var id = el.id;
            if (id) {
                return quickQuery("a[href$='#" + id + "']", el.ownerDocument);
            }
        }
    },
    transformers = {

        /* The local-link pseudo selector selects anchor elements whose URI points to a local path in relation to the current document. 
         * :local-link can be used with no arguments or a non-negative integer as an argument.
         *
         * When :local-link is used with no arguments, then anchors which point to the current document will
         * be selected. Every part of the URI except fragment identifiers must match.
         *
         * When :local-link is provided a non-negative integer it will compare the domain and path parts of the URI to the
         * current document. The path is broken into into sections separated by forward slashes /.
         *
         * EXAMPLE
         * ----------
         *
         * Select all anchor elements which point to the current document:
         *
         * hAzzle(":local-link");
         *
         */

        'LOCAL-LINK': function(args, attr, attrValue, p, context) {
            var pathnameParts, selector,
                contextDoc = context.ownerDocument || context,
                pathname = contextDoc.location.pathname;
            pathname = pathnameSlash ? pathname : pathname.substr(1);
            if (!args) {
                selector = "a[.protocol='" + contextDoc.location.protocol + "'][.host='" + contextDoc.location.host + "'][.pathname='" + pathname + "']";
            } else {
                //convert the string to a number
                args -= pathnameSlash ? -1 : 0;
                pathnameParts = pathname.split('/');
                if (pathnameParts.length >= args) {
                    pathname = pathnameParts.slice(0, args).join('/');
                    selector = "a[.host='" + contextDoc.location.host + "'][.pathname^='" + pathname + "']";
                }
            }

            if (selector) {

                filter(Kenny(selector, contextDoc), attr, attrValue, Expr.tru);
            }
        },

        /**
         * The not pseudo selector is the opposite of the matches pseudo selector, selecting elements
         * which do not match the given sub-selector.
         *
         * NOTE!! The CL4 'not pseudo selector' should not be confused with jQuery 'not' selector.
         *
         * It can take up to two arguments, and jQuery one.
         *
         * Example:
         *
         * Select input elements which are not checked and do not have the class ".hidden":
         *
         * hAzzle("input:not(:checked, .hidden)");
         *
         */

        'NOT': function(args, attr, attrValue, p, context, references) {
            args = filter(Kenny(args, context, references), attr, attrValue, Expr.tru);
            return ':not(' + args + ')';
        },

        /**
         * The referenced-by pseudo selector selects elements whose id is referenced by an attribute or
         * property in some element. The grammar for the argument works by specifying an attribute/property
         * name, whitespace, "in", whitespace and the sub-selector. The "in" keyword and the sub-selector
         * can be omitted to imply a sub-selector of *.
         *
         * EXAMPLES:
         * ---------
         *
         * Select all elements whose id is referenced by the "for" attribute on any element:
         *
         * hAzzle(":referenced-by(for)");
         *
         * Select all elements whose id is referenced by the "data-link" attribute on any "code" element:
         *
         * hAzzle(":referenced-by(data-link in code)");
         *
         * Select all elements whose id is referenced by the "htmlFor" property on any element which matches "form > label":
         *
         * hAzzle(":referenced-by(.htmlFor in form > label)");
         *
         */

        'REFERENCED-BY': function(args, attr, attrValue, p, context, references) {
            var element, refEl,
                found = compileExpr.referencedByArg.match(args),
                contextDoc = context.ownerDocument || context,
                referenceAttr = found[1],
                elements = Kenny(':matches(' + (found[2] || '*') + ')[' + referenceAttr + ']', contextDoc, references),
                l = elements.length;
            while ((element = elements[--l])) {
                refEl = grabID(referenceAttr[0] == '.' ? element[referenceAttr.slice(1)] : getAttributes(element, referenceAttr), contextDoc);
                if (refEl) {
                    refEl.setAttribute(attr, attrValue);
                }
            }
        },

        /**
         * The matches pseudo selector selects elements which meet the sub-selector. This can be especially helpful
         * in simplifying complex selectors. For example:
         *
         * div > p:nth-child(2n+1), div > a:nth-child(2n+1), div > h1:nth-child(2n+1)
         *
         * Can be simplified:
         *
         * div > :matches(p, a, h1):nth-child(2n+1)
         *
         */

        'MATCHES': function(args, attr, attrValue, p, context, references) {
            filter(Kenny(args, context.ownerDocument || context, references), attr, attrValue, Expr.tru);
        }
    },

    pathnameSlash = (function() {
        var a = document.createElement('a');
        a.href = '/';
        return a.pathname;
    }());

/*
 * Jiesa.parse() behaves similar to document.querySelectorAll, selecting elements based on a CSS selector. Jiesa.parse()
 * returns an array of elements which match the given CSS selector.
 *
 * Parameters
 * -----------
 *
 * selector
 * --------
 * A string value of the CSS selector used to select elements. Selectors may begin with a combinator.
 *
 * context
 * --------
 *
 * An element which limits the scope of which elements will be selected. If not specified, context defaults to document.
 *
 * references
 * ----------
 *
 * References allow the user to create ad-hoc pseudo selectors which behave as filters. Additionally, some selectors can
 * utilize references to make element selection even more powerful (attribute/property selectors, contains).
 *
 * References are defined within an object or an array, and elements within are referenced by their associated key. Keys can
 * be any number of character but cannot contain a closing curly brace }.
 *
 *
 * Examples
 * -----------
 * Example 1
 *
 * Basic selector--select all divs that are children of a footer:
 *
 * hAzzle("footer > div");
 *
 * Example 2
 * ---------
 *
 * Selector with context--select all elements with a class of "bold" which are descendents of an element with an id of "demo"
 *
 * hAzzle(".bold", document.getElementById("demo"));
 *
 * Example 3
 * ---------
 *
 * Selector that starts with a combinator and context--select all elements with a class of "bold" that are children of an element with an id of "demo":
 *
 * hAzzle("> .bold", document.getElementById("demo"));
 *
 * Example 4
 * ---------
 * Selector which uses a reference--select all elements which contain the text "foo bar":
 *
 * hAzzle(":contains({0})", ["foo bar"]);
 *
 * Example 5
 * ---------
 * Another selector which uses a reference--select all elements which contain the text "bar" :
 *
 * hAzzle(":contains({foo})", {foo : "bar"});
 *
 * Example 6
 * ---------
 * Selector which uses an ad-hoc pseudo selector--select all elements which do not have an id:
 *
 * hAzzle(":{foo}", {foo : function () {
 *    return !this.id;
 * }});
 *
 */

var Kenny = Jiesa.parse = function(selector, context, references) {

    var contextDoc, results = [],
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

    contextDoc = context.ownerDocument || context;

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

    return slice.call(quickQueryAll(translate(selector, context, references), contextDoc));
};

/**
 * hAzzle.anb is a utility method to assist dealing with an + b expressions. It returns an object with three methods:
 *
 * next()
 *
 * Acts like an iterator returning an integer representing y in the equation y = an + b. On the first call, next will return the smallest whole number which matches the provided an + b
 * expression. On subsequent calls, the next matching whole number is returned. If there are no remaining whole numbers, a negative integer is returned.
 *
 * reset()
 *
 * Resets the object so subsequent calls to next() will be as if it had never previously been called.
 * matches(y)
 *
 * matches returns a boolean value indicating whether the the provided y value is found on the line mapped by the expression an + b.
 * Note: The CSS specification uses 1-based numbering in counting elements. Because these utilities are meant to be used in conjunction with arrays and array-like-objects which use 0-based *
 * numbering, the object returned by hAzzle.anb and its methods compensate by decrementing b by one.
 *
 *
 * Example 1
 * ---------
 *
 * next and reset:
 *
 * var iterator = hAzzle.anb("odd");
 * //"0 2 4"
 * console.log(iterator.next(), iterator.next(), iterator.next());
 * iterator.reset();
 * //"0 2 4"
 * console.log(iterator.next(), iterator.next(), iterator.next());
 *
 *
 * Example 2
 * ---------
 *
 * matches:
 *
 * var matcher = hAzzle.anb("3n+1");
 * //false
 * console.log(matcher.matches(2));
 * //true
 * console.log(matcher.matches(6));
 */

var anb = hAzzle.anb = function(str) {
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
};

/**
 * Translate queries
 *
 * Capture groups:
 * 1 - whole match
 * 2 - combinator/comma
 * 3 - class/pseudo
 * 4 - attribute name
 * 5 - attribute operator
 * 6 - attribute value
 * 7 - attribute flags
 * 8 - right context
 *
 *
 * This method is used similarly to Jiesa.parse(), the difference is rather than returning an array of elements, a string is returned with a CSS selector that is compatible with
 * document.querySelectorAll.
 *
 * Example:
 *
 *  //":not([class=bold])" if supported, otherwise something like
 *  //"[kf1349511387861c='84']"
 *  console.log(hAzzle.translate("[class!=bold]"));
 *
 * If supported, this:
 *
 * console.log(hAzzle.translate("[class!=bold]"));
 *
 * will become translated too:
 *
 * ":not([class=bold])"
 *
 *******************/

var translate = hAzzle.translate = function(selector, context, references) {

    if (!selector) {
        return;
    }

    var cScope, group, str, n, j, k, match, args, pseudo, filterFn, contextDoc,
        wholeSelector = '',
        lastMatchCombinator = '*';

    if (!(references || isDocument(context) || isElement(context))) {
        references = context;
        context = document;
    }

    group = cScope = getSelector(context) + ' ';

    contextDoc = context.ownerDocument || context;

    //if no other instances of Kenny are in progress

    if (!(runningCount++)) {
        rCount = 0;
        tCount++;
        scope = cScope;
    }

    /*
     * IMPORTANT!!
     *
     * There is an potential risk that this translate() function can be bypassed as soon as browsers start experimenting with
     * CSS Level 4 selectors .
     *
     * This will return unexpected results.
     *
     * hAzzle have a build in mechanism to avoid that browser bugs are affecting the users code. This can be done if you
     * prepend the selector with -- (double hyphen) to force hAzzle to translate. Sub-selectors should also be prepended
     * with -- to force hAzzle to translate.
     *
     * Example:
     *
     * hAzzle("--:local-link");
     *
     *  Sub-selector also needs translating
     *
     * hAzzle("-- :nth-match(odd of --:scope > p)", document.body);
     *
     * The -- (double hyphen) are removed here - together with whitespace and stars.
     *
     * This serious bug issue will be fixed permanently as soon as Mehran Hatami have developed a back-end solution that will
     * replace native QSA / Query / QueryAll with a cross-browser friendly one.
     *
     */

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

                        group = filter(quickQueryAll(group + lastMatchCombinator, contextDoc), attrExpando + rCount++, tCount, filterFn, [args, pseudo, references]);

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

                    group += filter(contextDoc.queryAll(group + lastMatchCombinator), attrExpando + rCount++, tCount, Expr.attr, [match[4], match[5], match[6], match[7], references]);

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
};

/**
 * hAzzle.getSelector takes an element and returns a string value for a simple CSS selector
 * which uniquely identifies that element.
 *
 * Example:
 *
 * Given the following HTML element:
 *
 * <h1>This is a header</h1>
 *
 * Get a selector for the above element:
 *
 * //assuming the above h1 was the second h1 in the document
 * var el = document.getElementsByTagName("h1")[1];
 * //something like "[Jiesa-1349511387861c='84']"
 * console.log(hAzzle.getSelector(el));
 *
 */

var getSelector = hAzzle.getSelector = function(el) {

    if (!el || isDocument(el)) {
        return '';
    }

    if (el.id) {

        return '#' + el.id;
    }

    var attr = attrExpando + 'c',
        value = getAttributes(el, attr);
    if (!value) {

        value = iCount++;
        el.setAttribute(attr, value);
    }

    return '[' + attr + "='" + value + "']";
};

/* ============================ PLUGIN METHODS =========================== */

/**
 * AddFilter and AddTransformer - both methods extend hAzzle's capabilities by adding new,
 * custom pseudo selector support. The methods will returns 1 if the new pseudo selector
 * was added successfully, 0 if not. A pseudo selector will not be added if pseudo does not match
 * CSS grammar for a pseudo name, if a custom pseudo selector already exists by that name, or if fn is not a function.
 *
 *
 * The difference between hAzzle.addFilter and hAzzle.addTransformer is the way by which they select elements.
 *
 * A filter function is called for each element which is a candidate to be selected. If the element matches the filter, the
 * filter function returns a truthy value, otherwise a falsey value.
 *
 * A transformer function, by contrast, is called only once per occurrance in a selector and it returns a replacement
 * selector which is natively recognized by document.querySelectorAll. In
 * other words it transforms a non-supported selector in to a supported one.
 *
 * Parameters
 * -----------
 *
 * pseudo
 * ------
 *
 * A string representing the name of the new pseudo selector. Pseudo names are case insensitive and cannot override a previously defined custom pseudo selector.
 *
 * fn
 * ----
 *
 * A function that is called as a filter or transformer.
 *
 * Filter functions receive four arguments when called:
 *
 * el
 * ---
 *
 * The current element being evaluated.
 * args
 * A string value of the arguments used with a pseudo selector. For example, in the pseudo selector :not(.class > a) args would be ".class > a".
 * pseudo
 *
 * A string value of the pseudo name for the current pseudo selector being evaluated. This is useful when multiple custom pseudo selectors
 * utilize the same function. Note that this value will
 * be in uppercase.
 *
 * references
 * ----------
 *


 * An array or object containing references which were passed in to either Jiesa.parse() or hAzzle.translate.
 * Transformer functions receive six arguments when called:
 *
 * args
 * ----
 *
 * See args above.
 *
 * attributeName
 * ------------
 *
 * A string value for a recommended attribute name to be used in conjunction with attributeValue. Because a
 * transformer takes an unsupported pseudo selector and transforms it into a supported
 * selector, the transformer function can optionally set this attribute name with the accompanied attribute value on
 * matching elements, and then return an attribute selector.
 *
 * attributeValue
 * ---------------
 *
 * A string value for a recommended attribute value to be used in conjunction with attributeName. See attributeName.
 *
 * pseudo
 * ------
 *
 * See pseudo above.
 *
 * context
 * -------
 *
 * The context element which was passed in to Jiesa.parse() or hAzzle.translate.
 * references
 * See references above.
 * Transformer functions should only return a simple selector--meaning the selector contains no combinators. The
 * return can be omitted from a transformer in which case it will default to [{attributeName}={attributeValue}].
 *
 *
 * Examples
 *
 * Example 1
 * ---------
 *
 * Add a filter to select elements which have an id:
 *
 * //add the filter
 * hAzzle.addFilter("has-id", function (el) {
 *  return el.id;
 * });
 * //utilize the new pseudo selector
 * hAzzle(":has-id");
 *
 * Example 2
 * ---------
 *
 * Add a transformer to select elements which have an id (this will perform better than the filter in example 1):
 *
 * //add the transformer
 * hAzzle.addTransformer("has-id", function () {
 * return "[id]";
 * });
 * //utilize the new pseudo selector
 * hAzzle(":has-id");
 *
 * Example 3
 * -----------
 * Add two transformers which use the same function:
 *
 * //this is the actual transformer function used for ":nth-match" and
 * //":nth-last-match" (slightly refactored)
 * var nthMatchLastMatch = function (args, attributeName, attributeValue, pseudo, context, references) {
 * var element,
 *  ofPos = args.indexOf("of"),
 *        anbIterator = anb(args.substring(0, ofPos)),
 *        elements = hAzzle(args.substr(ofPos + 2), (context.ownerDocument || context), references),
 *        l = elements.length - 1,
 *        nthMatch = pseudo[4] != "L";
 *    while ((element = elements[nthMatch ? anbIterator.next() : l - anbIterator.next()])) {
 *        element.setAttribute(attributeName, attributeValue);
 *    }
 * };
 * //add the transformer functions
 * hAzzle.addTransformer("nth-match", nthMatchLastMatch);
 * hAzzle.addTransformer("nth-last-match", nthMatchLastMatch);
 * //utilize the new pseudo selector
 * hAzzle(":nth-match(-2n+8 of span.italic)");
 */


hAzzle.addFilter = function(pseudo, fn) {
    return extend(pseudo, Expr, fn);
};

hAzzle.addTransformer = function(pseudo, fn) {
    return extend(pseudo, transformers, fn);
};

/* ============================ UTILITY METHODS =========================== */

// Combine regEx

function combineRegEx() {
    return "(?:(?:" + join.call(arguments, ")|(?:") + "))";
}

function quickQueryAll(selector, context) {

    if (!selector || !context) {
        return [];
    }

    // Mehran! Come up with a better solution then
    // try / catch here due to performance issues

    try {
        return context.queryAll(selector);
    } catch (e) {
        return [];
    }
}

function quickQuery(selector, context) {

    if (!selector || !context) {
        return [];
    }
    return context.query(selector);
}

function filter(elements, attr, attrValue, filterFn, args) {

    var i = elements.length;

    args = args || [];

    while (i--) {

        if (filterFn.apply(undefined, [elements[i]].concat(args))) {

            elements[i].setAttribute(attr, attrValue);
        }
    }
    //if all of the elements matched the filter return empty string
    return "[" + attr + "='" + attrValue + "']";
}

function isElement(o) {
    return o && o.nodeType == 1;
}

function isDocument(o) {
    return o && o.nodeType == 9;
}

function extend(pseudo, type, fn) {

    // Pseudo are allways upperCase
    // Except for internals

    pseudo = pseudo.toUpperCase();

    // Check that the pseudo matches the css pseudo pattern, is 
    // not already in use and that fn is a function

    if (compileExpr.identReg.test(pseudo) &&
        !Expr[pseudo] && !transformers[pseudo] && typeof(fn) === 'function') {
        type[pseudo] = fn;
        return 1;
    }
    return 0;
}

function isForm(elem) {
    return typeof elem.form !== 'undefined';
}

function getAttributes(elem, name) {
    // Set document vars if needed
    if ((elem.ownerDocument || elem) !== document) {
        hAzzle.setDocument(elem);
    }
    var val;
    return hAzzle.documentIsHTML ?
        elem.getAttribute(name) :
        (val = elem.getAttributeNode(name)) && val.specified ?
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

function byIdRaw(id, elements) {
    var i = -1,
        element = null;
    while ((element = elements[++i])) {
        if (getAttributes(element, 'id') === id) {
            break;
        }
    }
    return element;
}

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
 * The scope pseudo selector matches the context element that was passed into Jiesa.parse() or
 * hAzzle.translate(). When no context element is provided, scope is the equivalent of :root.
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

/* ============================ CL3 SELECTORS =========================== */

// NOTE!! This pseudo selectors are not nativelly supported by
// QSA, query (DL 4) / queryAll (DL 4), and added here just to
// keep up with Sizzle

hAzzle.extend({

    // Nativelly supported, but buggy

    'EMPTY': function(el) {
        for (var node = el.firstChild; node; node = node.nextSibling) {
            if (node.nodeType < 6) {
                return 0;
            }
        }
        return 1;
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
        return !Expr.hidden(elem);
    },

    'TEXT': function(elem) {
        var attr;
        return elem.nodeName.toLowerCase() === 'input' &&
            elem.type === 'text' &&
            ((attr = elem.getAttribute('type')) === null || attr.toLowerCase() === 'text');
    },
    'HEADER': function(elem) {
        return compileExpr.header.test(elem.nodeName);
    },
    'BUTTON': function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === 'button' || name === 'button';
    },
    'INPUT': function(elem) {
        return compileExpr.inputs.test(elem.nodeName);
    },
    'PARENT': function(elem) {
        return !Expr.EMPTY(elem);
    },
    'SELECTED': function(elem) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
            elem.parentNode.selectedIndex;
        }

        return elem.selected === true;
    }
}, Expr);

// Add button/input type pseudos

for (i in {
    RADIO: true,
    CHECKBOX: true,
    FILE: true,
    PASSWORD: true,
    IMAGE: true
}) {
    Expr[i] = createInputPseudo(i);
}
for (i in {
    SUBMIT: true,
    RESET: true
}) {
    Expr[i] = createButtonPseudo(i);
}

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

/* ============================ CL4 SELECTORS =========================== */

hAzzle.extend({

    // HTML5 UI element states (form controls)
    'DEFAULT': function(elem) {
        return isForm(elem) && ((compileExpr.radicheck).test(elem.type) ||
            /option/i.test(elem.nodeName)) && (elem.defaultChecked ||
            elem.defaultSelected);
    },

    'IN-RANGE': function(elem, sel) {
        return isForm(elem) &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && !elem.validity.typeMismatch &&
            !elem.validity.rangeUnderflow && !elem.validity.rangeOverflow;
    },
    'OUT-OF-RANGE': function(elem, sel) {
        // Only fields for which validity applies
        return isForm(elem) &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && (elem.validity.rangeUnderflow || elem.validity.rangeOverflow);
    },
    'DIR': function(el, val) {
        while (el) {
            if (el.dir) {
                return el.dir === val;
            }
            el = el.parentNode;
        }
        return false;
    },
}, Expr);

// CL4 - required, read-only, read-write, optional
hAzzle.each({
    'REQUIRED': 'required',
    'READ-ONLY': 'readOnly',
    'READ-WRITE': 'readOnly',
    'OPTIONAL': 'required'
}, function(prop, original) {
    Expr[original] = function(elem) {
        return isForm(elem) && typeof elem[prop] !== 'undefined' && !elem[prop];
    };
});

// CL4 - valid and invalid 
hAzzle.each(['VALID', 'INVALID'], function(prop) {
    Expr[prop] = function(elem) {
        return isForm(elem) && typeof elem.validity === 'object' &&
            prop === 'VALID' ?
            elem.validity.valid :
            !elem.validity.valid;
    };
});