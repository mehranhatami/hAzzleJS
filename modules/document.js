/**
 * Set correct document for hAzzle
 *
 * This will give us some new global hAzzle functions:
 *
 * - hAzzle.setDocument();
 *
 * - hAzzle.documentIsHTML ( boolean - true / false )
 *
 * - hAzzle.contains
 *
 */
var contains,
    docElem,
    winDoc = window.document,
    setDocument,
    ntest = /^[^{]+\{\s*\[native \w/,

    // Set our main document

    setDocument = hAzzle.setDocument = function (node) {

        var doc = node ? node.ownerDocument || node : winDoc,
            parent = doc.defaultView;

        // If no document and documentElement is available, return

        if (doc === document || doc.nodeType !== 9 || !hAzzle.docElem) {
            return document;
         }

        // Set our document

        document = doc;

        // Set correct documentElement for hAzzle to use

        docElem = hAzzle.docElem = doc.documentElement;

        // Checks if this is an XML or HTML doc

        hAzzle.documentIsHTML = !!hAzzle.isXML(doc);

        // Quick iFrame check

        if (parent && parent !== parent.top) {

            if (parent.addEventListener) {

                parent.addEventListener("unload", function () {

                    setDocument();

                }, false);
            }
        }

       

        // Return the document

        return doc;
    };

/* =========================== GLOBAL FUNCTIONS ========================== */

/**
 * Check if an element contains another element
 *
 * docElem are called from here, because at this point it can have been
 * overwritten by setDocument()
 *
 */

var docElem = hAzzle.docElem,
    contains = ntest.test(docElem.compareDocumentPosition) || ntest.test(docElem.contains) ? function (a, b) {

            var adown,
                bup = b && b.parentNode;

            if (a.nodeType === 9) {

                adown = a.documentElement;

            } else {

                adown = a;
            }

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


hAzzle.contains = function (context, elem) {
    // Set document vars if needed
    if ((context.ownerDocument || context) !== document) {
        setDocument(context);
    }
    return contains(context, elem);
};



// Initialize against the default document

hAzzle.setDocument();