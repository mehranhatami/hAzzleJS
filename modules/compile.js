/**
 * compile.js
 *
 * Include:
 *
 * - parser()
 *
 * This function are an seprate selector engine
 * for public use, and in plugins.
 *
 */
var win = this,

    // Current document

    doc = win.document,

    // Verify if the doc are HTML

    documentIsHTML = hAzzle.documentIsHTML,

    // Check for classList support

    csp = hAzzle.features.classList,

    // Short-hand for Jiesa

    Jiesa = hAzzle.Jiesa,

    // Mehran! You benchmark this!
    // Safer solution, but slower I guess

    toArray = hAzzle.makeArray,

    // regEx are slow, so let us do it
    // differently then Sizzle

    boolElem = {
        action: 2,
        cite: 2,
        codebase: 2,
        data: 2,
        href: 2,
        longdesc: 2,
        lowsrc: 2,
        src: 2,
        usemap: 2
    },

    booleans = {
        checked: 1,
        disabled: 1,
        async: 1,
        autofocus: 1,
        aitoplay: 1,
        controls: 1,
        defer: 1,
        hidden: 1,
        loop: 1,
        multiple: 1,
        open: 1,
        required: 1,
        scoped: 1,
        ismap: 1,
        readonly: 1,
        selected: 1
    },

    chunkCache = createCache(),

    /**
     * Special regex. NOTE! This is not part of the public Jiesa Object
     */

    rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
    trimspaces = /^\s*|\s*$/g,
    whitespace = new RegExp(Jiesa.whitespace),
    special = /\s?([\+~\>])\s?/g,
    encoding = '(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)',
    chunky = /(?:#[\w\d_-]+)|(?:\.[\w\d_-]+)|(?:\[(\w+(?:-\w+)?)(?:([\$\*\^!\|~\/]?=)(.+?))?\])|(?:[\>\+~])|\w+|\s|(?::[\w-]+(?:\([^\)]+\))?)/g;

hAzzle.extend({

    /**
     * Global regEx for Jiesa
     *
     */

    regex: {

        'id': new RegExp('^#(' + encoding + '+)(.*)'),
        'tag': new RegExp('^(' + encoding + '+)(.*)'),
        'Class': new RegExp('^\\.(' + encoding + '+)(.*)'),
        'rel': /^\>|\>|\+|~$/,

        "nth": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
            "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
            "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
        'attr': /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\x00-\xa0])+))|)[\x20\t\r\n\f]*\]/,

        'changer': /^\:((?:(nth|eq|lt|gt)\(([^()]*)\))|(?:even|odd|first|last))(.*)/i,
        'pseudo': /:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\((('((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)")|.*)\)|)/,

        'whitespace': whitespace,
    },

    /**
     * Jiesa parser
     *
     * @param {string} selector
     * @param {string|Object|Array} context
     * @return {Object}
     */

    parse: function (selector, context) {

        var i = 0,
            pieceStore = [],
            nodes,
            l, piece, piece1, j = 0,
            k,
            info, inf, chunks, kf;

        // Set / Adjust correct context

        nodes = AdjustDocument(context);

        selector = selector.replace(trimspaces, '').replace(special, ' $1');

        // Split the selector before we are looping through

        kf = selector.match(chunky);
   
   // Collect all the chungs we need
   
        chunks = Collector(kf);

        if ((l = chunks.length)) {

            // create the node set

            for (; i < l; i++) {

                piece = chunks[i];

                if (!piece.type) {

                    hAzzle.error('Invalid Selector: ' + piece.text);

                }

                if (piece.type !== 'whitespace' && chunks[i + 1]) {

                    pieceStore.push(piece);

                    //We push all non-descendant selectors into piece store until we hit a space in the selector.

                } else {

                    if (piece.type !== 'whitespace' && piece.type !== 'changer') {

                        pieceStore.push(piece);
                    }

                    //now we begin. Grab the first piece, as the starting point, then perform the filters on the nodes.

                    piece1 = pieceStore.shift();
                    k = pieceStore.length;

                    nodes = IranianWalker(nodes, 'c', function (elem) {
                        return elem ? Jiesa.getters[piece1.type](elem, piece1.text, context) : [];
                    });

                    // filter the nodes

                    for (; j < k; j++) {

                        //a 'changer' changes the nodes completely, rather than adding to them.
                        if (pieceStore[j].type === 'changer') {
                            info = Jiesa.regex.changer.exec(pieceStore[j].text);
                            nodes = Jiesa.changers[info[1]](nodes, info[2]);
                            continue;
                        }

                        nodes = IranianWalker(nodes, 'f', function (elem) {
                            return elem ? Jiesa.filters[pieceStore[j].type](elem, pieceStore[j].text) : false;
                        });
                    }

                    if (piece.type === 'changer') {

                        inf = Jiesa.regex.changer.exec(piece.text);
                        nodes = Jiesa.changers[inf[1]](nodes, inf[2]);
                    }

                    pieceStore = [];
                }
            }
        }
        return nodes;
    },

    getters: {

        /**
         * element by id
         *
         * Try nativly to use getElementById, but
         * if XML or buggy e.g., it fall back to the
         * hard and slow way of doing things
         */

        'id': function (elem, id) {

            // Grab the ID

            id = id.replace('#', '');

            if (!hAzzle.documentIsHTML || elem.nodeType !== 9) {
                return byIdRaw(id, elem);
            } else {

                if (Jiesa.has["bug-GEBI"]) {
                    var m = elem.getElementById(id);
                    return m && m.parentNode ? [m] : [];
                }
                // The long Iranian walk !
                return byIdRaw(id, elem);
            }
        },

        'Class': function (elem, sel) {
            sel = sel.replace('.', '');

            if (!documentIsHTML || elem.nodeType === 11) {
                // Let the Iranian take a walk
                return IranianWalker(all(elem), 'f', function (e) {
                    return Jiesa.filters.Class(e, sel);
                });
            } else {
                return toArray(elem.getElementsByClassName(sel));
            }
        },

        /**
         * elements by tag
         */

        'tag': function (elem, tag) {

            // If getElementsByTagName  are buggy, we fix it!!

            if (Jiesa.has["bug-GEBTN"]) {
                var tmp = [],
                    i = 0,
                    results = elem.getElementsByTagName(tag);

                // Filter out possible comments

                if (tag === "*") {

                    while ((elem = results[i++])) {
                        if (elem.nodeType === 1) {
                            tmp.push(elem);
                        }
                    }

                    return tmp;
                }
                return results;

            } else {

                // If XML doc or document fragment, do a 
                // raw grab of the node, because the Iranian don't 
                // fit for this 				

                if (documentIsHTML || elem.nodeType === 11) {

                    return byTagRaw(tag, elem) || toArray(elem.getElementsByTagName(tag));

                } else {

                    return toArray(elem.getElementsByTagName(tag));
                }
            }
        },

        /**
         * Get the attribute value
         */

        'attr': function (elem, attribute) {
            return getAttribute(elem, attribute) ||
                IranianWalker(all(elem), 'f', function (e) {
                    return Jiesa.filters.attr(e, attribute);
                });
        },

        // relative selectors

        'rel': function (elem, sel) {

            if (!elem) {
                return false;
            }

            if (sel === ' ') {
                return elem && elem !== hAzzle.docElem && elem.parentNode;
            }

            // Next Adjacent Selector

            if (sel === '+') {
                return [Jiesa.nextElementSibling(elem)];
            }
			
			if (sel === '++') {
				// +
				// !+
            }
			
			if (sel === '~~') {
				// ~
				// !~
               // return [Jiesa.nextElementSibling(elem)];
            }

            // Child Selector

            if (sel === '>') {

                return IranianWalker(elem.childNodes, 'f', function (e) {
                    return e.nodeType === 1;
                });
            }

            // Next Siblings Selector 

            if (sel === '~') {
                var children;
                return (elem.parentNode && (children = elem.parentNode.children)) ? IranianWalker(children, 'f', function (e) {
                    return Jiesa.filters.rel(e, '~', elem);
                }) : [];
            }
			
			/**
			 * Need to add:
			 *
			 *  '!' !>' '!+':
			 */

        },

        'pseudo': function (elem, sel) {
            return IranianWalker(all(elem), 'f', function (e) {
                return Jiesa.filters.pseudo(e, sel);
            });
        }
    },

    // and as the name suggests, these filter the nodes to match a selector part

    // and as the name suggests, these filter the nodes to match a selector part

    filters: {

        'id': function (elem, sel) {

            return (elem.id && elem.id === sel.replace('#', ''));
        },

        'Class': function (elem, sel) {

            // If ClassList are supported by the browser, use it !!			

            var className = sel.replace('.', ''),
                cn = elem.className,
                nT = elem.nodeType;

            if (typeof cn === "string") {
                return csp ? elem.classList.contains(className) :
                    nT === 1 && cn && (' ' + className + ' ').replace(Jiesa.whitespace, ' ').indexOf(cn) >= 0;
            } else {
                return typeof elem.getAttribute !== undefined && elem.getAttribute("class") || "";
            }
        },

        'tag': function (elem, sel) {
            return (elem.tagName && elem.tagName.toLowerCase() === sel.toLowerCase());
        },

        'attr': function (elem, sel) {

            /**
             * Mehran!!
             *
             * We could have used our own hAzzle.attr() to grab the
             * attribute, but I think that is slowe. So I creted my
             * own solution.
             */

            var info = Jiesa.regex.attr.exec(sel),
                attr = getAttribute(elem, info[1]);

            if (!info[2] || !attr) {
                return !!attr;
            }

            if (info[2] && info[3]) {

                var value = info[3].replace(/^['"]|['"]$/g, ''),
                    operator = info[2];

                attr += "";

                /**
                 * Special attribute - Regex Attribute Selector
                 * It gives the ability to match attributes with a regexp.
                 *
                 *  hAzzle('div[id/= [ RegEX ] ')
                 */

                if (value && operator === '/=') {

                    var modifiers = value.match(/\s(\w+)$/) || ['', ''];
                    value = value.replace(/\\/g, '\\\\').replace(modifiers[0], '');
                    return RegExp(value, modifiers[1]).test(attr);
                }

                return value && operator === "==" ? attr === value :
                    operator === "=" ? attr === value :
                    operator === "!=" ? attr !== value :
                    operator === "^=" ? attr.indexOf(value) === 0 :
                    operator === "*=" ? attr.indexOf(value) > -1 :
                    operator === "$=" ? attr.slice(-value.length) === value :
                    operator === "~=" ? (' ' + attr + ' ').indexOf(value) > -1 :
                    operator === "|=" ? attr === value || attr.slice(0, value.length + 1) === value + '-' :
                    false;

            }
            return false;
        },

        'rel': function (elem, sel, relElem) {

            if (sel === '+') {
                var prev = elem.previousElementSibling || elem.previousSibling;
                while (prev && prev.nodeType != 1) {
                    prev = prev.previousSibling;

                }
                return prev === relElem;
            }

            if (sel === '~') {

                return elem !== relElem && elem.parentNode === relElem.parentNode;
            }

            if (sel === '>') {
                return elem.parentNode === relElem;
            }



            return false;
        },

        'pseudo': function (elem, sel) {

            var pseudo = sel.replace(Jiesa.regex.pseudo, '$1'),
                info = sel.replace(Jiesa.regex.pseudo, '$2');

            // Mehran!!! Find a better solution here. try / catch are slow       

            try {
                return Jiesa.pseudo_filters[pseudo](elem, info);

            } catch (e) {
                hAzzle.error("Sorry!");
            }

        }
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

                return hAzzle.matchesSelector(context, selector);
            }

            // loop through

            for (; i < l; i++) {

                if (hAzzle.matchesSelector(context[i], selector)) {

                    result.push(context[i]);
                }
            }
        }

        return result;
    }

}, Jiesa);

/**
 * Adjust document
 *
 * @param {string} context
 * @return {Object}
 */

function AdjustDocument(context) {

    // Make sure we always are using the correct documents 

    if ((context ? context.ownerDocument || context : doc) !== document) {

        // Override the already defined document
        doc = hAzzle.setDocument(context);
    }

    // Default window.document / hAzzle.document	 

    var nodes = [doc];

    if (context) { //context can be a node, nodelist, array, document
        if (context instanceof Array) {
            nodes = context;
        } else if (context.length) {
            nodes = toArray(nodes);
        } else if (context.nodeType === 1) {
            nodes = [context];
        }
        //throw error for invalid context? 
    }

    return nodes;
}

/**
 * Collect, and identify all selectors.
 *
 * @param {Object} nodes
 * @return {Object} 
 *
 */
 
function Collector(nodes) {

    var i = 0,
        ret = [],
        l = nodes.length,
        chunk, elem;

    for (; i < l; i++) {

        elem = nodes[i];
        chunk = chunkCache[nodes[i]];

        if (!chunk) {
            ret.push({
                text: nodes[i],
                type: identify(nodes[i])
            });

            // Cache the 'chunk'
            chunk = chunkCache(nodes[i], ret)
        }
    }

    return ret;
}

function IranianWalker(nodes, mode, fn) {
    if (nodes) {

        var nativeMethod = {
                f: hAzzle.filter,
                m: hAzzle.map,
                a: hAzzle.each
            }[mode],
            i = 0,
            ret = [],
            l = nodes.length,
            elem, result;

        if (nativeMethod && nodes[nativeMethod]) {

            return nodes[nativeMethod].call(nodes, fn);
        }

        for (; i < l; i++) {

            elem = nodes[i],
                result = fn.call(nodes, elem, i, nodes);

            switch (mode) {
            case 'f':
                if (result) ret.push(elem);
                break;
            case 'c':
                ret = ret.concat(toArray(result));
                break;
            case 'm':
                ret.push(result);
            }
        }

        return ret;
    }
}

//identify a chunk. Is it a class/id/tag etc?
function identify(chunk) {

    var type;

    /**
     * Mehran!!
     *
     * Dirty fix to solve the nth problem with
     * relative attributes. Need to find a better
     * solution for this. Maybe Sizzle solution
     * where they filter on 'child'
     */
    var reg = Jiesa.regex;

    if (reg.nth.test(chunk)) {
        return 'pseudo';
    }

    for (type in Jiesa.regex) {

        if (Jiesa.regex[type].test(chunk)) return type;
    }
    return false;
}

//just to prevent rewriting over and over...
function all(elem) {
    return elem.all ? elem.all : elem.getElementsByTagName('*');
}

/** 
 * Mehran!
 *
 * I had to do it the ugly way, check if this is an fast
 * solution. If not, speed it up
 *
 */
function byTagRaw(tag, elem) {
    var any = tag === '*',
        element = elem,
        elements = [],
        next = element.firstChild;

    any || (tag = tag.toUpperCase());

    while ((element = next)) {
        if (element.tagName > '@' && (any || element.tagName.toUpperCase() == tag)) {
            elements[elements.length] = element;
        }
        if ((next = element.firstChild || element.nextSibling)) {
            continue;
        }
        while (!next && (element = element.parentNode) && element !== elem) {
            next = element.nextSibling;
        }
    }
    return elements;
}

function byIdRaw(id, elem) {
    return IranianWalker(all(elem), 'f', function (e) {
        return e.getAttribute('id') === id;
    });
}

// getAttribute

function getAttribute(elem, attribute) {

    // Set document vars if needed

    if ((elem.ownerDocument || elem) !== document) {
        doc = hAzzle.setDocument(elem);
    }

    // Lower case are always a good thing !!	 

    attribute = attribute.toLowerCase();
    if (typeof elem[attribute] === 'object') {
        return elem.attributes[attribute] &&
            elem.attributes[attribute].value || '';
    }
    return (
        attribute === 'type' ? elem.getAttribute(attribute) || '' :
        boolElem[attribute] ? elem.getAttribute(attribute, 2) || '' :
        booleans[attribute] ? elem.getAttribute(attribute) ? attribute : 'false' :

        // Support: IE<9
        // Use getAttributeNode to fetch booleans when getAttribute lies

        ((elem = elem.getAttributeNode(attribute)) && elem.value) || '');
}

function createCache() {
    var keys = [];

    function cache(key, value) {
        if (keys.push(key + " ") > 70) {
            delete cache[keys.shift()];
        }
        return (cache[key + " "] = value);
    }
    return cache;
}


// Some adjustments...

hAzzle.matches = Jiesa.matches;