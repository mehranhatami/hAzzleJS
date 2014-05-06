/*!
 * HTML
 */
var concat = Array.prototype.concat,

    doc = document,
    cached = [],
    isFunction = hAzzle.isFunction,

    xhtmlRegEx = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    tagNameRegEx = /<([\w:]+)/,
    htmlRegEx = /<|&#?\w+;/,
    // checked="checked" or checked
    checkedRegEx = /checked\s*(?:[^=]|=\s*.checked.)/i,
    rscriptType = /^$|\/(?:java|ecma)script/i,
    rscriptTypeMasked = /^true\/(.*)/,
    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
    singleRegEx = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);


(function () {
    var fragment = doc.createDocumentFragment(),
        div = fragment.appendChild(doc.createElement("div")),
        input = doc.createElement("input");

    input.setAttribute("type", "radio");
    input.setAttribute("checked", "checked");
    input.setAttribute("name", "t");

    div.appendChild(input);

    hAzzle.support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

    div.innerHTML = "<textarea>x</textarea>";
    hAzzle.support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
})();

/**
 * Disable "script" tags
 **/

function disableScript(elem) {
    elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
    return elem;
}

/**
 * Restore "script" tags
 **/


function restoreScript(elem) {
    var m = rscriptTypeMasked.exec(elem.type);
    m ? elem.type = m[1] : elem.removeAttribute("type");
    return elem;
}



hAzzle.extend({
	
	parseHTML: function (data, context, keepScripts) {
    
	if (!data || typeof data !== "string") {
        return null;
    }
    if (typeof context === "boolean") {
        keepScripts = context;
        context = false;
    }

   // Prevent XSS attack

   context = context || ( isFunction( doc.implementation.createHTMLDocument ) ? doc.implementation.createHTMLDocument() : document );
   
   var parsed = singleRegEx.exec(data),
        scripts = !keepScripts && [];

    // Single tag
    
	if (parsed) {
    
	    return [context.createElement(parsed[1])];
    }

    parsed = hAzzle.buildFragment([data], context, scripts);

    if (scripts && scripts.length) {
		
        hAzzle(scripts).remove();
    }

    return hAzzle.merge([], parsed.childNodes);
  
  },

    buildFragment: function (elems, context, scripts, selection) {

        var elem, tmp, tag, wrap, contains, j,
            fragment = context.createDocumentFragment(),
            nodes = [],
            i = 0,
            l = elems.length;
        
		for(i = elems.length; i--;){
        
		    elem = elems[i];

            if (elem || elem === 0) {

                // Add nodes directly
                if (typeof elem === "object") {
                    // Support: QtWebKit
                    // hAzzle.merge because push.apply(_, arraylike) throws
                    hAzzle.merge(nodes, elem.nodeType ? [elem] : elem);

                    // Convert non-html into a text node
                } else if (!htmlRegEx.test(elem)) {

                    nodes.push(context.createTextNode(elem));

                    // Convert html into DOM nodes
                } else {
					
                    tmp = tmp || fragment.appendChild(context.createElement("div"));

                    // Deserialize a standard representation
                    tag = (tagNameRegEx.exec(elem) || ["", ""])[1].toLowerCase();
                    wrap = wrapMap[tag] || wrapMap._default;
                    tmp.innerHTML = wrap[1] + elem.replace(xhtmlRegEx, "<$1></$2>") + wrap[2];

                    // Descend through wrappers to the right content
                    j = wrap[0];
                    while (j--) {
                        tmp = tmp.lastChild;
                    }

                    hAzzle.merge(nodes, tmp.childNodes);

                    // Remember the top-level container
                    tmp = fragment.firstChild;
                    tmp.textContent = "";
                }
            }
        }

        // Remove wrapper from fragment
        fragment.textContent = "";

        i = 0;
		
        while ((elem = nodes[i++])) {

            if (selection && hAzzle.inArray(elem, selection) !== -1) {
                continue;
            }

            contains = hAzzle.contains(elem.ownerDocument, elem);

            // Append to fragment
            tmp = getAll(fragment.appendChild(elem), "script");

            // Preserve script evaluation history
            if (contains) {
                setGlobalEval(tmp);
            }

            // Capture executables
            if (scripts) {
                j = 0;
                while ((elem = tmp[j++])) {
                    if (rscriptType.test(elem.type || "")) {
                        scripts.push(elem);
                    }
                }
            }
        }

        return fragment;
    }
});



hAzzle.extend(hAzzle.fn, {


    manipulateDOM: function (args, callback) {

        // Flatten any nested arrays
        args = concat.apply([], args);

        var fragment, first, scripts, hasScripts, node, doc,
            i = 0,
            l = this.length,
            set = this,
            iNoClone = l - 1,
            value = args[0],
            isFunction = hAzzle.isFunction(value);

        // We can't cloneNode fragments that contain checked, in WebKit
        if (isFunction ||
            (l > 1 && typeof value === "string" &&
                !hAzzle.support.checkClone && checkedRegEx.test(value))) {
            return this.each(function (index) {
                var self = set.eq(index);
                if (isFunction) {
                    args[0] = value.call(this, index, self.html());
                }
                self.manipulateDOM(args, callback);
            });
        }

        if (l) {

            fragment = hAzzle.buildFragment(args, this[0].ownerDocument, false, this);

            first = fragment.firstChild;

            if (fragment.childNodes.length === 1) {
                fragment = first;
            }


            if (first) {
                scripts = hAzzle.map(getAll(fragment, "script"), disableScript);
                hasScripts = scripts.length;

                // Use the original fragment for the last item instead of the first because it can end up
                // being emptied incorrectly in certain situations (#8070).
                for (; i < l; i++) {
                    node = fragment;

                    if (i !== iNoClone) {
                        node = hAzzle.clone(node, true, true);

                        // Keep references to cloned scripts for later restoration
                        if (hasScripts) {
                            // Support: QtWebKit
                            // hAzzle.merge because push.apply(_, arraylike) throws
                            hAzzle.merge(scripts, getAll(node, "script"));
                        }
                    }

                    callback.call(this[i], node, i);
                }

            }
        }

        return this;
    }
});

// Mark scripts as having already been evaluated

function setGlobalEval(elems, refElements) {
    var i = 0,
        l = elems.length;

    for (; i < l; i++) {
        hAzzle.data(
            elems[i], "globalEval", !refElements || hAzzle.data(refElements[i], "globalEval")
        );
    }
}

function getAll(context, tag) {
    var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") :
        context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];

    return tag === undefined || tag && hAzzle.nodeName(context, tag) ?
        hAzzle.merge([context], ret) :
        ret;
}