// manipulation.js
var
    mScriptSL = /<(script|style|link)/i,
    mTag = /<([\w:]+)/,
    mHtml5 = /(<)(?!area|br|col|embed|hr|img|input|meta|param|link)(([\w:]+)[^>]*)(\/)(>)|(<(script|style|textarea)[^>]*>[\w\W]*?<\/\7\s*>|<!--[\w\W]*?--)/gi,
    mSpace = /^\s*<([^\s>]+)/,
    mRxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    mScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,

    stabilize = function(html, clone) {

        if (typeof html === 'string') {
            return hAzzle.create(html);
        }

        if (hAzzle.isNode(html)) {
            html = [html];
        }

        // FIXME! Need to add hAzzle.clone 
        if (clone) {
            var i = 0,
                l = html.length,
                ret = [];
            for (; i < l; i++) {
                ret[i] = html[i].cloneNode(true);
            }
            return ret;
        }
        return html;
    };

hAzzle.extend({

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} value
     * @return {hAzzle|string}
     */

    html: function(value) {

        var elem = this[0] || {};

        if (value === undefined &&
            elem.nodeType === 1) {

            return elem.innerHTML;
        }

        if (typeof value === 'function') {

            return this.each(function(el, i) {

                var self = hAzzle(el);

                // Call the same function again

                self.html(value.call(el, i, self.html()));
            });
        }

        if (typeof value === 'number') {
            value = value.toString();
        }

        // Remove all data and avoid memory leaks before
        // appending HTML

        if (typeof value === 'string' && !mScriptSL.test(value) &&
            !tagMap[(mTag.exec(value) || ['', ''])[1].toLowerCase()]) {

            return this.empty().each(function(elem) {

                value = value.replace(mHtml5, "$1$2$5$1$4$3$5$6");

                try {

                    if (elem.nodeType === 1) {

                        elem.innerHTML = value;
                    }

                    elem = 0;

                } catch (e) {}
            });
        }

        // Fallback to 'append if 'value' are not a plain string value

        if (elem) {

            this.empty().append(value);
        }
    },

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection
     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {hAzzle|String}
     */

    text: function(value) {

        return hAzzle.setter(this, function(value) {
            return value === undefined ?
                hAzzle.getText(this) :
                this.empty().each(function() {
                    if (this.nodeType === 1 ||
                        this.nodeType === 11 ||
                        this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
        }, null, value, arguments.length);
    },

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
    replaceWith: function(html) {
        return this.each(function(el, i) {
            // Stabilize the HTML node, and use DOM Level 4 for
            // replacement, so we automatically are using
            // document fragment
            hAzzle.each(stabilize(html, i), function(i) {
                el.parentNode.replace(i);
            });
        });
    },
    // Credit to jQuery for the function name :)
    domManip: function(target, fn, /*reverse */ rev) {
        var i = 0,
            self = this,
            r = [],
            nodes = typeof target == 'string' && target.charAt(0) !== '<' ? hAzzle(target) : target;
        hAzzle.each(stabilize(nodes), function(t, j) {
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

/* ============================ INTERNAL =========================== */

// append, prepend

hAzzle.each({
    append: 'beforeend',
    prepend: 'afterbegin'
}, function(iah, name) {
    hAzzle.Core[name] = function(html) {
        return this.each(function(el, i) {
            if (el.nodeType === 1 ||
                el.nodeType === 11 ||
                el.nodeType === 9
            ) {
                if (typeof html === 'string' &&
                    el.insertAdjacentHTML &&
                    el.parentNode && el.parentNode.nodeType === 1) {
                    el.insertAdjacentHTML(iah, html.replace(mRxhtmlTag, '<$1></$2>'));
                } else {
                    hAzzle.each(stabilize(html, i), function(i) {

                        try {
                        if (name === 'append') {
                            el.append(i);
                        } else {
                            el.prepend(i, el.firstChild);
                        }
                        } catch(e) {}
                    });
                }
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
                t.appendChild(el);
            } else {
               t.insertBefore(el, t.firstChild);
            }
        });
    };
});

// Before / after

hAzzle.each({
    before: 'beforebegin',
    after: 'afterend'
}, function(iah, name) {
    hAzzle.Core[name] = function(html) {
        return this.each(function(el, i) {
            if (typeof html === 'string' &&
                el.insertAdjacentHTML &&
                el.parentNode && el.parentNode.nodeType === 1) {
                el.insertAdjacentHTML(iah, html.replace(mRxhtmlTag, '<$1></$2>'));
            } else {
                hAzzle.each(stabilize(html, i), function(i) {
                    if (name === 'before') {
                        el.parentElement.insertBefore(i, el);
                    } else {
                        el.parentNode.insertBefore(i, el.nextSibling);
                    }
                }, null, name === 'before' ? 0 : 1);
            }
        });
    };
});