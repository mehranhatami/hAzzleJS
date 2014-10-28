// core.js
hAzzle.define('Core', function() {

    var winDoc = window.document,
        docElem = winDoc.documentElement,
        _support = hAzzle.require('Support'),
        _indexOf = Array.prototype.indexOf,
        rnative = /^[^{]+\{\s*\[native \w/,
        matches,
        Core = {},
        CoreCache = {},
        hasDuplicate,
        sortInput,
        sortOrder = function(a, b) {
            if (a === b) {
                hasDuplicate = true;
            }
            return 0;
        },
        siblingCheck = function(a, b) {
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
        };

    Core.uidX = 1;
    Core.uidK = 'hAzzle_id';
    Core.expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),

        // Check if this is XML doc or not

        Core.isXML = function(elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;

            if (documentElement) {
                return documentElement.nodeName !== 'HTML'
            } else {
                return false;
            }
        };

    // Get unique XML document ID

    Core.xmlID = function(elem) {
        var uid = elem.getAttribute(this.uidK);

        if (!uid) {
            uid = this.uidX++;
            elem.setAttribute(this.uidK, uid);
        }
        return uid;
    };

    // Get unique HTML document ID

    Core.htmlID = function(elem) {
        return elem.uniqueNumber ||
            (elem.uniqueNumber = this.uidX++);
    };

    Core.native = rnative.test(docElem.compareDocumentPosition);
    // Set document

    Core.setDocument = function(document) {

        // convert elements / window arguments to document. if document cannot be extrapolated, the function returns.
        var nodeType = document.nodeType,
            doc = document ? document.ownerDocument || document : winDoc;

        if (nodeType === 9) { // document

        } else if (nodeType) {
            doc = document.ownerDocument; // node
        } else if (document.navigator) {
            doc = document.document; // window
        } else {
            return;
        }

        // Check if it's the old document

        if (this.document === doc) {
            return;
        }
        // Override default window.document, and set our document

        document = doc;
        this.document = doc;

        var root = document.documentElement,
            rootID = this.xmlID(root),
            features = CoreCache[rootID],
            feature;

        // Don't run feature detection twice

        if (features) {
            for (feature in features) {
                this[feature] = features[feature];
            }
            return;
        }

        features = CoreCache[rootID] = {};
        features.root = root;
        features.isXMLDocument = this.isXML(document);
        features.detectDuplicates = !!hasDuplicate;
        features.sortStable = Core.expando.split('').sort(sortOrder).join('') === Core.expando;

        // on non-HTML documents innerHTML and getElementsById doesnt work properly
        _support.assert(function(div) {
            div.innerHTML = '<a id="hAzzle_id"></a>';
            features.isHTMLDocument = !!document.getElementById('hAzzle_id');
        });

        // iF HTML doc

        if (!Core.isXML(root)) {

            // Check if getElementsByTagName('*') returns only elements
            features.getElementsByTagName = _support.assert(function(div) {
                div.appendChild(doc.createComment(''));
                return !div.getElementsByTagName('*').length;
            }); // IE returns elements with the name instead of just id for getElementsById for some documents
            features.getById = _support.assert(function(div) {
                div.innerHTML = '<a name="hAzzle_id"></a><b id="hAzzle_id"></b>';
                return document.getElementById('hAzzle_id') === div.firstChild;
            });

            var rbuggyMatches = Core.rbuggyMatches = [],
                rbuggyQSA = Core.rbuggyQSA = [];

            if ((_support.qsa = rnative.test(doc.querySelectorAll))) {
                // Build QSA regex
                // Regex strategy adopted from Diego Perini
                _support.assert(function(div) { 
                    div.innerHTML = "<select msallowcapture=''><option selected=''></option></select>";

                    // Webkit/Opera - :checked should return selected option elements
                    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                    if (!div.querySelectorAll(':checked').length) {
                        rbuggyQSA.push(':checked');
                    }
                });
            }

            if ((features.matchesSelector = rnative.test((matches = docElem.matches ||
                    docElem.webkitMatchesSelector ||
                    docElem.mozMatchesSelector ||
                    docElem.oMatchesSelector ||
                    docElem.msMatchesSelector)))) {

                _support.assert(function(div) {
                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9)
                    Core.disconnectedMatch = matches.call(div, 'div');
                });
            }

            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join('|'));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join('|'));
        }

        // Contains

        features.contains = Core.native || Core.native.test(docElem.contains) ?
            function(a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a,
                    bup = b && b.parentNode;
                return a === bup || !!(bup && bup.nodeType === 1 && (
                    adown.contains ?
                    adown.contains(bup) :
                    a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                ));
            } :
            function(a, b) {
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
        Core.sortOrder = Core.native ?
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
                    a.compareDocumentPosition(b) : 1;

                // Disconnected nodes
                if (compare & 1 ||
                    (!_support.sortDetached && b.compareDocumentPosition(a) === compare)) {

                    // Choose the first element that is related to our preferred document
                    if (a === doc || a.ownerDocument === winDoc && Core.contains(winDoc, a)) {
                        return -1;
                    }
                    if (b === doc || b.ownerDocument === winDoc && Core.contains(winDoc, b)) {
                        return 1;
                    }

                    // Maintain original order
                    return sortInput ?
                        (_indexOf.call(sortInput, a) - _indexOf.call(sortInput, b)) :
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
                    return a === doc ? -1 :
                        b === doc ? 1 :
                        aup ? -1 :
                        bup ? 1 :
                        sortInput ?
                        (_indexOf.call(sortInput, a) - _indexOf.call(sortInput, b)) :
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

        root = null;

        for (feature in features) {
            this[feature] = features[feature];
        }
    };

    // Set correct sortOrder

    sortOrder = Core.sortOrder;

    // Set document

    Core.setDocument(winDoc);

    function uniqueSort(results) {

        var elem,
            duplicates = [],
            j = 0,
            i = 0;

        // Unless we *know* we can detect duplicates, assume their presence
        hasDuplicate = !Core.detectDuplicates;
        sortInput = !Core.sortStable && results.slice(0);
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

        sortInput = null;

        return results;
    }

    return {
        root: Core.root,
        isXML: Core.isXML,
        isHTML: !Core.isXML(winDoc),
        expando: Core.expando,
        uniqueSort: uniqueSort,
        contains: Core.contains,
        rbuggyQSA:Core.rbuggyQSA 
    };
});