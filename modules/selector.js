/**
 * hAzzle selector engine
 *
 * This is a separate module. It can can be replaced with the selector engine you want to use.
 * Just make sure the returned result are a "flattened" array before returning to hAzzle Core.
 *
 * It's using QuerySelectorAll (QSA) with a few pseudos
 *
 **/
var doc = document,
    byClass = 'getElementsByClassName',
    byTag = 'getElementsByTagName',
    byId = 'getElementById',
    nodeType = 'nodeType',
    byAll = 'querySelectorAll',

    // RegExp we are using

    expresso = {

        idClassTagNameExp: /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
        tagNameAndOrIdAndOrClassExp: /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/,
        pseudos: /(.*):(\w+)(?:\(([^)]+)\))?$\s*/
    };

/**
 * Normalize context.
 *
 * @param {String|Array} ctx
 *
 * @return {Object}
 */

function normalizeCtx(ctx) {
    if (!ctx) return doc;
    if (typeof ctx === 'string') return hAzzle.select(ctx)[0];
    if (!ctx[nodeType] && typeof ctx === 'object' && isFinite(ctx.length)) return ctx[0];
    if (ctx[nodeType]) return ctx;
    return ctx;
}

/**
 * Determine if the element contains the klass.
 * Uses the `classList` api if it's supported.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 *
 * @param {Object} el
 * @param {String} klass
 *
 * @return {Array}
 */

function containsClass(el, klass) {
    if (hAzzle.support.classList) {
        return el.classList.contains(klass);
    } else {
        return hAzzle.contains(('' + el.className).split(' '), klass);
    }
}

hAzzle.extend({

    pseudos: {
        disabled: function () {
            return this.disabled === true;
        },
        enabled: function () {
            return this.disabled === false && this.type !== "hidden";
        },
        selected: function () {

            if (this.parentNode) {
                this.parentNode.selectedIndex;
            }

            return this.selected === true;
        },
        checked: function () {
            var nodeName = this.nodeName.toLowerCase();
            return (nodeName === "input" && !! this.checked) || (nodeName === "option" && !! this.selected);
        },
        parent: function () {
            return this.parentNode;
        },
        first: function (elem) {
            if (elem === 0) return this;
        },
        last: function (elem, nodes) {
            if (elem === nodes.length - 1) return this;
        },
        empty: function () {
            var elem = this;
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                if (elem.nodeType < 6) {
                    return false;
                }
            }
            return true;
        },
        eq: function (elem, _, value) {
            if (elem === value) return this;
        },
        contains: function (elem, _, text) {
            if (hAzzle(this).text().indexOf(text) > -1) return this;
        },
        has: function (elem, _, sel) {
            if (hAzzle.qsa(this, sel).length) return this;
        },
        radio: function () {
            return "radio" === this.type;
        },
        checkbox: function () {
            return "checkbox" === this.type;
        },
        file: function () {
            return "file" === this.type;
        },
        password: function () {
            return "password" === this.type;
        },
        submit: function () {
            return "submit" === this.type;
        },
        image: function () {
            return "image" === this.type;
        },
        button: function () {
            var name = this.nodeName.toLowerCase();
            return name === "input" && this.type === "button" || name === "button";
        },
        target: function () {

            var hash = window.location && window.location.hash;
            return hash && hash.slice(1) === this.id;
        },
        input: function () {
            return (/input|select|textarea|button/i).test(this.nodeName);
        },
        focus: function () {
            return this === document.activeElement && (!document.hasFocus || document.hasFocus()) && !! (this.type || this.href || ~this.tabIndex);
        }
    },

    /*
     * QuerySelectorAll function
     */

    qsa: function (sel, ctx) {

        try {
            return ctx[byAll](sel);

        } catch (e) {
            console.error('error performing selector: %o', sel);
        }
    },

    /**
     * Find elements by selectors.
     *
     * @param {String} sel
     * @param {Object} ctx
     * @return {Object}
     */

    select: function (sel, ctx) {

        var m, els = [];

        // Get the right context to use.

        ctx = normalizeCtx(ctx);

        if (m = expresso['idClassTagNameExp'].exec(sel)) {
            if ((sel = m[1])) {
                els = ((els = ctx[byId](sel))) ? [els] : [];
            } else if ((sel = m[2])) {
                els = ctx[byClass](sel);
            } else if ((sel = m[3])) {
                els = ctx[byTag](sel);
            }
        } else if (m = expresso['tagNameAndOrIdAndOrClassExp'].exec(sel)) {
            var result = ctx[byTag](m[1]),
                id = m[2],
                className = m[3];
            hAzzle.each(result, function (_, res) {
                if (res.id === id || containsClass(res, className)) els.push(res);
            });
        } else { // Pseudos

            if (m = expresso['pseudos'].exec(sel)) {

                var filter = hAzzle.pseudos[m[2]],
                    arg = m[3];

                sel = this.qsa(m[1], ctx);

                els = hAzzle.unique(hAzzle.map(sel, function (n, i) {

                    try {
                        return filter.call(n, i, sel, arg);

                    } catch (e) {
                        console.error('error performing selector: %o', sel);
                    }


                }));

            } else { // QuerySelectorAll

                els = this.qsa(sel, ctx);
            }
        }
        return hAzzle.isNodeList(els) ? slice.call(els) : hAzzle.isElement(els) ? [els] : els;
    }
});