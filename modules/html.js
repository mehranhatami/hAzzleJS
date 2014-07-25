// Generate HTML

var doc = this.document,
    slice = Array.prototype.slice,
    call = Function.prototype.call,
    trim = String.prototype.trim,

    // Various regEx

    matchExpr = {
        
		// Should we accept creation of script tags or not??
		// I put it here in case we decide not to
        scripttag: /\s*<script +src=['"]([^'"]+)['"]>/,
        white: /\$(\w+)/g,
        trimspaces: /^\s*|\s*$/g,
        repl: /['"]/g,
        id: /#([\w-$]+)/g,
        tagname: /^\w+/,
        classname: /\.[\w-$]+/g,
        operators: /[>+]/g,
        multiplier: /\*(\d+)$/,
        attributes: /\[([^\]]+)\]/g,
        values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
        numbers: /[$]+/g,
        text: /\{(.+)\}/
    },

    twist = function (arr, fn, scope) {
        var result = [],
            i = 0,
            l = arr.length;
        for (; i < l; i++)
            result.push(fn.call(scope, arr[i], i));
        return result;
    },

    // MEHRAN!
    // Todo! Add more operators

    operators = {

        '>': function (parents) {

            return hAzzle.reduce(parents, function (p, c) {
                return p.concat(slice.call(c.childNodes, 0).filter(function (el) {
                    return el.nodeType === 1 && !el._sibling;
                }));
            }, []);
        }
    },

    Adjacents = {

        '+': function (el) {
            return el._sibling = true;
        },
        '-': function (el) {
            return el._sibling = false;
        }
    };

// Limit for how many DOM elements that can be
// created at the same time (default: 100);

hAzzle.maxTags = 100;

/**
 * Create HTML
 *
 * @param {String} str
 * @param {Undefined/Object} data
 * @return {Object}
 */

hAzzle.html = function (str, data) {

    if (!str) {

        return;
    }

    // Remove whitespace

    str = str.replace(matchExpr.trimspaces, '');

    var nodes = [],
        parts = twist(str.split(matchExpr.operators), call, trim),
        fragment = doc.createDocumentFragment(),
        aa = [],
        i, parents = [fragment],
        matches, matched,
        op = (matchExpr.operators.exec(str) || [])[0],
        attrs = {};

    hAzzle.each(parts, function (part) {

        var count = 1,
            tag, id,
            classes, text, index, _index, element;

        if ((matches = part.match(matchExpr.attributes))) {

            matched = matches[matches.length - 1];

            while ((matches = matchExpr.values.exec(matched))) {

                attrs[matches[1]] = (matches[4] || '').replace(matchExpr.repl, '').trim();
            }

            part = part.replace(matchExpr.attributes, '');
        }

        // Multipliers
        if ((matches = part.match(matchExpr.multiplier))) {

            count = +matches[1];

            // We don't want to create millions of the same DOM element, 
            // so we set an limit (default:100)

            if (count > hAzzle.maxTags) {

                count = hAzzle.maxTags;
            }
        }

        // ID
        if ((matches = part.match(matchExpr.id))) {
            id = matches[matches.length - 1].substr(1);
        }

        // Tag

        if ((matches = part.match(matchExpr.tagname))) {

            tag = matches[0];

        } else {

            tag = 'div';
        }

        // Class

        if ((matches = part.match(matchExpr.classname))) {

            classes = twist(matches, function (c) {
                return c.substr(1);
            }).join(' ');
        }

        // Text

        if ((matches = part.match(matchExpr.text))) {
            text = matches[1];

            if (data) {

                text = text.replace(matchExpr.white, function (m, key) {
                    return data[key];
                });
            }
        }

        aa = slice.call(parents, 0);

        i = aa.length;

        while (i--) {

            for (index = 0; index < count; index++) {

                // Use parentIndex if this element has a count of 1

                _index = count > 1 ? index : i;

                element = createDOMElement(_index, tag, id, classes, text, attrs);

                // Adjacents selectors

                if (Adjacents[op]) {
                    Adjacents[op];
                }

                aa[i].appendChild(element);
            }
        }

        if (operators[op]) {
            // If the next operator is '>' replace `parents` with their childNodes for the next iteration.

            if (op === '>') {

                parents = operators[op](parents) || parents;
            }
        }

    });

    // Remove wrapper from fragment

    nodes = hAzzle.merge(nodes, fragment.childNodes);

    fragment.innerHTML = "";
    fragment.textContent = "";

    return hAzzle(nodes);

};

/**
 * Pads number `n` with `ln` zeroes.
 * @param {Number} n
 * @param {Number} ln
 * @return {String}
 */

function pad(n, ln) {

    n = n.toString();

    while (n.length < ln) {

        n = '0' + n;
    }

    return n;
}

/**
 * Replaces ocurrences of '$' with the equivalent padded
 * index (e.g  `$$ == 01`, `$$$$ == 0001` )
 *
 * @param {String} value
 * @param {number} num
 *
 *
 */


function numbered(value, num) {

   return value.replace(matchExpr.numbers, function (m) {
        return pad(num + 1, m.length);
    });
}

/**
 * Create a DOM element.
 *
 * @param {Number} index
 * @param {string|undefined} tag
 * @param {string|undefined} id
 * @param {string|undefined} className
 * @param {string|undefined} text
 * @param {Object} attrs
 *
 */

function createDOMElement(index, tag, id, className, text, attrs) {

    var key, element = doc.createElement(tag);

    if (id) {

        element.id = numbered(id, index);
    }

    if (className) {

        element.className = numbered(className, index);
    }

    if (text) {

        element.appendChild(doc.createTextNode(text));
    }

    if (attrs) {

        for (key in attrs) {

            if (!attrs.hasOwnProperty(key)) {

                continue;
            }

            element.setAttribute(key, numbered(attrs[key], index));
        }
    }

    return element;
}