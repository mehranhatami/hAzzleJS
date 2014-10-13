// core.js
hAzzle.define('Core', function() {

    var winDoc = window.document,
        _support = hAzzle.require('Support'),
        cache = {},
        _indexOf = Array.prototype.indexOf,
        expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),
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
        },

        // Create a unique object that hold all info, so we can cache it,
        // and gain better performance

        Core = {
            // A global XML counter for each document
            duidX: 1,
            duidK: 'hAzzle-uniqueid',

            isNativeCode: function(fn) {
                return (/\{\s*\[native code\]\s*\}/).test('' + fn);
            },

            isXML: function(elem) {
                var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                return documentElement ? documentElement.nodeName !== "HTML" : false;
            },
            getUIDXML: function(node) {
                var uid = node.getAttribute(this.duidK);
                if (!uid) {
                    uid = this.duidX++;
                    node.setAttribute(this.duidK, uid);
                }
                return uid;
            },

            getUIDHTML: function(node) {
                return node.uniqueNumber || (node.uniqueNumber = this.duidX++);
            },

            // sort based on the setDocument documentSorter method.

            sort: function(results) {
                if (!this.documentSorter) return results;
                results.sort(this.documentSorter);
                return results;
            },

            setDocument: function(document) {

                // convert elements / window arguments to document. if document cannot be extrapolated, the function returns.
                var nodeType = document.nodeType;

                var doc = document ? document.ownerDocument || document : winDoc;

                if (nodeType === 9); // document
                else if (nodeType) {
                    doc = document.ownerDocument; // node
                } else if (document.navigator) {
                    doc = document.document; // window
                } else {
                    return;
                }

                // check if it's the old document

                if (this.document === doc) {
                    return;
                }
                // Override default window.document, and set our document

                document = doc;
                this.document = doc;

                // check if we have done feature detection on this document before

                var root = document.documentElement,
                    rootUid = this.getUIDXML(root),
                    features = cache[rootUid],
                    feature;

                if (features) {
                    for (feature in features) {
                        this[feature] = features[feature];
                    }
                    return;
                }

                features = cache[rootUid] = {};

                features.root = root;
                features.isXMLDocument = this.isXML(document);

                features.detectDuplicates = !!hasDuplicate;

                // Sort stability

                features.sortStable = expando.split('').sort(sortOrder).join('') === expando;

                features.brokenGEBTN = features.idGetsName = features.brokenCheckedQSA = features.isHTMLDocument = false;

                var starSelectsClosed, starSelectsComments,
                    selected, id = 'hAzzle_uniqueid',
                    testNode = document.createElement('div'),
                    testRoot = document.body || document.head || root;

                testRoot.appendChild(testNode);

                // On non-HTML documents innerHTML and getElementById doesnt work properly

                try {
                    testNode.innerHTML = '<a id="' + id + '"></a>';
                    features.isHTMLDocument = !!document.getElementById(id);
                } catch (e) {}

                if (features.isHTMLDocument) {

                    testNode.style.display = 'none';

                    // Check if getElementsByTagName('*') returns only elements
                    testNode.appendChild(document.createComment(''));
                    starSelectsComments = !testNode.getElementsByTagName('*').length;

                    // IE returns closed nodes (EG:'</foo>') for getElementsByTagName('*') for some documents
                    try {
                        testNode.innerHTML = 'foo</foo>';
                        selected = testNode.getElementsByTagName('*');
                        starSelectsClosed = (selected && !!selected.length && selected[0].nodeName.charAt(0) === '/');
                    } catch (e) {}

                    features.brokenGEBTN = starSelectsComments || starSelectsClosed;

                    // Support: IE<10
                    // Check if getElementById returns elements by name
                    // The broken getElementById methods don't pick up programatically-set names,
                    // so use a roundabout getElementsByName test

                    try {

                        testNode.innerHTML = '<a name="' + id + '"></a><b id="' + id + '"></b>';
                        features.idGetsName = document.getElementById(id) === testNode.firstChild;
                    } catch (e) {}


                    if (testNode.querySelectorAll) {

                        // Webkit/Opera - :checked should return selected option elements
                        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                        try {
                            testNode.innerHTML = '<select><option selected="selected">a</option></select>';
                            features.brokenCheckedQSA = !testNode.querySelectorAll(':checked').length;
                        } catch (e) {}
                    }
                }

                try {
                    root.hAzzle_expando = 1;
                    delete root.hAzzle_expando;
                    features.getUID = this.getUIDHTML;
                } catch (e) {
                    features.getUID = this.getUIDXML;
                }

                // Avoid memory leaks 

                testRoot.removeChild(testNode);
                testNode = selected = testRoot = null;

                // Element contains another
                // Purposefully does not implement inclusive descendent
                // As in, an element does not contain itself

                features.contains = Core.isNativeCode(root.compareDocumentPosition) ? function(a, b) {
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
                // Credits to Sizzle (http://sizzlejs.com/)

                features.documentSorter = (root.compareDocumentPosition) ? function(a, b) {

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
                    if (compare & 1 || (!_support.sortDetached && b.compareDocumentPosition(a) === compare)) {

                        // Choose the first element that is related to our preferred document
                        if (a === doc || a.ownerDocument === winDoc && features.contains(winDoc, a)) {
                            return -1;
                        }
                        if (b === doc || b.ownerDocument === winDoc && features.contains(winDoc, b)) {
                            return 1;
                        }

                        // Maintain original order
                        return sortInput ?
                            (_indexOf.call(sortInput, a) - _indexOf.call(sortInput, b)) :
                            0;
                    }

                    return compare & 4 ? -1 : 1;
                } : function(a, b) {
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
            }
        };

    // Set correct document
    Core.setDocument(document);

    var uniqueSort = function(results) {
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

        // Clear input after sorting to release objects
        // See https://github.com/jquery/sizzle/pull/225
        sortInput = null;

        return results;
    };

    return {
        Core: Core,
        root: Core.document,
        uniqueSort: uniqueSort,
        getAttribute: Core.getAttribute,
        contains: Core.contains,
        isXML: Core.isXML,
        isHTML: !Core.isXML(document),
        expando: expando
    };
});