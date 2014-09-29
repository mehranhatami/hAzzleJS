// features.js
var fMargsL = /(^| )a( |$)/,
    fMargsR = /(^| )b( |$)/,
    hasDuplicate,
    sortOrder = function(a, b) {
        if (a === b) {
            hasDuplicate = true;
        }
        return 0;
    };

hAzzle.features['api-stableSort'] = expando.split('').sort(sortOrder).join('') === expando;
hAzzle.features['api-sortInput'] = false;
hAzzle.features['bug-detectDuplicates'] = !!hasDuplicate;
hAzzle.features.sortOrder = sortOrder;
hAzzle.features['sort-bug'] = hAzzle.assert(function(div1) {
    // Should return 1, but returns 4 (following)
    return div1.compareDocumentPosition(document.createElement('div')) & 1;
});


hAzzle.assert(function(div) {

    div.classList.add('a', 'b');
    // Detect if the browser supports classList
    hAzzle.features['api-classList'] = !!document.documentElement.classList;
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it

    fMargsL = /(^| )a( |$)/,
        fMargsR = /(^| )b( |$)/,
        div.classList.add('a', 'b');
    /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);

    hAzzle.features['api-MultiArgs'] = fMargsL.test(div.className) && fMargsR.test(div.className);
});

hAzzle.features['bug-QSA'] = Core.supportQSA ? hAzzle.assert(function(div) {
    div.innerHTML = "<p class='QsA'>hAzzle</p>";

    return div.querySelectorAll('.QsA').length === 0 ? false :
        // Check for broken :checked pseudo in Webkit/Opera
        !div.querySelectorAll(':checked').length ? false : true;
}) : false;

// MatchesSelector supported, test for bugs

hAzzle.features['bug-mS'] = hAzzle.features['api-mS'] ? hAzzle.assert(function(div) {

    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    return mSmatches.call(div, 'div') ? false :
        // This should fail with an exception
        // Gecko does not error, returns false instead
        mSmatches.call(div, "[s!='']:x") ? false : true;
}) : false;

/**
 * Check for getElementById bug
 * Support: IE<10
 */
hAzzle.features['bug-GEBI'] = hAzzle.assert(function(div) {
    hAzzle.docElem.appendChild(div).id = expando;
    return document.getElementsByName > 0 || document.getElementsByName(expando).length;
});


(function() {
    var fragment = document.createDocumentFragment(),
        div = fragment.appendChild(document.createElement('div'));
    // Support: IE<=11+
    // Make sure textarea (and checkbox) defaultValue is properly cloned
    div.innerHTML = '<textarea>x</textarea>';
    hAzzle.features.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
})();