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
return elem.matches( expr );

};