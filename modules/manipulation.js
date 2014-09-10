// manipulation.js
var

    manipRegex = {
        rsingleTag: (/^<(\w+)\s*\/?>(?:<\/\1>|)$/),
        innerHTMLRegexp: /<(script|style|link)/i,
        tagNameRegexp: /<([\w:]+)/,
        htmlRegexp: /<|&#?\w+;/,
        checkedRegexp: /checked\s*(?:[^=]|=\s*.checked.)/i,
        scriptRegexp: /^$|\/(?:java|ecma)script/i,
        maskedRegexp: /^true\/(.*)/,
        iAHRegexp: /<script|\[object/i,
        cleanScriptRegexp: /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        // element that self-closes but shouldn't ($1-$5) or no-innerHTML container ($6)
        xhtmlRegexp: /(<)(?!area|br|col|embed|hr|img|input|meta|param|link)(([\w:]+)[^>]*)(\/)(>)|(<(script|style|textarea)[^>]*>[\w\W]*?<\/\7\s*>|<!--[\w\W]*?--)/gi,
        // "<"; element name and content; ">"; "<"; "/"; element name; ">"; no-innerHTML container
        xhtmTaglReplacement: "$1$2$5$1$4$3$5$6",
    },

    // We have to close these tags to support XHTML

    htmlMap = {
        // Support: IE9
        option: [1, "<select multiple='multiple'>", '</select>'],
        thead: [1, '<table>', '</table>'],
        col: [2, '<table><colgroup>', '</colgroup></table>'],
        fieldset: [1, '<form>', '</form>'],
        legend: [2, '<form><fieldset>', '</fieldset></form>'],
        tr: [2, '<table><tbody>', '</tbody></table>'],
        td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
        base: [0, '', '']
    };

// Support: IE9
htmlMap.optgroup = htmlMap.option;
htmlMap.tbody = htmlMap.tfoot = htmlMap.colgroup = htmlMap.caption = htmlMap.thead;
htmlMap.th = htmlMap.td;
htmlMap.style = htmlMap.table = htmlMap.base;

hAzzle.extend({

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} value
     * @return {hAzzle|string}
     */

    html: function(value) {

        var elem = this[0] || {};

        if (value === undefined &&
            elem.nodeType === 1) {

            return elem.innerHTML;
        }

        if (typeof value === 'function') {

            return this.each(function(el, i) {

                var self = hAzzle(el);

                // Call the same function again

                self.html(value.call(el, i, self.html()));
            });
        }

        if (typeof value === 'number') {
            value = value.toString();
        }

        // Remove all data and avoid memory leaks before
        // appending HTML

        if (typeof value === 'string' && !manipRegex.innerHTMLRegexp.test(value) &&
            !htmlMap[(manipRegex.tagNameRegexp.exec(value) || ['', ''])[1].toLowerCase()]) {

            return this.empty().each(function(elem) {

                value = value.replace(manipRegex.xhtmlRegexp, manipRegex.xhtmTaglReplacement);

                try {

                    if (elem.nodeType === 1) {

                        elem.innerHTML = value;
                    }

                    elem = 0;

                } catch (e) {}
            });
        }

        // Fallback to 'append if 'value' are not a plain string value

        if (elem) {

            this.empty().append(value);
        }
    },

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection
     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {hAzzle|String}
     */

    text: function(value) {

        return hAzzle.setter(this, function(value) {
            return value === undefined ?
                hAzzle.getText(this) :
                this.empty().each(function() {
                    if (this.nodeType === 1 ||
                        this.nodeType === 11 ||
                        this.nodeType === 9) {
                        this.textContent = value;
                    }
                });
        }, null, value, arguments.length);
    },

    /**
     * Insert content after each element in the set of matched elements.
     *
     * @return {hAzzle}
     *
     */

    before: function() {
        return this.Manipulation(arguments, function(elem) {
            if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
            }
        }, 'beforebegin');
    },

    /**
     * Insert content after each element in the set of matched elements.
     *
     * @return {hAzzle}
     *
     */

    after: function() {
        return this.Manipulation(arguments, function(elem) {
            if (this.parentNode) {
                this.parentNode.insertBefore(elem, this.nextSibling);
            }
        }, 'afterend');
    },

    Manipulation: function(args, filterFn, iAH) {

        args = Array.prototype.concat.apply([], args);

        var fragment, first, scripts, hasScripts, node, doc, tag,
            i = 0,
            set = this,
            l = set.length,
            noClone = l - 1,
            value = args[0],
            isFunction = hAzzle.isFunction(value);

        // We can't cloneNode fragments that contain checked, in WebKit

        if (isFunction ||
            (l > 1 && typeof value === 'string' &&
                !hAzzle.features['feature-cloneCheck'] && manipRegex.checkedRegexp.test(value))) {
            return this.each(function(index) {
                var self = set.eq(index);
                if (isFunction) {
                    args[0] = value.call(this, index, self.html());
                }
                self.Manipulation(args, filterFn, iAH);
            });
        }

        if (l) {
            // set
            fragment = createDocFragment(args, this[0].ownerDocument, this);
            first = fragment.firstChild;

            if (fragment.childNodes.length === 1) {
                fragment = first;
            }

            if (first) {

                // Use insertAdjacentHTML if possible

                if (iAH) {

                    return insertAdjacent(args.join(''), iAH, set, filterFn);
                }

                scripts = hAzzle.map(hAzzle.grab(fragment, 'script'), disableScript);
                hasScripts = scripts.length;

                for (; i < l; i++) {
                    node = fragment;

                    if (i !== noClone) {
                        node = hAzzle.clone(node, true, true);

                        // Keep references to cloned scripts for later restoration
                        if (hasScripts) {
                            hAzzle.merge(scripts, hAzzle.grab(node, 'script'));
                        }
                    }

                    filterFn.call(this[i], node, i);
                }

                if (hasScripts) {
                    doc = scripts[scripts.length - 1].ownerDocument;

                    // Reenable scripts
                    hAzzle.map(scripts, restoreScript);

                    // Evaluate executable scripts on first document insertion
                    for (i = 0; i < hasScripts; i++) {
                        node = scripts[i];
                        if (manipRegex.scriptRegexp.test(node.type || '') &&
                            !hAzzle.private(node, 'hAzzleGlobal') &&
                            hAzzle.contains(doc, node)) {
                            if (node.src) {
                                if (hAzzle.evalUrl) {
                                    hAzzle.evalUrl(node.src);
                                }
                            } else {
                                hAzzle.globalEval(node.textContent.replace(manipRegex.cleanScriptRegexp, ''));
                            }
                        }
                    }
                }
            }
        }
        return this;
    },

    /**
     * Replace current element with html
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function() {
        var arg = arguments[0];
        this.Manipulation(arguments, function(elem) {
            arg = this.parentElement;
            hAzzle.clearData(hAzzle.grab(this));
            if (arg) {
                arg.replaceChild(elem, this);
            }
        });
        return arg && (arg.length || arg.nodeType) ? this : this.remove();
    }
});


hAzzle.each({
    appendTo: 'append',
    prependTo: 'prepend',
    insertBefore: 'before',
    insertAfter: 'after',
    replaceAll: 'replaceWith'
}, function(original, name) {
    hAzzle.Core[name] = function(selector) {
        var elems,
            ret = [],
            insert = hAzzle(selector),
            last = insert.length - 1,
            i = 0;

        for (; i <= last; i++) {
            elems = i === last ? this : this.clone(true);
            hAzzle(insert[i])[original](elems);

            push.apply(ret, elems.get());
        }

        return hAzzle(ret);
    };
});

/* ============================ UTILITY METHODS =========================== */


function insertAdjacent(html, place, set, filterFn) {
  var  tag = (manipRegex.tagNameRegexp.exec(html) || ['', ''])[1].toLowerCase();

    if (!manipRegex.iAHRegexp.test(html) && !htmlMap[tag]) {
        return set.each(function(index) {
            if (this.insertAdjacentHTML &&
                this.parentNode &&
                this.parentNode.nodeType === 1) {
                this.insertAdjacentHTML(place, html.replace(manipRegex.xhtmlRegexp, '<$1></$2>'));

            } else {
                set.eq(index).Manipulation(args, filterFn);
            }
        });
    }

}

function manipulationTarget(elem, content) {
    return hAzzle.nodeName(elem, 'table') &&
        hAzzle.nodeName(content.nodeType !== 11 ? content : content.firstChild, 'tr') ?
        elem.getElementsByTagName('tbody')[0] ||
        elem.appendChild(elem.ownerDocument.createElement('tbody')) :
        elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript(elem) {
    elem.type = (elem.getAttribute('type') !== null) + '/' + elem.type;
    return elem;
}

function restoreScript(elem) {
    var match;

    if ((match = manipRegex.maskedRegexp.exec(elem.type))) {
        elem.type = match[1];
    } else {
        elem.removeAttribute('type');
    }

    return elem;
}

function createDocFragment(elems, context, selection) {
    var elem, tmp, tag, wrap, contains, j,
        fragment = context.createDocumentFragment(),
        nodes = [],
        i = 0,
        l = elems.length;

    for (; i < l; i++) {

        elem = elems[i];

        if (elem || elem === 0) {

            // Add nodes directly

            if (hAzzle.type(elem) === 'object') {

                hAzzle.merge(nodes, elem.nodeType ? [elem] : elem);

                // Convert html into DOM nodes

            } else {
                tmp = tmp || fragment.appendChild(context.createElement('div'));

                // Deserialize a standard representation
                tag = (manipRegex.tagNameRegexp.exec(elem) || ['', ''])[1].toLowerCase();
                wrap = htmlMap[tag] || htmlMap.base;
                tmp.innerHTML = wrap[1] + elem.replace(manipRegex.xhtmlRegexp, manipRegex.xhtmTaglReplacement) + wrap[2];

                // Descend through wrappers to the right content
                j = wrap[0];

                while (j--) {
                    tmp = tmp.lastChild;
                }

                hAzzle.merge(nodes, tmp.childNodes);

                // Remember the top-level container

                tmp = fragment.firstChild;

                tmp.textContent = '';
            }
        }
    }

    // Remove wrapper from fragment
    fragment.textContent = '';
    fragment.innerHTML = ''; // Clear innerHTML

    i = 0;
    while ((elem = nodes[i++])) {

        if (selection && hAzzle.inArray(elem, selection) !== -1) {
            continue;
        }

        contains = hAzzle.contains(elem.ownerDocument, elem);

        // Append to fragment
        tmp = hAzzle.grab(fragment.appendChild(elem), 'script');

        // Preserve script evaluation history
        if (contains) {
            setGlobalEval(tmp);
        }
    }

    return fragment;
}

// Mark scripts as having already been evaluated
function setGlobalEval(elems, refElements) {
    var i = elems.length;

    while (i--) {
        hAzzle.setPrivate(
            elems[i], 'hAzzleGlobal', !refElements ||
            hAzzle.getPrivate(refElements[i], 'hAzzleGlobal')
        );
    }
}

// Append / Prepend

hAzzle.each({
    'append': 'beforeend',
    'prepend': 'afterbegin'
}, function(iah, name) {
    hAzzle.Core[name] = function() {
        return this.Manipulation(arguments, function(elem) {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                if (name === 'append') {
                    target.appendChild(elem);
                } else {
                    target.insertBefore(elem, target.firstChild);
                }
            }
        }, iah);
    };
});



hAzzle.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = manipRegex.rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = hAzzle.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		hAzzle( scripts ).remove();
	}

	return hAzzle.merge( [], parsed.childNodes );
};