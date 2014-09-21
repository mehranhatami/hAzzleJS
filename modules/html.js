// html.js
var slice = Array.prototype.slice,
    call = Function.prototype.call,
    trim = String.prototype.trim,
    hWhite = /\$(\w+)/g,
    hTrimspaces = /^\s*|\s*$/g,
    hRepl = /['"]/g,
    hId = /#([\w-$]+)/g,
    hTagname = /^\w+/,
    hClassname = /\.[\w-$]+/g,
    hOperators = /[>+]/g,
    hMultiplier = /\*(\d+)$/,
    hAttributes = /\[([^\]]+)\]/g,
    hValues = /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
    hNumbers = /[$]+/g,
    hText = /\{(.+)\}/,

    twist = function(arr, fn, scope) {
        var result = [],
            i = 0,
            l = arr.length;
        for (; i < l; i++)
            result.push(fn.call(scope, arr[i], i));
        return result;
    },

    operators = {

        '>': function(parents) {
            return hAzzle.reduce(parents, function(p, c) {
                return p.concat(slice.call(c.childNodes, 0).filter(function(el) {
                    return el.nodeType === 1 && !el._sibling;
                }));
            }, []);
        }
    },

    Adjacents = {

        '+': function(el) {
            return el._sibling = true;
        },
        '-': function(el) {
            return el._sibling = false;
        }
    },
    pad = function(n, ln) {

        n = n.toString();

        while (n.length < ln) {

            n = '0' + n;
        }

        return n;
    },
    numbered = function(value, num) {

        return value.replace(hNumbers, function(m) {
            return pad(num + 1, m.length);
        });
    },
    createDOMElement = function(index, tag, id, className, text, attrs) {

        var key, element = document.createElement(tag);

        if (id) {

            element.id = numbered(id, index);
        }

        if (className) {

            element.className = numbered(className, index);
        }

        if (text) {

            element.appendChild(document.createTextNode(text));
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
    };

hAzzle.extend({

    // Limit for how many DOM elements that can be
    // created at the same time (default: 100);

    maxTags: 100,

    /**
     * Create HTML
     *
     * @param {String} str
     * @param {Undefined/Object} data
     * @return {Object}
     */

    parseHTML: function(str, data) {

        if (!str) {

            return;
        }

        // Remove whitespace

        str = str.replace(hTrimspaces, '');

        var nodes = [],
            parts = twist(str.split(hOperators), call, trim),
            fragment = document.createDocumentFragment(),
            aa = [],
            i, parents = [fragment],
            matches, matched,
            op = (hOperators.exec(str) || [])[0],
            attrs = {};

        hAzzle.each(parts, function(part) {

            var count = 1,
                tag, id,
                classes, text, index, _index, element;

            // Check for attribute match

            if ((matches = part.match(hAttributes))) {

                matched = matches[matches.length - 1];

                // Mehran!!
                // Make sure regEx check are not happening inside a while-loop

                while ((matches = hValues.exec(matched))) {

                    attrs[matches[1]] = (matches[4] || '').replace(hRepl, '').trim();
                }

                part = part.replace(hAttributes, '');
            }

            // Multipliers

            if ((matches = part.match(hMultiplier))) {

                count = +matches[1];

                // We don't want to create millions of the same DOM element, 
                // so we set an limit (default:100)

                if (count > hAzzle.maxTags) {

                    count = hAzzle.maxTags;
                }
            }

            // ID

            if ((matches = part.match(hId))) {

                id = matches[matches.length - 1].slice(1);
            }

            // Tag

            if ((matches = part.match(hTagname))) {

                tag = matches[0];

            } else {

                tag = 'div';
            }

            // Class

            if ((matches = part.match(hClassname))) {

                classes = twist(matches, function(c) {
                    return c.slice(1);
                }).join(' ');
            }

            // Text

            if ((matches = part.match(hText))) {
                text = matches[1];

                if (data) {

                    text = text.replace(hWhite, function(m, key) {
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

        fragment.innerHTML = '';
        fragment.textContent = '';

        return hAzzle(nodes);
    }
});