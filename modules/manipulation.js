// manipulation.js
var simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
    table = ['<table>', '</table>', 1],
    td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
    option = ['<select>', '</select>', 1],
    noscope = ['_', '', 0, 1],
    tagMap = {
        thead: table,
        tbody: table,
        tfoot: table,
        colgroup: table,
        caption: table,
        tr: ['<table><tbody>', '</tbody></table>', 2],
        th: td,
        td: td,
        col: ['<table><colgroup>', '</colgroup></table>', 2],
        fieldset: ['<form>', '</form>', 1],
        legend: ['<form><fieldset>', '</fieldset></form>', 2],
        option: option,
        optgroup: option,
        script: noscope,
        style: noscope,
        link: noscope,
        param: noscope,
        base: noscope,
    },

    createScriptFromHtml = function(html) {
        var scriptEl = document.createElement('script'),
            matches = html.match(simpleScriptTagRe);
        scriptEl.src = matches[1];
        return scriptEl;
    },
    normalize = function(node, clone) {

        if (typeof node === 'string') {
            return hAzzle.create(node);
        }

        if (hAzzle.isNode(node)) {
            node = [node];
        }

        // FIXME! Need to add hAzzle.clone 
        if (clone) {
            var i = 0,
                l = node.length,
                ret = [];
            for (; i < l; i++) {
                ret[i] = node[i].cloneNode(true);
            }
            return ret;
        }
        return node;
    };

hAzzle.extend({

    appendTo: function(target) {
        return this.domManip(target, function(t, el) {
            t.append(el);
        });
    },
    prependTo: function(target) {
        return this.domManip(target, function(t, el) {
            t.prepend(el, t.firstChild);
        }, 1);
    },

    before: function(node) {
        return this.each(function(el, i) {
            hAzzle.each(normalize(node, i), function(i) {
                el.parentNode.insertBefore(i, el);
            });
        });
    },
    after: function(node) {
        return this.each(function(el, i) {
            hAzzle.each(normalize(node, i), function(i) {
                el.parentNode.insertBefore(i, el.nextSibling);
            }, null, 1);
        });
    },
    insertBefore: function(target) {
        return this.domManip(target, function(t, el) {
            t.parentNode.insertBefore(el, t);
        });
    },
    insertAfter: function(target) {
        return this.domManip(target, function(t, el) {
            var sibling = t.nextSibling;
            sibling ?
                t.parentNode.insertBefore(el, sibling) :
                t.parentNode.appendChild(el);
        }, 1);
    },
    replaceWith: function(node) {
        return this.each(function(el, i) {
            hAzzle.each(normalize(node, i), function(i) {
                el.parentNode && el.parentNode.replaceChild(i, el);
            });
        });
    },

    domManip: function(target, fn, rev) {
        var i = 0,
            self = this,
            r = [],
            nodes = typeof target == 'string' && target.charAt(0) !== '<' ? hAzzle(target) : target;

        // Normalize each node in case it's still a string and we need to create nodes on the fly

        hAzzle.each(normalize(nodes), function(t, j) {
            hAzzle.each(self, function(el) {
                fn(t, r[i++] = j > 0 ? el.cloneNode(true) : el);
            }, null, rev);
        }, this, rev);
        self.length = i;
        hAzzle.each(r, function(e) {
            self[--i] = e;
        }, null, !rev);
        return this;
    }
});

hAzzle.create = function(node) {
    return typeof node == 'string' && node !== '' ?
        function() {
            if (simpleScriptTagRe.test(node)) {
                return [createScriptFromHtml(node)];
            }
            var tag = node.match(/^\s*<([^\s>]+)/),
                el = document.createElement('div'),
                els = [],
                p = tag ? tagMap[tag[1].toLowerCase()] : null,
                dep = p ? p[2] + 1 : 1,
                ns = p && p[3],
                pn = 'parentNode';

            el.innerHTML = p ? (p[0] + node + p[1]) : node;
            while (dep--) {
                el = el.firstChild;
            }
            // for IE NoScope, we may insert cruft at the begining just to get it to work
            if (ns && el && el.nodeType !== 1) {
                el = el.nextSibling;
            }
            do {
                if (!tag || el.nodeType == 1) {
                    els.push(el);
                }
            } while (el = el.nextSibling);
            // IE < 9 gives us a parentNode which messes up insert() check for cloning
            // `dep` > 1 can also cause problems with the insert() check (must do this last)
            hAzzle.each(els, function(el) {
                el[pn] && el[pn].removeChild(el);
            });
            return els;
        }() : hAzzle.isNode(node) ? [node.cloneNode(true)] : [];
};



// append, prepend

hAzzle.each([
    'append',
    'prepend'
], function(name) {
    hAzzle.Core[name] = function(node) {
        return this.each(function(el, i) {
            if (el.nodeType === 1 ||
                el.nodeType === 11 ||
                el.nodeType === 9
            ) {
                hAzzle.each(normalize(node, i), function(i) {
                    if (name === 'append') {
                        el.append(i);
                    } else {
                        el.prepend(i, el.firstChild);
                    }
                });
            }
        });
    };
});

// appendTo / prependTo

hAzzle.each([
    'appendTo',
    'prependTo'
], function(name) {
    hAzzle.Core[name] = function(target) {
        return this.domManip(target, function(t, el) {
            if (name === 'appendTo') {
                t.append(el);
            } else {
                t.prepend(el, t.firstChild);
            }
        });
    };
});