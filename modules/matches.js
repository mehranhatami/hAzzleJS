
// MEHRAN !!! Merge this with compiler.js


hAzzle.matches = function (selector, context) {

    if (typeof selector !== 'string') {
        return null;
    }

    var i = 0,
        l = context.length,
        result = [];

        if (!l) { // if no length

            return hAzzle.matchesSelector(context, selector);
        }

        // loop through

        for (; i < l; i++) {

            if (hAzzle.matchesSelector(context[i], selector)) {

                result.push(context[i]);
            }
        }
 
    return result;
}