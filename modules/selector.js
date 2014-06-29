var
    win = this,

    doc = win.document,

    cache = [],

    regCache = {},

    i,

    expando = 'hAzzle_' + hAzzle.now(),

    slice = Array.prototype.slice,

    pinput = /^(?:input|select|textarea|button)$/i,

    pheader = /^h\d$/i,

    grpl = /(\([^)]*)\+/,

    grpm = /(\[[^\]]+)~/,

    grpr = /(~|>|\+)/,

    grw = /\s+/,

    rescape = /'|\\/g,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors

    rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

    rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,

    findExpr = !!doc.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,

    sibling = /[\x20\t\r\n\f]*[+~>]/,

    aTag = /^(\w+|\*)\[/,
    attrM = /\[[^\[]+\]/g,
    attrT = /^[^\s>+~:]+\[((?:[\w\-])+)([~^$*|!]?=)?([\w\- ]+)?\]*[^\w\s>+~:]+$/,
    attr = /^\[((?:[\w\-])+)([~^$*|!]?=)?([\w\- ]+)?\]$/,
    pseudoNH = /^(\w+|\*?):(not|has)(?:\(\s*(.+|(?:[+\-]?\d+|(?:[+\-]?\w+\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?$/,

    pseudo = /^(\w+|\*?):((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\(\s*(.+|(?:[+\-]?\d+|(?:[+\-]?\w+\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?$/,

    nthChild = /^(\w+|\*?):((?:nth)(-last)?(?:-child|-of-type))(?:\(\s*((?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
    nthBrck = /(-?)(\d*)(?:[n|N]([+\-]?\d*))?/,
    grpSplit = /\s*,\s*/g,
    combTest = /^[+>~ ]$/,
    SimpComb = /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/,

    identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',

    langidentifier = new RegExp('^' + identifier + '$'),

    whitespace = '[\\x20\\t\\r\\n\\f]',

    runescape = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig'),

    funescape = function (_, escaped, escapedWhitespace) {
        var high = '0x' + escaped - 0x10000;
        // NaN means non-codepoint
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    };

var Expr = {

    /* =========================== PSEUDO SELECTORS ========================== */

    pseudos: {

        'root': function (el) {
            return el === hAzzle.docElem;
        },

        /**
		 * Collect nth-childs
		 *
		 * @param{Object} el
		 * @param{Number / Float} n
		 * @param{Boolean} t	 
		 *
		 */

        'nthChild': function (el, n, bool) {

            var x = n[0],
                y = n[1];

            if (x === 1 && y === 0) {
				
                return true;
            }

            if (!el.nIdx) {
                
				var node = el.parentNode.firstChild,
                    cnt = 0,
                    html = el.nodeName.toLowerCase() !== 'html';

                for (; node; node = node.nextSibling) {

                    if (bool ? node.nodeType === 1 && node.nodeName == el.nodeName && html : node.nodeType == 1 && html ) {

                        node.nIdx = ++cnt;
                    }
                }
            }

            var dif = el.nIdx - y;

            if (x === 0) {
				
                return (dif === 0);
				
            } else {
				
                return (dif % x === 0 && dif / x >= 0);
            }
        },

        'nth-child': function (el, n) {
            return this.nthChild(el, n, false);
        },

        'nth-of-type': function (el, n) {
            return this.nthChild(el, n, true);
        },

        'nthLastChild': function (el, n, t) {
            var node = el,
                par = el.parentNode,
                html,
                x = n[0],
                y = n[1];

            if (x === 1 && y === 0) {

                return true;
            }

            if (par && !el.nIdxL) {
                var cnt = 0;
                node = par.lastChild;
                html = el.nodeName.toLowerCase() !== 'html';

                do {

                    if (!t ? node.nodeType == 1 && html : node.nodeType == 1 && node.nodeName == el.nodeName && html) {

                        node.nIdxL = ++cnt;
                    }

                } while (node = node.previousSibling);
            }

            var dif = el.nIdxL - y;

            if (x === 0) {
                return (dif === 0);
            } else {
                return (dif % x === 0 && dif / x >= 0);
            }
        },

        'nth-last-child': function (el, n) {
            return this.nthLastChild(el, n);
        },

        'nth-last-of-type': function (el, n) {
            return this.nthLastChild(el, n, true);
        },

        'child': function (el, typ, t) {
            if (!el.nIdxC) {
                var node, cnt = 0,
                    last, html = el.nodeName.toLowerCase() !== 'html';
                for (node = el.parentNode.firstChild; node; node = node.nextSibling) {
                    if (!t ? node.nodeType == 1 && html : node.nodeType == 1 && node.nodeName == el.nodeName && html) {
                        last = node;
                        node.nIdxC = ++cnt;
                    }
                }

                if (last) {

                    last.IsLast = true;
                }

                if (cnt === 1) {

                    last.IsOnly = true;
                }
            }

            if (typ === 'first') {

                var pos = el.nIdxC;

            } else if (typ === 'last') {

                return !!el.IsLast;

            } else if (typ === 'only') {

                return !!el.IsOnly;
            }
        },

        'first-child': function (el) {
            return this.child(el, 'first');
        },

        'last-child': function (el) {
            return this.child(el, 'last');
        },

        'only-child': function (el) {
            return this.child(el, 'only');
        },

        'first-of-type': function (el) {
            return this.child(el, 'first', true);
        },

        'last-of-type': function (el) {
            return this.child(el, 'last', true);
        },

        'only-of-type': function (el) {
            return this.child(el, 'only', true);
        },

        'contains': function (el, text) {
            text = text.replace(runescape, funescape);
            return (el.textContent || el.innerText || hAzzle.getText(el)).indexOf(text) > -1;
        },

        'parent': function (el) {
            return !Expr.pseudos['empty'](el);
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
        'lang': function (el, lang) {
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
                    return elemLang === lang || hAzzle.indexOf(elemLang, lang + '-') === 0;
                }
            } while ((el = el.parentNode) && el.nodeType === 1);
            return false;
        },
        'enabled': function (el) {
            return el.disabled === false;
        },

        'disabled': function (el) {
            return el.disabled === true;
        },

        'checked': function (el) {
            // In CSS3, :checked should return both checked and selected elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked

            var nodeName = el.nodeName.toLowerCase();
            return (nodeName === 'input' && !!el.checked) || (nodeName === 'option' && !!el.selected);
        },

        'selected': function (el) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (el.parentNode) {
                el.parentNode.selectedIndex;
            }
            return el.selected === true;
        },

        'not': function (el, n) {

            var not = n,
                j = 0,
                l = not.length;
            while (l--) {
                if (not[j] === el) {
                    return false;
                }
                j++;
            }
            return true;
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

        /**
         * A few CSS4 pseudo selectors
         */

        'in-range': function (el) {
            return el.value > el.min && el.value <= el.max;
        },
        ':out-of-range': function (el) {
            return !Expr.pseudos['in-range'](el);
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

        /**
         * Extra pseudos - same as in jQuery / Sizzle
         */

        'first': function (el, matchIndexes, argument) {

            return argument === 0;
        },

        'last': function (el, matchIndexes, argument, len) {

            return argument === len - 1;
        },

        'odd': function (el, matchIndexes, argument) {

            return (argument + 1) % 2 === 0;
        },

        'even': function (el, matchIndexes, argument) {

            return (argument + 1) % 2 === 1;
        },

        'lt': function (el, matchIndexes, argument) {

            return argument < matchIndexes - 0;
        },

        'gt': function (el, matchIndexes, argument) {

            return argument > matchIndexes - 0;
        },

        'nth': function (el, matchIndexes, argument) {

            return matchIndexes - 0 === argument;
        },

        'eq': function (el, matchIndexes, argument) {
            return argument < 0 ? argument + length : matchIndexes - 0 === argument;

        }
    },

    /* =========================== DIRECTIVES ========================== */

    // TODO !! Directives / comb need to be fixed ASAP

    comb: {

        ' ': function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes) {


            if (pseu && !Expr.pseudos[pseu]) {

                hAzzle.error(pseu);
            }

            var els = el.getElementsByTagName(tag),
                i = 0,
                l = els.length,
                elm;

            for (; i < l; i++) {

                elm = els[i];

                if ((!id || elm.id === id) &&
                    (!cls || cls.test(elm.className)) &&
                    (!attr || (attrMatch(eql, el, attr, val))) &&
                    (Expr.pseudos[pseu] ? Expr.pseudos[pseu](elm, nth, i, l) : !pseu) && !elm.unq) {

                    if (last) {
                        elm.unq = 1;
                    }

                    tmpNodes.push(elm);
                }
            }
        },

        // Direct children

        '>': function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes) {

            if (pseu && !Expr.pseudos[pseu]) {

                hAzzle.error(pseu);
            }


            var els = el.getElementsByTagName(tag),
                i = 0,
                l = els.length,
                elm;

            for (; i < l; i++) {

                elm = els[i];

                if (elm) {

                    if (elm.parentNode === el && (!id || elm.id === id) &&
                        (!cls || cls.test(elm.className)) &&
                        (!attr || ((attrMatch(eql, elm, attr, val)))) &&
                        (Expr.pseudos[pseu] ? Expr.pseudos[pseu](elm, nth, i, l) : !pseu) && !elm.unq) {

                        if (last) {

                            elm.unq = 1;
                        }

                        tmpNodes.push(elm);
                    }
                }
            }
        },

        '+': function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes, h) {
            if (pseu && !Expr.pseudos[pseu]) hAzzle.error(pseu);
            while ((el = el.nextSibling) && el.nodeType !== 1) {
                if (el && (el.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                    (!id || el.id === id) &&
                    (!cls || cls.test(el.className)) &&
                    (!attr || (attrMatch(eql, el, attr, val))) &&
                    (Expr.pseudos[pseu] ? Expr.pseudos[pseu](el, nth, h) : !pseu) && !el.unq) {
                    if (last) {
                        el.unq = 1;
                    }
                    tmpNodes.push(el);
                }

            }
        },

        '~': function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes, h) {
            if (pseu && !Expr.pseudos[pseu]) hAzzle.error(pseu);
            while ((el = el.nextSibling) && !el.unq) {
                if (el.nodeType == 1 && (el.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                    (!id || el.id === id) &&
                    (!cls || cls.test(el.className)) &&
                    (!attr || (attrMatch(eql, el, attr, val))) &&
                    (Expr.pseudos[pseu] ? Expr.pseudos[pseu](el, nth, h) : !pseu)) {
                    if (last) {
                        el.unq = 1;
                    }
                    tmpNodes.push(el);
                }
            }
        }
    }
};


// hAzzle.select

hAzzle.select = function (selector, context, noCache, loop, nthrun) {

    selector = hAzzle.trim(selector);

    if (cache[selector] && !noCache && !context) {

        return cache[selector];
    }

    doc = hAzzle.setDocument(context);

    noCache = noCache || !!context;

    // clean context with document

    context = context || document;

    if (!selector || typeof selector !== 'string') {

        return [];
    }

    // Remove spaces around '['  and ']' of attributes

    selector = selector.replace(/['']/g, '').replace(/(\[)\s+/g, '$1').replace(/\s+(\])/g, '$1')
        // remove spaces to the 'left' and 'right' of operator inside of attributes
        .replace(/(\[[^\] ]+)\s+/g, '$1').replace(/\s+([^ \[]+\])/g, '$1')
        // remove spaces around '(' of pseudos
        .replace(/(\()\s+/g, '$1');

    var m, _match, set;

    // qucik selection - only ID, CLASS TAG, and ATTR for the very first occurence

    if (hAzzle.documentIsHTML && (m = rquickExpr.exec(selector)) !== null) {

        if (_match = m[1]) {

            if (context.nodeType === 9) {

                var el = context.getElementById(_match);
                set = el && el.parentNode ? [el] : [];

            } else {

                // Context is not a document
                if (context.ownerDocument && (el = context.ownerDocument.getElementById(_match)) &&
                    hAzzle.contains(context, el) && el.id === _match) {
                    set = [el];
                }

            }

        } else if ((_match = m[3])) {

            if (!!doc.getElementsByClassName) {

                set = context.getElementsByClassName(_match);
            }


            // Tags

        } else if (m[2]) {

            set = hAzzle.makeArray(context.getElementsByTagName(m[2]));
        }

        return !noCache ? cache[selector] = set : set;

        // Everything else

    } else {

        // attributes

        if (attrT.test(selector)) {

            var tag = !(m = aTag.exec(selector)) ? '' : m[1];


            set = findAttr(selector, context, tag);

            // pseudos

        } else if ((m = pseudoNH.exec(selector)) !== null || nthrun) {

            if (nthrun) {

                m = pseudo.exec(selector);
                m[1] = nthrun;
            }

            set = fnPseudo(m[2], context, m[1], getPseuNth(context, m[2], m[3], m[1]));

            // Directives and combinators

        } else {

            // split groups of selectors separated by commas.

            var grps = selector.split(grpSplit),
                grp,

                // group length

                gl = grps.length,

                // if we need to concat several groups

                gconcat = !!(gl - 1),
                nodes,
                parts = [],
                i = 0;

            while (gl--) {

                grp = grps[i];

                if (!(nodes = cache[grp]) || noCache) {


                    parts = grp.replace(grpl, '$1%').replace(grpm, '$1&').replace(grpr, ' $1 ').split(grw);
                    nodes = fnCombinator(context, parts);
                }

                if (gconcat) {

                    // if res isn't an array - create new one

                    set = mergeArray(nodes, set);

                } else {

                    // inialize res with nodes

                    set = nodes;
                }
                i++;
            }

            // clean elements

            cleanElements(set);
        }
    }
    return !noCache ? cache[selector] = set : set;
};

/* =========================== PRIVATE FUNCTIONS ========================== */

/**
 * Check for attribute match
 *
 * @param {String} operator
 * @param {Object} el
 * @param {String} attr
 * @param {String} check
 */

function attrMatch(operator, el, attr, check) {

    // hAzzle.attr() in manipulation.js 

    var val = hAzzle.attr(el, attr);

    if (val === null) {

        return operator === '!=';
    }

    if (!operator) {

        return true;
    }

    return operator === '=' ? val === check :
        operator === '!=' ? val !== check :
        operator === '^=' ? check && val.indexOf(check) === 0 :
        operator === '*=' ? check && val.indexOf(check) > -1 :
        operator === '$=' ? check && val.slice(-check.length) === check :
        operator === '~=' ? (' ' + val + ' ').indexOf(check) > -1 :
        operator === '|=' ? val === check || val.slice(0, check.length + 1) === check + '-' :
        false;
}

/**
 * Find attributes
 */

function findAttr(sel, elem, tag) {

        // Make sure we are on the right document

        if ((elem.ownerDocument || elem) !== document) {

            hAzzle.setDocument(elem);
        }

        var nodes = [],
            els = elem.getElementsByTagName(tag || '*'),
            am = sel.match(attrM),
            a, j = 0,
            l = els.length,
            el, m;

        while ((a = am.pop()) !== undefined) {

            if ((m = attr.exec(a))) {

                while (l--) {

                    el = els[j];

                    // check either attr is defined for given node or it's equal to given value

                    if (attrMatch(m[2], el, m[1], m[3] || '')) {

                        nodes.push(el);
                    }
                    j++;
                }

                els = nodes;

            } else {

                els = [];
            }
        }

        return els ? els : [];
    }
    /**
     * Clean elements
     */

function cleanElements(el) {
    var i = el.length;

    while (i--) {
        el[i].unq = el[i].nIdx = el[i].nIdxL = el[i].nIdxC = null;
    }
}

/**
 * Merge array
 */

function mergeArray(arr, res) {
    arr = slice.call(arr, 0);
    if (res) {
        res.push.apply(res, arr);
        return res;
    }
    return arr;
}

/**
 * Reusable regex for searching classnames and others regex
 */

function getClsReg(c) {
    // check to see if regular expression already exists
    var re = regCache[c];
    if (!re) {
        re = new RegExp(c);
        regCache[c] = re;
    }
    return re;
}

/**
 * Get Nth pseudo selectors
 *
 */

function getPseuNth(elem, typ, nth, nthrun) {

    // Quick lookup for 'not'

    if (typ === 'not') {

        return hAzzle.select(nth, elem, false, nthrun);

    } else {

        // For even and odd nth-last-child selectors
		// Faster alternative then regEx

        if (nth === 'even') {

            nth = '2n';
        }

        if (nth === 'odd') {

            nth = '2n+1';
        }

        if (nthChild.test(':' + typ)) {

            var m = [],
                rg;
				
            nth = nth.replace(/\%/, '+');
			
            rg = nthBrck.exec(!/\D/.test(nth) && '0n+' + nth || nth);

            // calculate the numbers (first)n+(last) including if they are negative

            m[0] = (rg[1] + (rg[2] || 1)) - 0;
            m[1] = rg[3] - 0;
            return m;

        } else {

            return nth;
        }
    }
}

function fnPseudo(sel, elem, tag, n) {

    tag = tag || '*';

    var nodes = [],
        els = elem.getElementsByTagName(tag),
        el, j = 0,
        l,
        cnt,
        fnP = Expr.pseudos[sel];

    cnt = l = els.length;

    while (cnt--) {

        el = els[j];

        if (fnP(el, n, j, l)) {

            nodes.push(el);
        }

        j++;
    }

    return nodes ? nodes : [];
}

// combinators processing function [E > F]

function fnCombinator(elem, parts) {

    var combt, nodes = [],
        tmpNodes, last, nth, el,
        pl = parts.length,
        part,
        m,
        j,
        nl,
        i = 0;

    combt = combt || ' ';
    // is cleanded up with DOM root 
    nodes = [elem];

    while (part = parts[i++]) {
        // test for combinators [' ', '>', '+', '~']
        if (!combTest.test(part)) {

            // match part selector;
            m = SimpComb.exec(part);

            if (m) {

                // for nth-childs pseudo

                nth = getPseuNth(elem, m[7], m[8]);
                //		alert(nth)
                tmpNodes = [];
                j = 0;
                // if we need to mark node with unq
                last = i == pl;
                nl = nodes.length;

                while (nl--) {

                    el = nodes[j];

                    // regEx here will allways be cached

                    Expr.comb[combt](el, m[1] || '*', m[2], m[3] ? getClsReg('(?:^|\\s+)' + m[3] + '(?:\\s+|$)') : '', m[4], m[5] || '', m[6], m[7], nth, last, tmpNodes, j);
                    j++;
                }
                // put selected nodes in temp nodes' set
                nodes = tmpNodes;
                combt = ' ';
            }
        } else {
            // switch ancestor ( , > , ~ , +)
            combt = part;
        }
    }
    return nodes;
}


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

/* =========================== GLOBAL FUNCTIONS ========================== */


hAzzle.extend({


    /**
     *
     * 'Internal ' hAzzle.find function
     *
     * Only for find() function.
     *
     * Mehran!!
     *
     * To-do! Add match with pseudo selectors
     *
     */

    find: function (selector, context, /*INTERNAL*/ all) {

        var quickMatch = findExpr.exec(selector),
            elements, old, nid;

        doc = hAzzle.setDocument(context);

        context = context || doc;

        if (quickMatch) {

            if (quickMatch[1]) {

                // speed-up: 'TAG'
                elements = context.getElementsByTagName(selector);

            } else {

                // speed-up: '.CLASS'
                elements = context.getElementsByClassName(quickMatch[2]);
            }

            if (elements && !all) {

                elements = elements[0];
            }

        } else {

            old = true;
            nid = expando;

            if (context !== doc) {

                if ((old = context.getAttribute('id'))) {

                    nid = old.replace(rescape, '\\$&');

                } else {

                    context.setAttribute('id', nid);
                }

                nid = "[id='" + nid + "'] ";

                context = sibling.test(selector) ? context.parentNode : context;
                selector = nid + selector.split(',').join(',' + nid);
            }

            try {
                elements = context[all ? 'querySelectorAll' : 'querySelector'](selector);
            } finally {
                if (!old) context.removeAttribute('id');
            }
        }

        return elements;
    },


    /**
     * Find all matched elements by css selector
     * @param  {String} selector
     * @param  {Object/String} context
     * @return {hAzzle}
     */

    findAll: function (selector, context) {
        return this.find(selector, context || doc, true);
    },


    /**
     * hAzzle matches
     *
     * Todo!
     *
     * Mehran!!
     *
     * Add match check against pseudos
     *
     */

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

        if (context.nodeType === 1) {

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

                    return hAzzle.matchesSelector(context, selector);
                }

                // loop through

                for (; i < l; i++) {

                    if (hAzzle.matchesSelector(context[i], selector)) {

                        result.push(context[i]);
                    }
                }
            }
        }

        return result;
    }

}, hAzzle);


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
    Expr.pseudos[i] = createInputPseudo(i);
}
for (i in {
    submit: true,
    reset: true
}) {
    Expr.pseudos[i] = createButtonPseudo(i);
}