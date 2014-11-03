// core.js
hAzzle.define('Core', function() {

 var winDoc = window.document,
        locale = {},
        featuresCache = {},
        _indexOf = Array.prototype.indexOf,
        expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),
        sortInput,
        sortDetached = (function() {
            var div = document.createElement('div');
            // Should return 1, but returns 4 (following)
            return div.compareDocumentPosition(document.createElement('div')) & 1;
            div = null;
        }()),
        hasDuplicate,

        detectDuplicates = function() {
            return !!hasDuplicate;
        },

        sortOrder = function(a, b) {
            if (a === b) {
                hasDuplicate = true;
            }
            return 0;
        },
        sortStable = expando.split("").sort(sortOrder).join("") === expando,
        MAX_NEGATIVE = 1 << 31,
        siblingCheck = function(a, b) {
            var cur = b && a,
                diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
                (~b.sourceIndex || MAX_NEGATIVE) -
                (~a.sourceIndex || MAX_NEGATIVE);

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

    // Feature / Bug detection 

    locale.isNativeCode = function(fn) {
        return (/\{\s*\[native code\]\s*\}/).test('' + fn);
    };

    locale.expando = expando;

    locale.isXML = function(elem) {
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
        return documentElement ? documentElement.nodeName !== 'HTML' : false;
    };

    locale.uidx = 1;
    locale.uidk = 'hAzzle-uniqueid';

    locale.getUIDXML = function(node) {
        var uid = node.getAttribute(this.uidk);
        if (!uid) {
            uid = this.uidx++;
            node.setAttribute(this.uidk, uid);
        }
        return uid;
    };

    locale.getUIDHTML = function(node) {
        return node.uniqueNumber || (node.uniqueNumber = this.uidx++);
    };

    // Set document

    locale.setDocument = function(node) {

        var doc = node ? node.ownerDocument || node : winDoc;

        // If no document and documentElement is available, return
        if (doc.nodeType !== 9 || !doc.documentElement) {
            return document;
        }

        // check if it's the old document

        if (this.document === doc) {
            return;
        }

        // Set our document

        this.document = document = doc;

        var root = doc.documentElement,
            rootUid = this.getUIDXML(root),
            features = featuresCache[rootUid],
            feature;

        // If already cached, return

        if (features) {
            for (feature in features) {
                this[feature] = features[feature];
            }
            return;
        }

        features = featuresCache[rootUid] = {};
        features.root = root;
        features.isXMLDocument = this.isXML(document);

        features.brokenStarGEBTN = features.starSelectsClosedQSA = features.idGetsName = features.ioASaf = features.disconnectedMatch = features.brokenMixedCaseQSA = features.brokenGEBCN = features.brokenCheckedQSA = features.brokenEmptyAttributeQSA = features.isHTMLDocument = features.nativeMatchesSelector = false;

        var getElementsByTagName, matches,

            selected, id = 'hAzzle_uniqueid',
            testNode = document.createElement('div'),
            testRoot = document.body || document.getElementsByTagName('body')[0] || root;

        testRoot.appendChild(testNode);

        // Non-HTML documents innerHTML and getElementsById doesnt work properly
        // Support: IE<10

        try {
            testNode.innerHTML = '<a id="' + id + '"></a>';
            features.isHTMLDocument = !!document.getElementById(id);
        } catch (e) {}

        // HTML document

        if (features.isHTMLDocument) {

            // Check if getElementsByTagName("*") returns only elements
            testNode.appendChild(document.createComment(''));
            getElementsByTagName = !testNode.getElementsByTagName('*').length;

            // IE returns elements with the name instead of just id for getElementsById for some documents
            try {
                testNode.innerHTML = '<a name="' + id + '"></a><b id="' + id + '"></b>';
                features.getById = document.getElementById(id) === testNode.firstChild;
            } catch (e) {}

            if (testNode.querySelectorAll) {

                // Webkit and Opera dont return selected options on querySelectorAll
                testNode.innerHTML = '<select><option selected="selected">a</option></select>';
                features.brokenCheckedQSA = !testNode.querySelectorAll(':checked').length;

                testNode.innerHTML = "<select msallowcapture=''>" +
                    "<option id='d\f]' selected=''></option></select>";

                // Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
                features.ioASaf = !testNode.querySelectorAll("[id~=d]").length;

                // IE returns incorrect results for attr[*^$]="" selectors on querySelectorAll
                try {
                    testNode.innerHTML = '<a class=""></a>';
                    features.brokenEmptyAttributeQSA = (testNode.querySelectorAll('[class*=""]').length != 0);
                } catch (e) {}

            } // QSA end

            // Native matchesSelector function

            if ((features.nativeMatchesSelector = this.isNativeCode((matches = root.matches ||
                    root.webkitMatchesSelector ||
                    root.mozMatchesSelector ||
                    root.oMatchesSelector ||
                    root.msMatchesSelector)))) {

                try {

                    // Check to see if it's possible to do matchesSelector
                    // on a disconnected node (IE 9)

                    features.disconnectedMatch = matches.call(testNode, "div");

                    // if matchesSelector trows errors on incorrect sintaxes we can use it
                    matches.call(root, ':hAzzle');
                    matches = null;

                } catch (e) {}
            }

        } // HTML doc end

        try {
            root.hAzzle_expando = 1;
            delete root.hAzzle_expando;
            features.getUID = this.getUIDHTML;
        } catch (e) {
            features.getUID = this.getUIDXML;
        }

        testRoot.removeChild(testNode);
        testNode = selected = testRoot = null;

        var nativeRootContains = root && this.isNativeCode(root.contains),
            nativeDocumentContains = document && this.isNativeCode(root.compareDocumentPosition);

        features.contains = (nativeRootContains && nativeDocumentContains) ? function(a, b) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentElement;
            return a === bup || !!(bup && bup.nodeType === 1 && (
                adown.contains ?
                adown.contains(bup) :
                a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
            ));
        } : function(a, b) {
            if (b) {
                while ((b = b.parentElement)) {
                    if (b === a) {
                        return true;
                    }
                }
            }
            return false;
        };

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
                if (compare & 1 ||
                    (!sortDetached && b.compareDocumentPosition(a) === compare)) {

                    // Choose the first element that is related to our preferred document
                    if (a === doc || a.ownerDocument === winDoc && features.contains(winDoc, a)) {
                        return -1;
                    }
                    if (b === doc || b.ownerDocument === winDoc && features.contains(winDoc, b)) {
                        return 1;
                    }

                    // Maintain original order
                    return sortInput ?
                        (_indexOf(sortInput, a) - _indexOf(sortInput, b)) :
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
                        (_indexOf(sortInput, a) - _indexOf(sortInput, b)) :
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

    // Set document
    
    locale.setDocument(winDoc);

    var uniqueSort = function(results) {
        var elem,
            duplicates = [],
            j = 0,
            i = 0;


        // Unless we *know* we can detect duplicates, assume their presence
        hasDuplicate = !detectDuplicates;
        sortInput = !sortStable && results.slice(0);
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
    };

    return {
        root: locale.root,
        isXML: locale.isXML,
        isHTML: !locale.isXML(winDoc),
        expando: locale.expando,
        uniqueSort: uniqueSort,
        contains: locale.contains,
    };
});