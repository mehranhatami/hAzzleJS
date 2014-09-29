// features.js
var hasDuplicate,
    sortOrder = function(a, b) {
        if (a === b) {
            hasDuplicate = true;
        }
        return 0;
    };

hAzzle.features['api-stableSort'] = expando.split('').sort(sortOrder).join('') === expando;
hAzzle.features['api-sortInput'] = false;
hAzzle.features['bug-detectDuplicates'] = !!hasDuplicate;
hAzzle.features['sortOrder'] = sortOrder;
hAzzle.features['sort-bug'] = hAzzle.assert(function(div1) {
    // Should return 1, but returns 4 (following)
    return div1.compareDocumentPosition(document.createElement('div')) & 1;
});