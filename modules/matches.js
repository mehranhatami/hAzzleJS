var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/;


hAzzle.matches = function (selector, context) {

    if (typeof selector !== 'string') {

        return null;
    }

    var quick = rquickIs.exec(selector),
        i = 0,
        l = context.length,
        result = [];

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

    // Always make sure we have a nodeName

    if (quick && context.nodeName) {

        result = (
            (!quick[1] || context.nodeName.toLowerCase() === quick[1]) &&
            (!quick[2] || context.id === quick[2]) &&
            (!quick[3] || (quick[3][1] ? context.getAttribute(quick[3][0]) === quick[3][1] : context.hasAttribute(quick[3][0]))) &&
            (!quick[4] || (' ' + context.className + ' ').indexOf(quick[4]) >= 0)
        );

        // Fallback to hAzzle.matchesSelector

    } else {

        // Do a quick look-up if no array-context
        //
        // matchesSelector can't be run on XML docs,
        // but we are solving this inside the 
        // matchesSelector.js module

        if (!l) {

            return hAzzle.matchesSelector(context, selector);
        }

        // loop through

        for (; i < l; i++) {

            if (hAzzle.matchesSelector(context[i], selector)) {

                result.push(context[i]);
            }
        }
    }

    return result;
}