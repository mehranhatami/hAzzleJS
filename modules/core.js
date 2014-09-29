// Core.js
var
    CoreCache = {},
    toString = Object.prototype.toString,
    fNative = /\{\s*\[native code\]\s*\}/,
    mSmatches, expando = 'hAzzle-' + String(Math.random()).replace(/\D/g, ''),

    Core = {

        uidx: 1,
        uidk: 'hAzzle-uniqueid',

        isNativeCode: function(fn) {
            return (fNative).test('' + fn);
        },

        isXML: function(document) {
            return (!!document.xmlVersion) || (!!document.xml) || (toString.call(document) == '[object XMLDocument]') ||
                (document.nodeType == 9 && document.documentElement.nodeName != 'HTML');
        },

        setDocument: function(document) {

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
                Core = CoreCache[rootUid],
                feature;

            if (Core) {

                for (feature in Core) {
                    this[feature] = Core[feature];
                }
                return;
            }

            // Cache for better performance

            Core = CoreCache[rootUid] = {};
            Core.root = root;
            Core.isXMLDocument = this.isXML(document);
            Core['bug-GEBTN'] = Core.starSelectsClosedQSA =
                Core.idGetsName =
                Core.brokenMixedCaseQSA =
                Core.brokenGEBCN =
                Core.brokenCheckedQSA =
                Core.supportQSA =
                Core['api-mS'] =
                Core.brokenEmptyAttributeQSA =
                Core.isHTMLDocument = false;

            var starSelectsClosed, starSelectsComments,
                selected, id = 'hazzle_uniqueid',
                testNode = document.createElement('div'),
                testRoot = document.body || document.getElementsByTagName('body')[0] || root;

            testRoot.appendChild(testNode);

            // On non-HTML documents innerHTML and getElementsById doesnt work properly
            try {
                testNode.innerHTML = '<a id="' + id + '"></a>';
                Core.isHTMLDocument = !!document.getElementById(id);
            } catch (e) {}

            // If HTML

            if (Core.isHTMLDocument) {

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

                Core['bug-GEBTN'] = starSelectsComments || starSelectsClosed;

                // IE returns elements with the name instead of just id for getElementsById for some documents
                try {
                    testNode.innerHTML = '<a name="' + id + '"></a><b id="' + id + '"></b>';
                    Core.idGetsName = document.getElementById(id) === testNode.firstChild;
                } catch (e) {}

                // Webkit and Opera dont return selected options on querySelectorAll
                try {
                    testNode.innerHTML = '<select><option selected="selected">a</option></select>';
                    Core.brokenCheckedQSA = (testNode.querySelectorAll(':checked').length === 0);
                } catch (e) {}

                // IE returns incorrect results for attr[*^$]="" selectors on querySelectorAll
                try {
                    testNode.innerHTML = '<a class=""></a>';
                    Core.brokenEmptyAttributeQSA = (testNode.querySelectorAll('[class*=""]').length !== 0);
                } catch (e) {}

                // Are we supporting QSA?

                Core.supportQSA = !!Core.root.querySelectorAll;
            }

            Core['api-mS'] = fNative.test((mSmatches = Core.root.matches ||
                Core.root.webkitMatchesSelector ||
                Core.root.mozMatchesSelector ||
                Core.root.oMatchesSelector ||
                Core.root.msMatchesSelector));

            try {
                root.hAzzle_expando = 1;
                delete root.hAzzle_expando;
                Core.getUID = this.getUIDHTML;
            } catch (e) {
                Core.getUID = this.getUIDXML;
            }

            testRoot.removeChild(testNode);
            testNode = selected = testRoot = null;

            // contains
            // FIXME: Add specs: Core.contains should be different for xml and html documents?
            var nativeRootContains = root && this.isNativeCode(root.contains),
                nativeDocumentContains = document && this.isNativeCode(document.contains);

            Core.contains = (nativeRootContains && nativeDocumentContains) ? function(context, node) {
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

            Core.documentSorter = (root.compareDocumentPosition) ? function(a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return 0;
                }
                return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
            } : ('sourceIndex' in root) ? function(a, b) {
                if (!a.sourceIndex || !b.sourceIndex) {
                    return 0;
                }
                return a.sourceIndex - b.sourceIndex;
            } : null;

            root = null;

            for (feature in Core) {
                this[feature] = Core[feature];
            }
        },

        getUIDXML: function(node) {

            var uid = node.getAttribute(this.uidk);
            if (!uid) {
                uid = this.uidx++;
                node.setAttribute(this.uidk, uid);
            }
            return uid;
        },

        getUIDHTML: function(node) {
            return node.uniqueNumber || (node.uniqueNumber = this.uidx++);
        }
    };


/* ============================ BUG / FEATURE DETECTION =========================== */

(function() {
    var input = document.createElement('input'),

        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    input.type = 'checkbox';

    Core['bug-checkbox'] = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    Core['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 't');

    Core['bug-radioValue'] = input.value === 't';

})();

/* ============================ EXPOSE =========================== */

/**
 * Check if element is inside of context
 *
 * @param {Object} context
 * @param {Object} elem
 * @return {Boolean}
 */
hAzzle.contains = function(context, elem) {
    Core.setDocument(context);
    return Core.contains(context, elem);
};

// Expose

hAzzle.expando = expando;
hAzzle.features = Core;
hAzzle.setDocument = function(doc) {
    // Set document
    Core.setDocument(doc);

    window.document = Core.document;
    hAzzle.isXML = Core.isXML(document);
    hAzzle.documentIsHTML = hAzzle.isXML ? false : true;
    hAzzle.docElem = Core.root;
};

hAzzle.setDocument(document);