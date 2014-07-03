/**
 * Jiesa selector engine
 *
 * Contains:
 *
 * - QSA engine
 *
 * - Jiesa engine
 *
 * - Various bug checks
 *
 */
var win = this,
    Jiesa = hAzzle.Jiesa,
    doc = win.document,

    push = Array.prototype.push,

    whitespace = "[\\x20\\t\\r\\n\\f]",

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g");

// Set up Jiesa
hAzzle.extend({

    version: '0.0.1',

    has: {},

    toArray: function (ar) {
        return [].slice.call(ar, 0);
    }

}, Jiesa);

// Check for QSA support and bug

(function () {

    if (!(Jiesa.has['api-QSA'] = doc.querySelectorAll !== undefined)) {
        return;
    }
    var e = doc.createElement('div');

    e.innerHTML = "<p class='QsA'>Jiesa</p>";

    Jiesa.has['bug-QSA'] = (e.querySelectorAll(".QsA").length === 0);

    e = null;
})();

// Tools

function flatten(ar) {

    for (var r = [], i = 0, l = ar.length; i < l; ++i) {

        hAzzle.arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i]);

    }
    return r;
}


function normalizeCtx(ctx) {

    if (!ctx) {

        return doc;

    }

    if (typeof ctx == 'string') {

        return hAzzle.select(ctx)[0];

    }

    if (!ctx.nodeType && hAzzle.arrayLike(ctx)) {

        return ctx[0];
    }
    return ctx;
}



// Extend Jiesa

hAzzle.extend({

    // Non-QSA selector engine

    find: function (selector, context) {

        var match, elem, m, nodeType, results = [];

        if ((context ? context.ownerDocument || context : doc) !== document) {
            hAzzle.setDocument(context);
        }

        context = context || document;
        results = results || [];

        if (!selector || typeof selector !== "string") {

            return results;
        }

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        if (hAzzle.documentIsHTML) {

            // Shortcuts
            if ((match = rquickExpr.exec(selector))) {
                if ((m = match[1])) {
                    if (nodeType === 9) {
                        elem = context.getElementById(m);
                        if (elem && elem.parentNode) {
                            if (elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        } else {
                            return results;
                        }
                    } else {

                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            hAzzle.contains(context, elem) && elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    }

                } else if (match[2]) {
                    push.apply(results, context.getElementsByTagName(selector));
                    return results;
                } else if ((m = match[3]) && context.getElementsByClassName) {
                    push.apply(results, context.getElementsByClassName(m));
                    return results;
                }
            }
        }

        // All others...

        return Jiesa.parse(selector.replace(rtrim, "$1"), context);
    },

    /**
     * QSA selector engine
     */

    QSA: (Jiesa.has['api-QSA'] && !Jiesa.has['bug-QSA']) ?

        function (selector, context) {

            var res, nodeType;

            context = normalizeCtx(context);

            // Early return if context is not an element or document

            if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {

                return [];
            }

            if (selector === win || hAzzle.isNode(selector)) {

                return !context || (selector !== win && hAzzle.isNode(context) && hAzzle.contains(selector, context)) ? [selector] : [];
            }

            if (selector && typeof selector === 'object' && isFinite(selector.length)) {

                return flatten(selector);
            }

            if (selector && (selector.document || (selector.nodeType && selector.nodeType === 9))) {
                return !context ? [selector] : [];
            }

            // Fallback to non-native selector engine
            // if QSA fails

            res = Jiesa.toArray(context.querySelectorAll(selector), 0);

            if (!res) {

                res = Jiesa.parse(selector, context);
            }

            return res;

        } : null

}, Jiesa);


// provide a enable/disable switch for QSA

Jiesa.useNative = Jiesa.QSA ?
    function (b) {
        return hAzzle.select = b ? Jiesa.QSA : Jiesa.find;
    } : function () {};


// Set the selector engine global for hAzzle

Jiesa.useNative(true);