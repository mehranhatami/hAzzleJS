/**
 * HTML
 *
 * hAzzle's HTML parser is totally different from other Javascript libraries such as jQuery and Zepto.
 *
 * We are not allowing creation of HTML with the hAzzle(HTML) syntax. The append, prepend and other functions
 * automaticly take care of this things.
 *
 * hAzzle HTML parser still does a lot of work and testing, but works like this:
 *
 *  HTML('tag')    - creates a single tag wrapped inside '<' and '>'
 *  HTML('<div>')  - creates two div tags wrapped inside each other
 *  HTML('div#test')  - creates a div with id(#) test
 *  HTML('div#one#two')  - creates a div with id(#) two ( last definition is used )
 *  HTML('div.test')  - creates a div with class.(#) test
 *  HTML('div.one.two.three.four-five_six')  - creates a div with classes (.) one two three four-five_six
 *
 * Other examples
 * ==============
 *
 * HTML('div[title = "hello you" ,data-bacon= 1]') - creates a div with data-bacon = 1 and title="hello you"
 * HTML('div{hello}')   creates an div tag with the text "hello"
 * HTML('div{hello $x$y}', { x: 'world', y: '!' }) - creates an div tag with hello word !, where x and y are replaced with given text
 * HTML('<ul id="oi"><li class="x"><a></a></li><li class="x"><a></a></li></ul>') - Outputs: <ul id="oi"><li><a></a></li><li><a></a></li></ull>
 */
var slice = Array.prototype.slice,

    exprr = {
        operators: /[>+]/g,
        multiplier: /\*(\d+)$/,
        id: /#[\w-$]+/g,
        tagname: /^\w+/,
        classname: /\.[\w-$]+/g,
        attributes: /\[([^\]]+)\]/g,
        values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
        numbering: /[$]+/g,
        text: /\{(.+)\}/
    },

    cached = [];

// Pads number `n` with `ln` zeroes.
function pad(a, b) {
    for (a = a.toString(); a.length < b;) a = "0" + a;
    return a;
}

/** Replaces ocurrences of '$' with the equivalent padded index.
 * `$$ == 01`, `$$$$ == 0001`
 */

function numbered(value, n) {
    return value.replace(exprr['numbering'], function (m) {
        return pad(n + 1, m.length);
    });
}



hAzzle.extend({

    /**
     * Parse HTML
     *
     * @param{String} str
     * @param{String} selector
     * @param{String} data
     *
     * @return {object}
     *
     * NOTE! If context are set, the created HTML will be appended to the context
     *
     */
    HTML: function (str, data, selector) {

        var parts = cached[str] ? cached[str] : cached[str] = str.split(exprr['operators']).map(Function.prototype.call, String.prototype.trim),

            // Avoid DOM insertion too many times, so we cache
            tree = cached[data] ? cached[data] : cached[data] = document.createDocumentFragment(),
            match,
            parents = [tree];

        // Go over the abbreviations one level at a time, and process
        // corresponding element values

        hAzzle.each(parts, function (i, original) {

            var part = original,
                op = (exprr['operators'].exec(str) || [])[0],
                count = 1,
                tag, id, classes, text, attrs = {};

            // #### Attributes
            // Attributes are parsed first then removed so that it takes precedence
            // over IDs and classNames for the `#.` characters.

            if (match = part.match(exprr['attributes'])) {

                var matched = match[match.length - 1];

                while (match = exprr['values'].exec(matched)) {
                    attrs[match[1]] = (match[4] || '').replace(/['"]/g, '').trim();
                }

                part = part.replace(exprr['attributes'], '');
            }

            // #### Multipliers
            if (match = part.match(exprr['multiplier'])) { 
                var times = +match[1];
                if (times > 0) count = times;
            }

            // #### IDs
            if (match = part.match(exprr['id'])) { 
                id = match[match.length - 1].slice(1);
            }

            // #### Tag names
            if (match = part.match(exprr['tagname'])) {
                tag = match[0];
            } else {
                tag = 'div';
            }

            // #### Class names
            if (match = part.match(exprr['classname'])) { 
                classes = match.map(function (c) {
                    return c.slice(1);
                }).join(' ');
            }

            // #### Text
			
            if (match = part.match(exprr['text'])) { 
                text = match[1];
                if (data) {
                    text = text.replace(/\$(\w+)/g, function (m, key) {
                        return data[key];
                    });
                }
            }

            // Insert `count` copies of the element per parent. If the current operator
            // is `+` we mark the elements to remove it from `parents` in the next iteration.


            hAzzle.each(slice.call(parents, 0), function (parentIndex, parent) {

                for (var index = 0; index < count; index++) {
                    // Use parentIndex if this element has a count of 1
                    var _index = count > 1 ? index : parentIndex;

                    var element = document.createElement(tag);

                    if (id) {

                        element.id = numbered(id, _index);
                    }

                    if (classes) {

                        element.classes = numbered(classes, _index);
                    }

                    if (text) {

                        element.appendChild(document.createTextNode(text));
                    }

                    if (attrs) {

                        for (var key in attrs) {
                            if (!attrs.hasOwnProperty(key)) continue;
                            element.setAttribute(key, numbered(attrs[key], _index));
                        }
                    }

                    if (op === '+') element._sibling = true;

                    parent.appendChild(element);
                }
            });

            // If the next operator is '>' replace `parents` with their childNodes for the next iteration.
            if (op === '>') {
                parents = parents.reduce(function (p, c, i, a) {
                    return p.concat(slice.call(c.childNodes, 0).filter(function (el) {
                        return el.nodeType === 1 && !el._sibling;
                    }));
                }, []);
            }
        });

        // Converts a documentFragment element tree to an HTML string. When a documentFragment
        // is given to `.appendChild` it's *contents* are appended; we need to clone the
        // fragment so that it remains populated and can still be used afer a `toHTML` call.

        var div = document.createElement('div'); /* REMOVE!! in the distro version. There the tag are named "ghost" */

        /*ghost*/
        div.appendChild(tree.cloneNode(true));

        if (selector) {
            hAzzle(selector).append(div);
        } else {
            return div;
        }

    }


});