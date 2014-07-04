/**

      WORK IN PROGRESS!!!!!!!!!!!!!!
	  
	  
                            	  WORK IN PROGRESS!!!!!!!!!!!!!!
								  
								  
         WORK IN PROGRESS!!!!!!!!!!!!!!								  


DO NOT CHANGE ANYTHING HERE OR TOUCH IT YET !!!

*/

var win = this,
    doc = win.document,
    documentIsHTML = hAzzle.documentIsHTML,
    csp = hAzzle.features.classList,
    Jiesa = hAzzle.Jiesa;

hAzzle.extend({

    parse: function (selector, context) {

        if (!selector || Jiesa.regex.space.test(selector) || !selector.charAt) return [];
        selector = selector.replace(/^\s+|\s+$/, '').replace(/\s?([\+~\>])\s?/g, ' $1'); //some internal fixing.

        var i = 0,
            pieceStore = [],
            nodes = [doc],
            l,
            piece,
            piece1, j = 0,
            k,
            info, inf,
            chunks;

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
        /**
         * Tokenizing
         *
         * We can do that if we create an array with
         * all the different parts of the selector
         */

        chunks = array_walk(selectorSplit(selector), 'm', function (sel) {

            return {
                text: sel,
                type: identify(sel)
            };
        });

        if ((l = chunks.length)) {

            // create the node set

            for (; i < l; i++) {

                if (nodes.length === 0 || chunks.length === 0) {

                    return []; //no point carrying on if we run out of nodes.
                }

                piece = chunks[i];

                if (!piece.type) {

                    hAzzle.error('Invalid Selector: ' + piece.text);

                }

                if (piece.type !== 'space' && chunks[i + 1]) {

                    pieceStore.push(piece);

                    //We push all non-descendant selectors into piece store until we hit a space in the selector.

                } else {

                    if (piece.type !== 'space' && piece.type !== 'changer') {

                        pieceStore.push(piece);
                    }

                    //now we begin. Grab the first piece, as the starting point, then perform the filters on the nodes.

                    piece1 = pieceStore.shift();
                    k = pieceStore.length;

                    nodes = array_walk(nodes, 'c', function (elem) {
                        return elem ? Jiesa.getters[piece1.type](elem, piece1.text, context) : [];
                    });

                    //now perform filters on the nodes.
                    for (; j < k; j++) {

                        //a 'changer' changes the nodes completely, rather than adding to them.
                        if (pieceStore[j].type === 'changer') {
                            info = Jiesa.regex.changer.exec(pieceStore[j].text);
                            nodes = Jiesa.changers[info[1]](nodes, parseInt(info[2])); //sooo ugly.
                            continue;
                        }

                        nodes = array_walk(nodes, 'f', function (elem) {
                            return elem ?
                                Jiesa.filters[pieceStore[j].type](elem, pieceStore[j].text) : false;
                        });
                    }

                    if (piece.type === 'changer') {

                        inf = Jiesa.regex.changer.exec(piece.text);
                        nodes = Jiesa.changers[inf[1]](nodes, parseInt(inf[2]));
                    }

                    pieceStore = [];
                }
            }
        }
        return nodes;
    },


    regex: {

        'id': /^#((?:\\.|[\w-]|[^\x00-\xa0])+)/,
        'Class': /^\.((?:\\.|[\w-]|[^\x00-\xa0])+)/,
        'tag': /^((?:\\.|[\w-]|[^\x00-\xa0])+|[*])/,
        'rel': /^\>|\+|~$/,
        'attr': /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\x00-\xa0])+))|)[\x20\t\r\n\f]*\]/,
        'changer': /^:(eq|gt|lt|first|last|odd|even|nth)(?:\((\d+)\))?$/,
        'pseudo': /^:([\w\-]+)(?:\((.+?)\))?$/,
        'space': /^\s+$/
    },
    getters: {

        'id': function (elem, id) {

            // Mehran!! Add fallback for XML. You can do it! You know it !!!

            if (typeof elem.getElementById !== undefined && hAzzle.documentIsHTML) {
                id = id.replace('#', '');
                var m = elem.getElementById ? elem.getElementById(id) : doc.getElementById(id);
                return m && m.parentNode ? [m] : [];
            }
        },

        'Class': function (elem, sel) {
            sel = sel.replace('.', '');

            if (elem.getElementsByClassName && !documentIsHTML) {
                return toArray(elem.getElementsByClassName(sel));

                // Mehran!
                // This should work on XML docs as well
                // But it's damn slow if we have a HUGE DOM tree !!
                // You fix this !

            } else {

                return array_walk(all(elem), 'f', function (e) {
                    return Jiesa.filters.Class(e, sel);
                });
            }
        },

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
                if (typeof elem.getElementsByTagName !== undefined) {
                    return toArray(elem.getElementsByTagName(tag));
                }
            }
        },

        'attr': function (elem, sel) {



            return array_walk(all(elem), 'f', function (e) {
                return Jiesa.filters.attr(e, sel);
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

            if (sel === '+') {
                var next = elem.nextElementSibling || elem.nextSibling;
                while (next && next.nodeType !== 1) {
                    next = next.nextSibling;
                }
                return [next];
            }

            if (sel === '>') {
                return array_walk(elem.childNodes, 'f', function (e) {
                    return e.nodeType === 1;
                });
            }

            if (sel === '~') {

                var children;
                return (elem.parentNode && (children = elem.parentNode.children)) ? array_walk(children, 'f', function (e) {
                    return Jiesa.filters.rel(e, '~', elem);
                }) : [];
            }

        },

        'pseudo': function (elem, sel) {

            return array_walk(all(elem), 'f', function (e) {
                return Jiesa.filters.pseudo(e, sel);
            });
        }
    },

    // and as the name suggests, these filter the nodes to match a selector part

    filters: {

        'id': function (elem, sel) {

            return (elem.id && elem.id === sel.replace('#', ''));
        },

        'Class': function (elem, sel) {

            // If ClassList are supported by the browser, use it !!			

            var cn = elem.className,
                nT = elem.nodeType;

            return nT === 1 && csp ? elem.classList.contains(sel.replace('.', '')) :
                nT === 1 && cn && (' ' + sel.replace('.', '') + ' ').replace(Jiesa.whitespace, ' ').indexOf(cn) >= 0;
        },

        'tag': function (elem, sel) {
            return (elem.tagName && elem.tagName.toLowerCase() === sel.toLowerCase());
        },

        'attr': function (elem, sel) {

            var info = Jiesa.regex.attr.exec(sel),

                // We use the native hAzzle.attr() function here

                attr = hAzzle.attr(elem, info[1]);

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

                if (operator === '/=') {

                    var modifiers = value.match(/\s(\w+)$/) || ['', ''];
                    value = value.replace(/\\/g, '\\\\').replace(modifiers[0], '');
                    return RegExp(value, modifiers[1]).test(attr);
                }

                return operator === "==" ? attr === value :
                    operator === "=" ? attr === value :
                    operator === "!=" ? attr !== value :
                    operator === "^=" ? value && attr.indexOf(value) === 0 :
                    operator === "*=" ? value && attr.indexOf(value) > -1 :
                    operator === "$=" ? value && attr.slice(-value.length) === value :
                    operator === "~=" ? (" " + attr + " ").indexOf(value) > -1 :
                    operator === "|=" ? attr === value || attr.slice(0, value.length + 1) === value + "-" :
                    false;

            }
            return false;
        },

        'rel': function (elem, sel, relElem) {

            switch (sel) {
            case '+':
                var prev = elem.previousElementSibling || elem.previousSibling;
                while (prev && prev.nodeType != 1) {
                    prev = prev.previousSibling;

                }
                return prev === relElem;
            case '~':
                return elem !== relElem && elem.parentNode === relElem.parentNode;
            case '>':
                return elem.parentNode === relElem;
            }
            return false;
        },

        'pseudo': function (elem, sel) {
            var pseudo = sel.replace(Jiesa.regex.pseudo, '$1'),
                info = sel.replace(Jiesa.regex.pseudo, '$2');

            return Jiesa.pseudo_filters[pseudo](elem, info); //we're going into another object again for pseudos.
        }
    }

}, Jiesa);




//MODE: f = filter, m = map, c = concat (fn returns arr to concat), a = all (forEach), no mode is essentially forEach
function array_walk(nodes, mode, fn) {
    if (nodes) {

        var nativeMethod = {
                f: hAzzle.filter,
                m: hAzzle.map,
                a: 'forEach'
            }[mode],
            i = 0,
            ret = [],
            l = nodes.length,
            elem, result;

        if (nativeMethod && nodes[nativeMethod]) {
            return nodes[nativeMethod].call(nodes, fn);
        }

        for (; i < l; i++) {
            elem = nodes[i], result = fn.call(nodes, elem, i, nodes);

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

function toArray(item) {
    return array_walk(item, 'm', function (o) {
        return o;
    });
}


//split the selector into a manageable array. 
function selectorSplit(selector) {
    var chunky = /(?:#[\w\d_-]+)|(?:\.[\w\d_-]+)|(?:\[(\w+(?:-\w+)?)(?:([\$\*\^!\|~\/]?=)(.+?))?\])|(?:[\>\+~])|\w+|\s|(?::[\w-]+(?:\([^\)]+\))?)/g;
    return selector.match(chunky) || [];
}

//identify a chunk. Is it a class/id/tag etc?
function identify(chunk) {
    var type;
    for (type in Jiesa.regex) {
        if (Jiesa.regex[type].test(chunk)) return type;
    }
    return false;
}

//just to prevent rewriting over and over...
function all(elem) {
    return elem.all ? elem.all : elem.getElementsByTagName('*');
}