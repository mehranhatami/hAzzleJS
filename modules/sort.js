// sort.js
// NOTE! fNative defined in core.js
// Overwirte already defined sortOrder

hAzzle.features.sortOrder = sortOrder = fNative.test(features.root.compareDocumentPosition) ?

    function(a, b) {

        // Flag for duplicate removal

        if (a === b) {
            hasDuplicate = true;
            return 0;
        }

        // Sort on method existence if only one input has compareDocumentPosition
        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
        if (compare) {
            return compare;
        }

        // Calculate position if both inputs belong to the same document
        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
            a.compareDocumentPosition(b) :

            // Otherwise we know they are disconnected
            1;

        // Disconnected nodes
        if (compare & 1 ||
            (!features['sort-bug'] && b.compareDocumentPosition(a) === compare)) {

            // Choose the first element that is related to our preferred document
            if (a === document || a.ownerDocument === document && contains(document, a)) {
                return -1;
            }
            if (b === document || b.ownerDocument === document && contains(document, b)) {
                return 1;
            }

            // Maintain original order
            return features['api-sortInput'] ?
                (indexOf.call(features['api-sortInput'], a) - indexOf.call(features['api-sortInput'], b)) :
                0;
        }

        return compare & 4 ? -1 : 1;
    } :
    function(a, b) {
        // Exit early if the nodes are identical
        if (a === b) {
            hasDuplicate = true;
            return 0;
        }

        var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [a],
            bp = [b];

        // Parentless nodes are either documents or disconnected
        if (!aup || !bup) {
            return a === document ? -1 :
                b === document ? 1 :
                aup ? -1 :
                bup ? 1 :
                features['api-sortInput'] ?
                (indexOf.call(features['api-sortInput'], a) - indexOf.call(hAzzle.features['api-sortInput'], b)) :
                0;

            // If the nodes are siblings, we can do a quick check
        } else if (aup === bup) {
            return siblingCheck(a, b);
        }

        // Otherwise we need full lists of their ancestors for comparison
        cur = a;
        while ((cur = cur.parentNode)) {
            ap.unshift(cur);
        }
        cur = b;
        while ((cur = cur.parentNode)) {
            bp.unshift(cur);
        }

        // Walk down the tree looking for a discrepancy
        while (ap[i] === bp[i]) {
            i++;
        }

        return i ?
            // Do a sibling check if the nodes have a common ancestor
            siblingCheck(ap[i], bp[i]) :

            // Otherwise nodes in our document sort first
            ap[i] === winDoc ? -1 :
            bp[i] === winDoc ? 1 :
            0;
    };

hAzzle.unique = function(results) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0,
        apis = features['api-sortInput'];

    // Unless we *know* we can detect duplicates, assume their presence
    hasDuplicate = !features['bug-detectDuplicates'];

    results.sort(sortOrder);

    if (hasDuplicate) {
        while ((elem = results[i++])) {
            if (elem === results[i]) {
                j = duplicates.push(i);
            }
        }
        while (j--) {
            results.splice(duplicates[j], 1);
        }
    }
    apis = null;

    return results;
};