/**
 * hAzzle selector engine
 *
 * This is a separate modue, can can be replaced with the selector engine you want to use.
 * Just make sure the returned result are a "flattened" array befor returning to hAzzle Core.
 *
 **/

var doc = document,
    byClass = 'getElementsByClassName',
    byTag = 'getElementsByTagName',
    byId = 'getElementById',
    byAll = 'querySelectorAll',

    // Selector caching

    cache = [],

    // RegExp we are using

    expresso = {

        idClassTagNameExp: /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
        tagNameAndOrIdAndOrClassExp: /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/
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
            hAzzle.each(result, function () {
                if (this.id === id || hAzzle.containsClass(this, className)) els.push(this);
            });
        } else { // QuerySelectorAll

            /**
             * try / catch are going to be removed. Added now just to stop an error message from being thrown.
             *
             * TODO! Fix this
             **/
            try {
                els = ctx[byAll](sel);
            } catch (e) {
                console.error('error performing selector: %o', sel)
            }
        }

        return hAzzle.isNodeList(els) ? slice.call(els) : hAzzle.isElement(els) ? [els] : els;
    }
});