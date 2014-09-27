var docElem = document.documentElement,
    mAtrquote = /=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g,
    mQuickMatch = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/;

hAzzle.matches = function( expr, elements ) {
    
    var results = [], elem, i = elements.length;
    while(i--) {
       elem = elements[i];
    if (elem.matches( expr ) ) {
          results.push( elem );
         }
        }
return results;    
    
};

hAzzle.matchesSelector = function( elem, expr ) {

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
            hAzzle.matchesSelector(context, selector);
    }

    // loop through

    for (; i < len; i++) {

        if (hAzzle.Expr[cl3] && hAzzle.Expr[cl3](context[i])) {
            result.push(context[i]);
        } else if (hAzzle.matchesSelector(context[i], selector)) {
            result.push(context[i]);
        }
    }

    return result;
};