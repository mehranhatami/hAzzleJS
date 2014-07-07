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
 */
var win = this,
    Jiesa = hAzzle.Jiesa,
    doc = win.document,

    expando = "hAzzle" + -(new Date()),

    push = Array.prototype.push,

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rtrim = new RegExp("^" + Jiesa.whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + Jiesa.whitespace + "+$", "g");

// Set up Jiesa

hAzzle.extend({

    version: '0.0.1',

    has: {}

}, Jiesa);

// Feature / Bug detection
// NOTE!! Need to add better check for this. See Sizzle

(function () {

    if (!(Jiesa.has['api-QSA'] = doc.querySelectorAll !== undefined)) {
        return;
    }
    var e = doc.createElement('div');

    e.innerHTML = "<p class='QsA'>Jiesa</p>";

    Jiesa.has['bug-QSA'] = (e.querySelectorAll(".QsA").length === 0);

    e = null;
})();

/**
 * Check if getElementsByTagName returns only elements
 */

Jiesa.has["bug-GEBTN"] = assert(function (div) {
    div.appendChild(doc.createComment(''));
    return div.getElementsByTagName('*').length > 0;
});

/**
 * Check for getElementById bug
 * Support: IE<10
 */
Jiesa.has["bug-GEBI"] = assert(function (div) {
    hAzzle.docElem.appendChild(div).id = expando;
    return doc.getElementsByName > 0 || doc.getElementsByName(expando).length;
});

/**
 * Support testing using an element
 * @param {Function} fn
 */

function assert(fn) {
    var div = doc.createElement("div");

    try {
        return !!fn(div);
    } catch (e) {
        return false;
    } finally {
        // Remove from its parent by default
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
        // release memory in IE
        div = null;
    }
}

/* =========================== TOOLS ========================== */

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

    find: function (selector, context, results) {

        var match, elem, m, nodeType;

        // Set correct document

        if ((context ? context.ownerDocument || context : doc) !== document) {
            // Overwrite if needed
            doc = hAzzle.setDocument(context);
        }

        context = context || doc;
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

        // Run the parser

        return hAzzle.merge(results, Jiesa.parse(selector.replace(rtrim, "$1"), context));
    },

    /**
     * QSA selector engine
     */

    QSA: function (selector, context, results) {

        var res, nodeType;

        // Set correct document

        if ((context ? context.ownerDocument || context : doc) !== document) {
            // Overwrite if needed
            doc = hAzzle.setDocument(context);
        }

        context = normalizeCtx(context);
        results = results || [];

        // Early return if context is not an element or document

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        // Fallback to non-native selector engine
        // if QSA fails
        // Note! Try / Catch should be replaced with
        // something else for better performance

        try {

            res = context.querySelectorAll(selector);

        } catch (e) {}

        if (!res) {

            res = Jiesa.parse(selector, context);
        }

        return hAzzle.merge(results, res);
    }

}, Jiesa);


// provide a enable/disable switch for QSA

Jiesa.useNative = Jiesa.QSA ?
    function (b) {

        // If querySelectorAll are not buggy,
        //	existing, and not XML doc,
        // we can use QSA. If not, we fallback
        // to our internal selector engine

        if (b && Jiesa.has['api-QSA'] &&
            !Jiesa.has['bug-QSA'] &&
            hAzzle.documentIsHTML) {

            return hAzzle.select = Jiesa.QSA;

        }

        // fallback to hAzzle selector engine

        return hAzzle.select = Jiesa.find;


    } : function () {};

// Set the selector engine global for hAzzle

Jiesa.useNative(true);