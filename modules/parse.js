var slice = Array.prototype.slice,
    call = Function.prototype.call,
    trim = String.prototype.trim,

    // Various regEx

    matchExpr = {
        repl: /['"]/g,
        operators: /[>+]/g,
        multiplier: /\*(\d+)$/,
        id: /#([\w-$]+)/g,
        tagname: /^\w+/,
        classname: /\.[\w-$]+/g,
        attributes: /\[([^\]]+)\]/g,
        values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
        numbering: /[$]+/g,
        text: /\{(.+)\}/
    },

    /**
     * Faster Reduce then native Prototype
     *
     * @param {Array} array
     * @param {Function} fn
     * @param {Object} initial value
     */

    reduce = function (arr, fn, val) {
        var rval = val,
            i = 0,
            l = arr.length;

        for (; i < l; i++) {

            rval = fn(rval, arr[i], i, arr);
        }

        return rval;
    },

    twist = function (arr, fn, scope) {
        var result = [],
            i = 0,
            l = arr.length;
        for (; i < l; i++)
            result.push(fn.call(scope, arr[i], i));
        return result;
    };

hAzzle.html = function (str, data) {

    var nodes = [],
        parts = twist(str.split(matchExpr.operators), call, trim),
        fragment = document.createDocumentFragment(),
        aa, i, parents = [fragment],
        matches, matched,
        op = (matchExpr.operators.exec(str) || [])[0],
        attrs = {};

    hAzzle.each(parts, function (part) {

        var count = 1,
            tag,
            id,
            classes,
            text,
            index, _index, element;

        if ((matches = part.match(matchExpr.attributes))) {

            matched = matches[matches.length - 1];

            while ((matches = matchExpr.values.exec(matched))) {

                attrs[matches[1]] = (matches[4] || '').replace(matchExpr.repl, '').trim();
            }

            part = part.replace(matchExpr.attributes, '');
        }

        // Multipliers
        if ((matches = part.match(matchExpr.multiplier))) {
            var times = +matches[1];
            if (times > 0) count = times;
        }

        // ID
        if ((matches = part.match(matchExpr.id))) {
            id = matches[matches.length - 1].substr(1);
        }

        // Tag names
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
                text = text.replace(/\$(\w+)/g, function (m, key) {
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
                if (op === '+') element._sibling = true;

                aa[i].appendChild(element);
            }
        }

        // If the next operator is '>' replace `parents` with their childNodes for the next iteration.

       if (op === '>') {

            parents = reduce(parents, function (p, c) {

                return p.concat(slice.call(c.childNodes, 0).filter(function (el) {
                    return el.nodeType === 1 && !el._sibling;
                }));
            }, []);
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

// Replaces ocurrences of '$' with the equivalent padded 
// index (e.g  `$$ == 01`, `$$$$ == 0001` )

function numbered(value, n) {

    return value.replace(matchExpr.numbering, function (m) {
        return pad(n + 1, m.length);
    });
}

// Create a DOM element.
function createDOMElement(index, tag, id, className, text, attrs) {

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
}