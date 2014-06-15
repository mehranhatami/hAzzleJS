/**
 * Set correct doc type for hAzzle
 */
var docElem,
    contains,
    winDoc = window.document,
    hasDuplicate,
    setDocument,
    ntest = /^[^{]+\{\s*\[native \w/,
    sortInput,
   
   // We have to change this to hAzzle.inArray() after
   // some extra checks

    indexOf = Array.prototype.indexOf,
	
    sortOrder = function (a, b) {
        if (a === b) {
            hasDuplicate = true;
        }
        return 0;
    },
    
	// Set our main document
    
	setDocument = hAzzle.setDocument = function (node) {

        var doc = node ? node.ownerDocument || node : winDoc,
            parent = doc.defaultView;

     // If no document and documentElement is available, return
        if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
              return document;
          }

        // Set our document

        document = doc;
        docElem = doc.documentElement;

        // Quick iFrame check

        if (parent && parent !== parent.top) {

            if (parent.addEventListener) {
				
                parent.addEventListener("unload", function () {
                
				    setDocument();
               
			    }, false);
				
            } else if (parent.attachEvent) {
				
                parent.attachEvent("onunload", function () {
                
				    setDocument();
                });
            }
        }

        contains = ntest.test(docElem.compareDocumentPosition) || ntest.test(docElem.contains) ? function (a, b) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentNode;
            return a === bup || !!(bup && bup.nodeType === 1 && (
                adown.contains ?
                adown.contains(bup) :
                a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
            ));
        } : function (a, b) {
            if (b) {
                while ((b = b.parentNode)) {
                    if (b === a) {
                        return true;
                    }
                }
            }
            return false;
        };

        // Document order sorting

        sortOrder = ntest.test(docElem.compareDocumentPosition) ? function (a, b) {

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
                    a.compareDocumentPosition(b) : 1;

                // Disconnected nodes
                if (compare & 1) {

                    // Choose the first element that is related to our preferred document
                    if (a === doc || a.ownerDocument === winDoc && contains(winDoc, a)) {
						
                        return -1;
                    }
                    if (b === doc || b.ownerDocument === winDoc && contains(winDoc, b)) {
						
                        return 1;
                    }

                    // Maintain original order
                    return sortInput ?
                        (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
                        0;
                }

                return compare & 4 ? -1 : 1;
            } :
            function (a, b) {
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
                    return a === doc ? -1 :
                        b === doc ? 1 :
                        aup ? -1 :
                        bup ? 1 :
                        sortInput ?
                        (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
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


        return doc;
    };

/* =========================== GLOBAL FUNCTIONS ========================== */

hAzzle.sortOrder = sortOrder;

/**
 * Check if an element contains another element
 */

hAzzle.contains = function (context, elem) {
    // Set document vars if needed
    if ((context.ownerDocument || context) !== document) {
        setDocument(context);
    }
    return contains(context, elem);
};



function siblingCheck(a, b) {
    var cur = b && a,
        diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
        (~b.sourceIndex || 1 << 31) -
        (~a.sourceIndex || 1 << 31);

    // Use IE sourceIndex if available on both nodes
	
    if (diff) {
        return diff;
    }

    // Check if b follows a
    if (cur) {
        while ((cur = cur.nextSibling)) {
            if (cur === b) {
                return -1;
            }
        }
    }

    return a ? 1 : -1;
}

// Initialize against the default document

hAzzle.setDocument();