// transformers.js

// Create a fake path for comparison
var fakePath = (function() {
    var path,
        a = document.createElement('a');
    a.href = '/';

    path = a.pathname;

    // release memory in IE
    a = null;

    return path;

}());

/* ============================ FEATURE / BUG DETECTION =========================== */

function byIdRaw(id, elements) {
    var i = -1,
        element = null;
    while ((element = elements[++i])) {
        if (getAttr(element, 'id') === id) {
            break;
        }
    }
    return element;
}

// Avoid getElementById bug
// Support: IE<10
// Check if getElementById returns elements by name
// The broken getElementById methods don't pick up programatically-set names,
// so use a roundabout getElementsByName test

var grabID = hAzzle.features['bug-GEBI'] ? function(id, context) {
        var elem = null;
        if (hAzzle.documentIsHTML || context.nodeType !== 9) {
            return byIdRaw(id, context.getElementsByTagName('*'));
        }
        if ((elem = context.getElementById(id)) &&
            elem.name == id && context.getElementsByName) {
            return byIdRaw(id, context.getElementsByName(id));
        }
        return elem;
    } :
    function(id, context) {
        var m = context.getElementById(id);
        return m && m.parentNode ? [m] : [];
    };

function returnTrue() {
    return true;
}


hAzzle.extend({

    'LOCAL-LINK': function(args, attr, attrValue, p, context) {
        var pathnameParts, selector,
            ctx = context.ownerDocument || context,
            pathname = ctx.location.pathname;

        pathname = fakePath ? pathname : pathname.slice(1);

        if (!args) {

            selector = 'a[.protocol=\'' + ctx.location.protocol + '\'][.host=\'' + ctx.location.host + '\'][.pathname=\'' + pathname + '\']';

        } else {

            //convert the string to a number
            args -= fakePath ? -1 : 0;
            pathnameParts = pathname.split('/');
            if (pathnameParts.length >= args) {
                pathname = pathnameParts.slice(0, args).join('/');
                selector = 'a[.host=\'' + ctx.location.host + '\'][.pathname^=\'' + pathname + '\']';
            }
        }

        if (selector) {

            markElements(JiesaFind(selector, ctx), attr, attrValue, returnTrue);
        }
    },

    'NOT': function(args, attr, attrValue, p, context, arrfunc) {
        return ':not(' + markElements(JiesaFind(args, context, arrfunc), attr, attrValue, returnTrue) + ')';
    },

    'REFERENCED-BY': function(args, attr, attrValue, p, context, arrfunc) {
        var element, refEl, found = compileExpr.referencedByArg.match(args),
            ctx = context.ownerDocument || context,
            referenceAttr = found[1],
            elements = JiesaFind(':matches(' + (found[2] || '*') + ')[' + referenceAttr + ']', ctx, arrfunc),
            l = elements.length;

        while ((element = elements[--l])) {

            refEl = grabID(referenceAttr[0] == '.' ?
                element[referenceAttr.slice(1)] :
                getAttr(element, referenceAttr), ctx);

            if (refEl) {
                refEl.setAttribute(attr, attrValue);
            }

        }
    },

    /**
     * The matches pseudo selector selects elements which meet the sub-selector. This can be especially helpful
     * in simplifying complex selectors.
     *
     * Example:
     * -------
     *
     * div > p:nth-child(2n+1), div > a:nth-child(2n+1), div > h1:nth-child(2n+1)
     *
     * can be simplified too:
     *
     * div > :matches(p, a, h1):nth-child(2n+1)
     *
     */

    'MATCHES': function(args, attr, attrValue, p, context, arrfunc) {
        markElements(JiesaFind(args, context.ownerDocument || context, arrfunc), attr, attrValue, returnTrue);
    }
}, transformers);

/**
 * The nth-match and nth-last-match selectors work similar to the match and nth-child/nth-last-child pseudo
 * selectors by selecting the nth element which matches the sub-selector. The grammar for the
 * argument works by specifying an anb value followed by jwhitespace, the word "of", jwhitespace and a sub-selector.
 *
 * EXAMPLES:
 * ---------
 *
 * Select the odd elements which match the selector "div > mehran.js":
 *
 * hAzzle(":nth-match(odd of div > mehran.js)");
 *
 * Select the "4n-2" last elements which match the selector "footer :any-link":
 *
 * hAzzle(":nth-last-match(4n-2 of footer :any-link)");
 */

transformers['NTH-MATCH'] = transformers['NTH-LAST-MATCH'] = function(args, attr, attrValue, pseudo, context, arrfunc) {
    var element,
        ofPos = args.indexOf('of'),
        anbIterator = anb(args.substr(0, ofPos)),
        elements = JiesaFind(args.substr(ofPos + 2), (context.ownerDocument || context), arrfunc),
        l = elements.length - 1,
        nthMatch = pseudo[4] !== 'L';
    while ((element = elements[nthMatch ? anbIterator.next() : l - anbIterator.next()])) {
        element.setAttribute(attr, attrValue);
    }
};

/* ============================ TRANSFORMERS =========================== */

/**
 * The scope pseudo selector matches the context element that was passed into hAzzle.find()() or
 * hAzzle.tokenize(). When no context element is provided, scope is the equivalent of :root.
 *
 * EXAMPLE:
 * --------
 *
 * Select even div elements that are descendants of the provided context element:
 *
 * hAzzle(":nth-match(even of :scope div)", document.getElementsByTagName("footer")[0]);
 *
 *
 * NOTE!! The name on the 'scope' selector have changed from draft to draft, and still
 * we can't be sure what name to be used. It has been known as 'SCOPE', but in
 * the new DOM Level 4 drafts, it named 'SCOPED' and used in the
 * query() and queryAll() that will replace querySelectorAll():
 
 *
 * For now hAzzle are supporting both names
 */
transformers.scoped = transformers.scope = function() {
    return scope;
};