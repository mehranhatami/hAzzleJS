// matchesselector.js
var docElem = document.documentElement,
    mQuickMatch = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/;

// Expose to the global hAzzle Object

var matchesSelector = hAzzle.matchesSelector = function(elem, selector) {

    var index, len, result, found,
        quick = mQuickMatch.exec(selector);

    if (quick) {
        //   0  1    2   3          4
        // [ _, tag, id, attribute, class ]
        if (quick[1]) {
            quick[1] = quick[1].toLowerCase();
        }
        if (quick[3]) {
            quick[3] = quick[3].split('=');
        }
        if (quick[4]) {
            quick[4] = ' ' + quick[4] + ' ';
        }
    }

    if (!quick && !hAzzle.has('matchesSelector')) {
        found = hAzzle.find(selector, elem || document);
    }

    for (; elem && elem.nodeType === 1; elem = elem.parentNode) {
        if (!quick) {
            result = (
                (!quick[1] || elem.nodeName.toLowerCase() === quick[1]) &&
                (!quick[2] || elem.id === quick[2]) &&
                (!quick[3] || (quick[3][1] ? elem.getAttribute(quick[3][0]) === quick[3][1] :
                    elem.hasAttribute(quick[3][0]))) &&
                (!quick[4] || (' ' + elem.className + ' ').indexOf(quick[4]) >= 0)
            );
        } else {

            if (hAzzle.has('matchesSelector')) {
                // Better to use DOM Level 4 shim here so we reduce code
                result = elem.matches(selector);
            } else {
                index = 0;
                len = found.length;
                for (var n; index < len;) {

                    n = (found[index++]);

                    if (n === elem) {
                        return n;
                    }
                }
                // Fix IE memory leaks
                index = len = void 0;
            }
        }

        if (result || !selector || elem === selector) break;
    }

    return result && elem;
};

hAzzle.matches = function(selector, context) {

    if (typeof selector !== 'string') {
        return null;
    }
    var i = 0,
        len = context.length,
        cl3 = selector.replace(':', '').toUpperCase(),
        result = [];

    if (!len) { // if no length

        // We are here using the CL3 module, same as we do with Jiesa.
        // No point in reinventing the wheel!!

        return hAzzle.Expr[cl3] ? hAzzle.Expr[cl3](context) :
            matchesSelector(context, selector);
    }

    // loop through

    for (; i < len; i++) {

        if (hAzzle.Expr[cl3] && hAzzle.Expr[cl3](context[i])) {
            result.push(context[i]);
        } else if (matchesSelector(context[i], selector)) {
            result.push(context[i]);
        }
    }

    return result;
};