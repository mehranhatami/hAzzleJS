/**
 * Warning!
 *
 * This code is under development. Use it as it is and do not complain!
 *
 * It is not perfect and has bugs too.
 *
 * I'm working on it. It also destroys some modules in hAzzle, so be carefull!!!!
 *
 * Now you have been warned!
 *
 *
 * - Kenny Flashlight
 *
 */
var doc = document,

    cache = [],

    regCache = {},

    slice = Array.prototype.slice,

    even = /\(\s*even\s*\)/gi,
    odd = /\(\s*odd\s*\)/gi,

    oddeven = /:(even|odd)/,

    pinput = /^(?:input|select|textarea|button)$/i,

    pheader = /^h\d$/i,

    identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

    langidentifier = new RegExp('^' + identifier + '$'),

    oldSelector,

    whitespace = "[\\x20\\t\\r\\n\\f]",

    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),

    funescape = function (_, escaped, escapedWhitespace) {
        var high = '0x' + escaped - 0x10000;
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


// Main functions

var main = {

        // get element attribute

        getAttr: function (el, val) {

            if (!el) return null;
            if (val === "class" || val === "className")
                return el.className;
            if (val === "for")
                return el.htmlFor;
            return el[val] || el.getAttribute(val) || "";
        },

        // reusable regex for searching classnames and others regex
        getClsReg: function (c) {
            // check to see if regular expression already exists
            var re = regCache[c];
            if (!re) {
                re = new RegExp(c);
                regCache[c] = re;
            }
            return re;
        },


        getPseuNth: function (root, typ, nth, nthrun) {
            if (typ === "not")
                return hAzzle.select(nth, root, false, nthrun);
            else {
                if (selectors.reg.nthChild.test(":" + typ))
                    return main.getNth(nth);
                else
                    return nth;
            }
        },

        getNth: function (s) {
            var m = [],
                rg;
            s = s.replace(/\%/, "+");
            rg = selectors.reg.nthBrck.exec(!/\D/.test(s) && "0n+" + s || s);
            // calculate the numbers (first)n+(last) including if they are negative
            m[0] = (rg[1] + (rg[2] || 1)) - 0;
            m[1] = rg[3] - 0;
            return m;
        },

        fnAttr: function (sel, root, tag) {
            tag = tag || "*";
            var nodes = [],
                els, am, a, j = 0,
                l, el, m, attr, s, val, fnA;
            els = root.getElementsByTagName(tag);
            am = sel.match(selectors.reg.attrM);
            while ((a = am.pop()) !== undefined) {
                m = selectors.reg.attr.exec(a);
                if (m) {
                    attr = m[1], s = m[2] || "", val = m[3] || "";
                    nodes = [];
                    j = 0;
                    l = els.length;
                    fnA = selectors.attr[s];
                    while (l--) {
                        el = els[j];
                        // check either attr is defined for given node or it's equal to given value
                        if (fnA(el, attr, val)) {
                            nodes.push(el);
                        }
                        j++;
                    }
                    els = nodes;
                } else
                    els = [];
            }
            return els ? els : [];
        },

        fnPseudo: function (sel, root, tag, n) {

            tag = tag || "*";

            var nodes = [],
                els, el, j = 0,
                l, cnt, fnP;
            els = root.getElementsByTagName(tag);
            cnt = l = els.length;
            fnP = selectors.pseudo[sel];
            while (cnt--) {
                el = els[j];
                if (fnP(el, n, j, l)) {
                    nodes.push(el);
                }
                j++;
            }
            return nodes ? nodes : [];
        },
        // combinators processing function [E > F]
        fnCombinator: function (root, parts) {
            var combt, nodes = [],
                tag, id, cls, attr, eql, pseu, tmpNodes, last, nth, el,
                pl = parts.length,
                part,
                m,
                val,
                mnth,
                j,
                nl,
                i = 0;



            combt = combt || " ";
            // is cleanded up with DOM root 
            nodes = [root];

            while (part = parts[i++]) {
                // test for combinators [" ", ">", "+", "~"]
                if (!selectors.reg.combTest.test(part)) {
                    // match part selector;
                    m = selectors.reg.SimpComb.exec(part);
                    // get all required matches from exec:
                    // tag, id, class, attribute, value, pseudo
                    tag = m[1] || "*";
                    id = m[2];
                    cls = m[3] ? main.getClsReg("(?:^|\\s+)" + m[3] + "(?:\\s+|$)") : "";
                    attr = m[4];
                    eql = m[5] || "";
                    val = m[6];
                    pseu = m[7];
                    mnth = m[8];
                    // for nth-childs pseudo
                    nth = main.getPseuNth(root, pseu, mnth);
                    tmpNodes = [];
                    j = 0;
                    // if we need to mark node with unq
                    last = i == pl;
                    nl = nodes.length;

                    while (nl--) {
                        el = nodes[j];

                        if (combt === ' ') {

                            selectors.comb[" "](el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes);
                            break;
                        }

                        if (combt === '>') {

                            selectors.comb[">"](el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes);
                            break;
                        }

                        if (combt === '+') {

                            selectors.comb["+"](el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes, j);
                            break;
                        }

                        if (combt === '~') {

                            selectors.comb["~"](el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes, j);
                            break;
                        }

                        j++;
                    }
                    // put selected nodes in temp nodes' set
                    nodes = tmpNodes;
                    combt = " ";
                } else {
                    // switch ancestor ( , > , ~ , +)
                    combt = part;
                }
            }
            return nodes;
        }
    },
    // selectors core
    selectors = {
        // regExp for matching selectors
        reg: {
            sharpTest: /^(\w+|\*?)([.#])([\w\-\.]*)$|^(?:\w+|\*)$/,
            aTag: /^(\w+|\*)\[/,
            attrM: /\[[^\[]+\]/g,
            attrT: /^[^\s>+~:]+\[((?:[\w\-])+)([~^$*|!]?=)?([\w\- ]+)?\]*[^\w\s>+~:]+$/,
            attr: /^\[((?:[\w\-])+)([~^$*|!]?=)?([\w\- ]+)?\]$/,
            pseudoNH: /^(\w+|\*?):(not|has)(?:\(\s*(.+|(?:[+\-]?\d+|(?:[+\-]?\w+\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?$/,
            pseudo: /^(\w+|\*?):((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\(\s*(.+|(?:[+\-]?\d+|(?:[+\-]?\w+\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?$/,
            nthChild: /^(\w+|\*?):((?:nth)(-last)?(?:-child|-of-type))(?:\(\s*((?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
            nthBrck: /(-?)(\d*)(?:[n|N]([+\-]?\d*))?/,
            grpSplit: /\s*,\s*/g,
            combTest: /^[+>~ ]$/,
            SimpComb: /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/
        },

        /* =========================== ATTRIBUTES ========================== */

        attr: {

            "": function (el, attr) {
                return !!main.getAttr(el, attr);
            },

            "=": function (el, attr, val) {
                return main.getAttr(el, attr) == val;
            },

            "~=": function (el, attr, val) {
                return main.getClsReg("\\s" + val + "\\s").test(" " + main.getAttr(el, attr) + " ");
            },

            "^=": function (el, attr, val) {
                return !main.getAttr(el, attr).indexOf(val);
            },

            "$=": function (el, attr, val) {
                return (attr = main.getAttr(el, attr)) && attr.substr(attr.length - val.length) == val;
            },

            "*=": function (el, attr, val) {
                return main.getAttr(el, attr).indexOf(val) != -1;
            },

            "|=": function (el, attr, val) {
                return (attr = main.getAttr(el, attr)) && (attr === val || !attr.indexOf(val + "-"));
            },

            "!=": function (el, attr, val) {
                return main.getAttr(el, attr) != val;
            }
        },

        /* =========================== PSEUDO SELECTORS ========================== */

        pseudo: {

            root: function (el) {
                return el === hAzzle.docElem;
            },

            nthChild: function (el, n, t) {
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
                        if (!t ? node.nodeType == 1 && html : node.nodeType == 1 && node.nodeName == el.nodeName && html)
                            node.nIdx = ++cnt;
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
                return this.nthChild(el, n);
            },

            'nth-of-type': function (el, n) {
                return this.nthChild(el, n, true);
            },

            nthLastChild: function (el, n, t) {
                var node = el,
                    html,
                    x = n[0],
                    y = n[1];

                if (x === 1 && y === 0) {
                    return true;
                }

                var par = el.parentNode;
                if (par && !el.nIdxL) {
                    var cnt = 0;
                    node = par.lastChild;
                    html = el.nodeName.toLowerCase() !== 'html';
                    do {
                        if (!t ? node.nodeType == 1 && html : node.nodeType == 1 && node.nodeName == el.nodeName && html)
                            node.nIdxL = ++cnt;
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

            child: function (el, typ, t) {
                if (!el.nIdxC) {
                    var node, cnt = 0,
                        last, html = el.nodeName.toLowerCase() !== 'html';
                    for (node = el.parentNode.firstChild; node; node = node.nextSibling) {
                        if (!t ? node.nodeType == 1 && html : node.nodeType == 1 && node.nodeName == el.nodeName && html) {
                            last = node;
                            node.nIdxC = ++cnt;
                        }
                    }
                    if (last) last.IsLast = true;
                    if (cnt === 1)
                        last.IsOnly = true;
                }

                switch (typ) {
                case 'first':
                    var pos = el.nIdxC;
                    return pos == 1;
                case 'last':
                    return !!el.IsLast;
                case 'only':
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
                return !selectors.pseudo['empty'](el);
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
                return el === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(el.type || el.href || ~el.tabIndex);
            },

            'hover': function (el) {
                return el === el.hoverElement;
            },

            'target': function (el) {
                var hash = window.location && window.location.hash;
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
            'radio': function (el) {
                var name = el.nodeName.toLowerCase();
                return name === 'input' && el.type === 'radio';
            },
            'checkbox': function (el) {
                var name = el.nodeName.toLowerCase();
                return name === 'input' && el.type === 'checkbox';
            },
            'file': function (el) {
                var name = el.nodeName.toLowerCase();
                return name === 'input' && el.type === 'file';
            },
            'password': function (el) {
                var name = el.nodeName.toLowerCase();
                return name === 'input' && el.type === 'password';
            },

            'submit': function (el) {
                var name = el.nodeName.toLowerCase();
                return (name === 'input' || name === 'button') && 'submit' === el.type;
            },

            'image': function (el) {
                var name = el.nodeName.toLowerCase();
                return name === 'input' && el.type === 'image';
            },

            'reset': function (el) {
                var name = el.nodeName.toLowerCase();
                return (name === 'input' || name === 'button') && 'reset' === el.type;
            },

            'button': function (el) {
                var name = el.nodeName.toLowerCase();
                return (name === 'input' || name === 'button') && 'button' === el.type;
            },

            /**
             * Extra pseudos - same as in jQuery / Sizzle
             */

            'first': function (el, n, i) {

                return i === 0;
            },

            'last': function (el, n, i, len) {

                return i === len - 1;
            },

            'odd': function (el, n, i) {

                return (i + 1) % 2 === 0;
            },

            'even': function (el, n, i) {

                return (i + 1) % 2 === 1;
            },

            'lt': function (el, n, i) {

                return i < n - 0;
            },

            'gt': function (el, n, i) {

                return i > n - 0;
            },

            'nth': function (el, n, i) {

                return n - 0 === i;
            },

            'eq': function (el, n, i) {

                return n - 0 === i;
            }
        },

        comb: {

            " ": function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes) {
                if (pseu && !selectors.pseudo[pseu]) hAzzle.error(pseu);
                var els = el.getElementsByTagName(tag),
                    h = 0,
                    l = els.length,
                    elm;
                while (elm = els[h]) {
                    if ((!id || elm.id === id) &&
                        (!cls || cls.test(elm.className)) &&
                        (!attr || (selectors.attr[eql] && (selectors.attr[eql](elm, attr, val)))) &&
                        (selectors.pseudo[pseu] ? selectors.pseudo[pseu](elm, nth, h, l) : !pseu) && !elm.unq) {
                        if (last) {
                            elm.unq = 1;
                        }
                        tmpNodes.push(elm);
                    }
                    h++;
                }
            },

            ">": function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes) {
                if (pseu && !selectors.pseudo[pseu]) hAzzle.error(pseu);
                var els = el.getElementsByTagName(tag),
                    h = 0,
                    l = els.length,
                    elm;
                while (elm = els[h]) {
                    if (elm.parentNode == el && (!id || elm.id === id) &&
                        (!cls || cls.test(elm.className)) &&
                        (!attr || (selectors.attr[eql] && (selectors.attr[eql](elm, attr, val)))) &&
                        (selectors.pseudo[pseu] ? selectors.pseudo[pseu](elm, nth, h, l) : !pseu) && !elm.unq) {
                        if (last) {
                            el.unq = 1;
                        }
                        tmpNodes.push(el);
                    }
                    h++;
                }
            },

            "+": function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes, h) {
                if (pseu && !selectors.pseudo[pseu]) hAzzle.error(pseu);
                while ((el = el.nextSibling) && el.nodeType !== 1) {}
                if (el && (el.nodeName.toLowerCase() === tag.toLowerCase() || tag === "*") &&
                    (!id || el.id === id) &&
                    (!cls || cls.test(el.className)) &&
                    (!attr || (selectors.attr[eql] && (selectors.attr[eql](el, attr, val)))) &&
                    (selectors.pseudo[pseu] ? selectors.pseudo[pseu](el, nth, h) : !pseu) && !el.unq) {
                    if (last) {
                        el.unq = 1;
                    }
                    tmpNodes.push(el);
                }
            },

            "~": function (el, tag, id, cls, attr, eql, val, pseu, nth, last, tmpNodes, h) {
                if (pseu && !selectors.pseudo[pseu]) hAzzle.error(pseu);
                while ((el = el.nextSibling) && !el.unq) {
                    if (el.nodeType == 1 && (el.nodeName.toLowerCase() === tag.toLowerCase() || tag === "*") &&
                        (!id || el.id === id) &&
                        (!cls || cls.test(el.className)) &&
                        (!attr || (selectors.attr[eql] && (selectors.attr[eql](el, attr, val)))) &&
                        (selectors.pseudo[pseu] ? selectors.pseudo[pseu](el, nth, h) : !pseu)) {
                        if (last) {
                            el.unq = 1;
                        }
                        tmpNodes.push(el);
                    }
                }
            }
        }
    };



hAzzle.select = function (selector, context, noCache, loop, nthrun) {

    /**
     * Mehran!
     *
     * Only when we are dealing with 'even' and 'odd' selectors we
     * need to clean the selector.
     *
     * If we replace 'match' with 'test' we get better performance in Firefox, but
     * not in Chrome. If we remove this selector cleaning, we get peformance
     * identical to native DOM selection.
     *
     */

    oldSelector = selector.match(oddeven) ?
        hAzzle.trim(selector).replace(even, '(2n)').replace(odd, '(2n+1)') : hAzzle.trim(selector);


    if (cache[oldSelector] && !noCache && !context) {

        return cache[oldSelector];
    }


    noCache = noCache || !!context;

    // clean context with document

    context = context || doc;

    if (!selector || typeof selector !== 'string') {

        return [];
    }

    // Remove spaces around '['  and ']' of attributes

    selector = oldSelector.replace(/['"]/g, "").replace(/(\[)\s+/g, "$1").replace(/\s+(\])/g, "$1")
        // remove spaces to the 'left' and 'right' of operator inside of attributes
        .replace(/(\[[^\] ]+)\s+/g, "$1").replace(/\s+([^ \[]+\])/g, "$1")
        // remove spaces around '(' of pseudos
        .replace(/(\()\s+/g, "$1");

    var m, aa, set;

    var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/;

    // qucik selection - only ID, CLASS TAG, and ATTR for the very first occurence
    if ((m = rquickExpr.exec(selector)) !== null) {

        if (aa = m[1]) {

            if (context.nodeType === 9) {

                var el = context.getElementById(aa);
                set = el && el.parentNode ? [el] : [];

            } else {

                // Context is not a document
                if (context.ownerDocument && (el = context.ownerDocument.getElementById(aa)) &&
                    hAzzle.contains(context, el) && el.id === aa) {
                    set = [el];
                }

            }
        } else if ((aa = m[3])) {

            if (!!doc.getElementsByClassName && context.getElementsByClassName) {
                set = context.getElementsByClassName(aa);
            }

            // Tags

        } else if (m[2]) {

            set = hAzzle.makeArray(context.getElementsByTagName(m[2]));
        }

        return !noCache ? cache[oldSelector] = set : set;

        // Everything else

    } else {

        // attribute

        if (selectors.reg.attrT.test(selector)) {

            var tag = !(m = selectors.reg.aTag.exec(selector)) ? '' : m[1];

            set = main.fnAttr(selector, context, tag);

            // Pseudo

        } else if ((m = selectors.reg.pseudoNH.exec(selector)) !== null || nthrun) {

            if (nthrun) {

                m = selectors.reg.pseudo.exec(selector);
                m[1] = nthrun;
            }

            var nm = main.getPseuNth(context, m[2], m[3], m[1]);

            set = main.fnPseudo(m[2], context, m[1], nm);

            // generic function for complicated selectors
        } else {

            // number of groups to merge or not result arrays
            // groups of selectors separated by commas.
            var grps, grp, gl, gconcat, nodes, parts = [],
                i = 0;
            // split groups of selectors separated by commas.
            grps = selector.split(selectors.reg.grpSplit);
            // group length
            gl = grps.length;
            // if we need to concat several groups
            gconcat = !!(gl - 1);
            while (gl--) {
                grp = grps[i];
                if (!(nodes = cache[grp]) || noCache) {

                    // split selectors by space - to form single group tag-id-class,
                    // or to get heredity operator. Replace + in child modificators
                    // to % to avoid collisions. Additional replace is required for IE.
                    // replace ~ in attributes to & to avoid collisions.

                    parts = grp.replace(/(\([^)]*)\+/, '$1%').replace(/(\[[^\]]+)~/, '$1&').replace(/(~|>|\+)/, ' $1 ').split(/\s+/);
                    nodes = main.fnCombinator(context, parts);
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