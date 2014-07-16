    var _slice = Array.prototype.slice,

        expr = {
            operators: /[>+]/g,
            multiplier: /\*(\d+)$/,
            id: /#[\w-$]+/g,
            tagname: /^\w+/,
            classname: /\.[\w-$]+/g,
            attributes: /\[([^\]]+)\]/g,
            values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
            numbering: /[$]+/g,
            text: /\{(.+)\}/
        };


    hAzzle.html = function (str, data) {

        var parts = str.split(expr.operators).map(Function.prototype.call, String.prototype.trim),
            tree = document.createDocumentFragment(),
            parents,
        matches;

        parents = [tree];

        hAzzle.each(parts, function (original) {

            var part = original,
                op = (expr.operators.exec(str) || [])[0],
                count = 1,
                tag,
                id,
                classes,
                text,
                index, _index, element,
                attrs = {};


            if ((matches = part.match(expr.attributes))) {
                var matched = matches[matches.length - 1];
                while ((matches = expr.values.exec(matched))) {
                    attrs[matches[1]] = (matches[4] || '').replace(/['"]/g, '').trim();
                }
                part = part.replace(expr.attributes, '');
            }

            // #### Multipliers
            if ((matches = part.match(expr.multiplier))) {
                var times = +matches[1];
                if (times > 0) count = times;
            }

            // #### IDs
            if ((matches = part.match(expr.id))) {
                id = matches[matches.length - 1].substr(1);
            }

            // #### Tag names
            if ((matches = part.match(expr.tagname))) {
                tag = matches[0];
            } else {
                tag = 'div';
            }

            // #### Class names
            if ((matches = part.match(expr.classname))) {
                classes = matches.map(function (c) {
                    return c.substr(1);
                }).join(' ');
            }

            // #### Text
            if ((matches = part.match(expr.text))) {
                text = matches[1];
                if (data) {
                    text = text.replace(/\$(\w+)/g, function (m, key) {
                        return data[key];
                    });
                }
            }

            // Insert `count` copies of the element per parent. If the current operator
            // is `+` we mark the elements to remove it from `parents` in the next iteration.
            hAzzle.each(_slice.call(parents, 0), function (parent, parentIndex) {
                for (index = 0; index < count; index++) {
                    // Use parentIndex if this element has a count of 1
                    _index = count > 1 ? index : parentIndex;

                    element = Element(_index, tag, id, classes, text, attrs);
                    if (op === '+') element._sibling = true;

                    parent.appendChild(element);
                }
            });

            // If the next operator is '>' replace `parents` with their childNodes for the next iteration.
            if (op === '>') {
                parents = parents.reduce(function (p, c) {
                    return p.concat(_slice.call(c.childNodes, 0).filter(function (el) {
                        return el.nodeType === 1 && !el._sibling;
                    }));
                }, []);
            }

        });

        var div = document.createElement('div');
        div.appendChild(tree.cloneNode(true));

        return hAzzle(div);
    };




    // Pads number `n` with `ln` zeroes.
    function pad(n, ln) {
        n = n.toString();
        while (n.length < ln) {
            n = '0' + n;
        }
        return n;
    }

    // Replaces ocurrences of '$' with the equivalent padded index.
    // `$$ == 01`, `$$$$ == 0001`
    function numbered(value, n) {
        return value.replace(expr.numbering, function (m) {
            return pad(n + 1, m.length);
        });
    }

	    // Create a DOM element.
    function Element(index, tag, id, className, text, attrs) {

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