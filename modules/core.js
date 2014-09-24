var features = {},
    featuresCache = {},
    toString = Object.prototype.toString,
    fMargsL = /(^| )a( |$)/,
    fMargsR = /(^| )b( |$)/,
    fNative = /\{\s*\[native code\]\s*\}/,
    matches, expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, '');

features.isNativeCode = function(fn) {
    return (fNative).test('' + fn);
};

features.isXML = function(document) {
    return (!!document.xmlVersion) || (!!document.xml) || (toString.call(document) == '[object XMLDocument]') ||
        (document.nodeType == 9 && document.documentElement.nodeName != 'HTML');
};

features.setDocument = function(document) {

    // Convert elements / window arguments to document. 
    // If document cannot be extrapolated, the function returns.

    var nodeType = document.nodeType;

    if (nodeType == 9); // document
    else if (nodeType) {
        document = document.ownerDocument; // node
    } else if (document.navigator) {
        document = document.document; // window
    } else {
        return;
    }

    // Check if it's the old document

    if (this.document === document) {
        return;
    }

    this.document = document;

    // Check if we have done feature detection on this document before

    var root = document.documentElement,
        rootUid = this.getUIDXML(root),
        features = featuresCache[rootUid],
        feature;

    if (features) {

        for (feature in features) {
            this[feature] = features[feature];
        }
        return;
    }

    // Cache for better performance

    features = featuresCache[rootUid] = {};
    features.root = root;
    features.isXMLDocument = this.isXML(document);
    features['bug-GEBTN'] = features.starSelectsClosedQSA =
        features.idGetsName =
        features.brokenMixedCaseQSA =
        features.brokenGEBCN =
        features.brokenCheckedQSA =
        features.brokenEmptyAttributeQSA =
        features.isHTMLDocument =
        features.nativeMatchesSelector = false;

    var starSelectsClosed, starSelectsComments,
        selected, id = 'hazzle_uniqueid',
        testNode = document.createElement('div'),
        testRoot = document.body || document.getElementsByTagName('body')[0] || root;

    testRoot.appendChild(testNode);

    // On non-HTML documents innerHTML and getElementsById doesnt work properly
    try {
        testNode.innerHTML = '<a id="' + id + '"></a>';
        features.isHTMLDocument = !!document.getElementById(id);
    } catch (e) {}

    // If HTML

    if (features.isHTMLDocument) {

        testNode.style.display = 'none';

        // IE returns comment nodes for getElementsByTagName('*') for some documents
        testNode.appendChild(document.createComment(''));
        starSelectsComments = (testNode.getElementsByTagName('*').length > 1);

        // IE returns closed nodes (EG:'</foo>') for getElementsByTagName('*') for some documents
        try {
            testNode.innerHTML = 'foo</foo>';
            selected = testNode.getElementsByTagName('*');
            starSelectsClosed = (selected && !!selected.length && selected[0].nodeName.charAt(0) == '/');
        } catch (e) {}

        //  Check if getElementsByTagName ('*') returns only elements

        features['bug-GEBTN'] = starSelectsComments || starSelectsClosed;

        // IE returns elements with the name instead of just id for getElementsById for some documents
        try {
            testNode.innerHTML = '<a name="' + id + '"></a><b id="' + id + '"></b>';
            features.idGetsName = document.getElementById(id) === testNode.firstChild;
        } catch (e) {}

        // Webkit and Opera dont return selected options on querySelectorAll
        try {
            testNode.innerHTML = '<select><option selected="selected">a</option></select>';
            features.brokenCheckedQSA = (testNode.querySelectorAll(':checked').length === 0);
        } catch (e) {}

        // IE returns incorrect results for attr[*^$]="" selectors on querySelectorAll
        try {
            testNode.innerHTML = '<a class=""></a>';
            features.brokenEmptyAttributeQSA = (testNode.querySelectorAll('[class*=""]').length !== 0);
        } catch (e) {}
    }

    try {
        root.hAzzle_expando = 1;
        delete root.hAzzle_expando;
        features.getUID = this.getUIDHTML;
    } catch (e) {
        features.getUID = this.getUIDXML;
    }

    testRoot.removeChild(testNode);
    testNode = selected = testRoot = null;

    // contains
    // FIXME: Add specs: features.contains should be different for xml and html documents?
    var nativeRootContains = root && this.isNativeCode(root.contains),
        nativeDocumentContains = document && this.isNativeCode(document.contains);

    features.contains = (nativeRootContains && nativeDocumentContains) ? function(context, node) {
        return context.contains(node);
    } : (nativeRootContains && !nativeDocumentContains) ? function(context, node) {
        // IE8 does not have .contains on document.
        return context === node || ((context === document) ? document.documentElement : context).contains(node);
    } : (root && root.compareDocumentPosition) ? function(context, node) {
        return context === node || !!(context.compareDocumentPosition(node) & 16);
    } : function(context, node) {
        if (node)
            do {
                if (node === context) {
                    return true;
                }
            } while ((node = node.parentNode));
        return false;
    };

    // Document order sorting
    // Credits to Sizzle (http://sizzlejs.com/)

    features.documentSorter = (root.compareDocumentPosition) ? function(a, b) {
        if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
            return 0;
        }
        return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
    } : ('sourceIndex' in root) ? function(a, b) {
        if (!a.sourceIndex || !b.sourceIndex) {
            return 0;
        }
        return a.sourceIndex - b.sourceIndex;
    } : (document.createRange) ? function(a, b) {
        if (!a.ownerDocument || !b.ownerDocument) {
            return 0;
        }
        var aRange = a.ownerDocument.createRange(),
            bRange = b.ownerDocument.createRange();
        aRange.setStart(a, 0);
        aRange.setEnd(a, 0);
        bRange.setStart(b, 0);
        bRange.setEnd(b, 0);
        return aRange.compareBoundaryPoints(aRange.START_TO_END, bRange);
    } : null;

    root = null;

    for (feature in features) {
        this[feature] = features[feature];
    }
};

features.uidx = 1;
features.uidk = 'hAzzle-uniqueid';
features.getUIDXML = function(node) {

    var uid = node.getAttribute(this.uidk);
    if (!uid) {
        uid = this.uidx++;
        node.setAttribute(this.uidk, uid);
    }
    return uid;
};

features.getUIDHTML = function(node) {
    return node.uniqueNumber || (node.uniqueNumber = this.uidx++);
};

// sort based on the setDocument documentSorter method.

features.sort = function(results) {
    if (!this.documentSorter) {
        return results;
    }
    results.sort(this.documentSorter);
    return results;
};


/* ============================ BUG / FEATURE DETECTION =========================== */

(function() {
    var input = document.createElement('input'),
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    input.type = 'checkbox';

    features['bug-checkbox'] = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    features['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 't');

    features['bug-radioValue'] = input.value === 't';

})();

hAzzle.assert(function(div) {

    div.classList.add('a', 'b');
    // Detect if the browser supports classList
    features['api-classList'] = !!document.documentElement.classList;
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it

    fMargsL = /(^| )a( |$)/,
        fMargsR = /(^| )b( |$)/,
        div.classList.add('a', 'b');
    /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);

    features['api-MultiArgs'] = fMargsL.test(div.className) && fMargsR.test(div.className);

    features['api-mS'] = fNative.test((matches = features.root.matches ||
        features.root.webkitMatchesSelector ||
        features.root.mozMatchesSelector ||
        features.root.oMatchesSelector ||
        features.root.msMatchesSelector));
});

features['bug-QSA'] = features['api-QSA'] ? hAzzle.assert(function(div) {

    div.innerHTML = "<p class='QsA'>hAzzle</p>";

    return div.querySelectorAll(".QsA").length === 0 ? false :
        // Check for broken :checked pseudo in Webkit/Opera
        !div.querySelectorAll(':checked').length ? false : true;
}) : false;

// MatchesSelector supported, test for bugs

features['bug-mS'] = features['api-mS'] ? hAzzle.assert(function(div) {

    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    return matches.call(div, 'div') ? false :
        // This should fail with an exception
        // Gecko does not error, returns false instead
        matches.call(div, "[s!='']:x") ? false : true;
}) : false;

/**
 * Check for getElementById bug
 * Support: IE<10
 */
features['bug-GEBI'] = hAzzle.assert(function(div) {
    hAzzle.docElem.appendChild(div).id = expando;
    return document.getElementsByName > 0 || document.getElementsByName(expando).length;
});

/* ============================ EXPOSE =========================== */

/**
 * Check if element is inside of context
 *
 * @param {Object} context
 * @param {Object} elem
 * @return {Boolean}
 */
hAzzle.contains = function(context, elem) {
    features.setDocument(context);
    return features.contains(context, elem);
};

hAzzle.unique = features.sort;


// Expose

hAzzle.expando = expando;
hAzzle.features = features;

hAzzle.setDocument = function() {
    // Set document
    features.setDocument(document);

    window.document = features.document;
    // hAzzle.isXML = features.isXML(document);
    hAzzle.documentIsHTML = hAzzle.isXML ? false : true;
    hAzzle.docElem = features.root;

}