/*!
 * HTML
 */

; (function ($) {

    var concat = Array.prototype.concat,

        doc = document,

        isFunction = $.isFunction,

        rtagName = /<([\w:]+)/,
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,

        rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/),
        rhtml = /<|&#?\w+;/,
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

        wrapMap = {

            // Support: IE 9
            option: [1, "<select multiple='multiple'>", "</select>"],

            thead: [1, "<table>", "</table>"],
            col: [2, "<table><colgroup>", "</colgroup></table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

            _default: [0, "", ""]
        };

    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    (function () {
        var fragment = doc.createDocumentFragment(),
            div = fragment.appendChild(doc.createElement("div")),
            input = doc.createElement("input");

        input.setAttribute("type", "radio");
        input.setAttribute("checked", "checked");
        input.setAttribute("name", "t");

        div.appendChild(input);

        $.support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

        div.innerHTML = "<textarea>x</textarea>";
        $.support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
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

    $.extend($, {

        Evaluated: function (elems, refElements) {
            var i = 0,
                l = elems.length;

            for (; i < l; i++) {
                $.data(elems[i], "evaluated", !refElements || $.data(refElements[i], "evaluated"));
            }
        },

        _evalUrl: function (url) {
            return $.ajax({
                url: url,
                type: "GET",
                dataType: "script",
                async: false,
                global: false,
                "throws": true
            });
        },

        parseHTML: function (data, context, keepScripts) {

            if (!data || typeof data !== "string") {
                return null;
            }

            if ($.isBoolean(context)) {
                keepScripts = context;
                context = false;
            }

            var parsed = rsingleTag.exec(data),
                scripts = !keepScripts && [],

             // Prevent XSS attack

              context = context || (isFunction(doc.implementation.createHTMLDocument) ? doc.implementation.createHTMLDocument() : doc);

            // Single tag

            if (parsed) {

                return [context.createElement(parsed[1])];
            }

            parsed = $.createHTML([data], context, scripts);

            if (scripts && scripts.length) {
                $(scripts).remove();
            }

            return $.merge([], parsed.childNodes);
        },

   /**
	* Create the HTML
    *
	*/
        createHTML: function (elems, context, scripts, selection) {

            if (!context) return;

            var elem, tmp, tag, wrap, contains, j,
                fragment = context.createDocumentFragment(),
                nodes = [],
                i = 0,
                l = elems.length;

            $.each(elems, function (_, elem) {

                if (elem || elem === 0) {

                    // Add nodes directly

                    if (typeof elem === "object") {

                        $.merge(nodes, elem.nodeType ? [elem] : elem);

                    } else if (!rhtml.test(elem)) {

                        nodes.push(context.createTextNode(elem));

                    } else { // Suport for HTML 6

                        tmp = tmp || fragment.appendChild(context.createElement("div"));

                        // Deserialize a standard representation
						
                        tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                        wrap = wrapMap[tag] || wrapMap._default;
                        tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];


                        // Descend through wrappers to the right content
                        j = wrap[0];

                        while (j--) {
                            tmp = tmp.lastChild;
                        }

                        $.merge(nodes, tmp.childNodes);

                        tmp = fragment.firstChild;

                        tmp.textContent = "";
                    }
                }
            });

            // Remove wrapper from fragment
			
            fragment.textContent = "";

            i = 0;

            while ((elem = nodes[i++])) {

                if (selection && $.indexOf.call(selection, elem) === -1) continue;

                contains = $.contains(elem.ownerDocument, elem);

                // Append to fragment

                tmp = $.getChildren(fragment.appendChild(elem), "script");

                if (contains) {

                    $.Evaluated(tmp);
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

    $.extend($.fn, {

        // Inspiration from jQuery

        manipulateDOM: function (args, callback) {

            // Flatten any nested arrays

            args = concat.apply([], args);

            var fragment, first, scripts, hasScripts, node, doc,
                i = 0,
                l = this.length,
                set = this,
                iNoClone = l - 1,
                value = args[0],
                isFunction = $.isFunction(value);



            if (isFunction || (l > 1 && typeof value === "string" && !$.support.checkClone && rchecked.test(value))) {

                return this.each(function (index) {
                    var self = set.eq(index);
                    if (isFunction) {
                        args[0] = value.call(this, index, self.html());
                    }
                    self.manipulateDOM(args, callback);
                });
            }

            if (l) {

                fragment = $.createHTML(args, this[0].ownerDocument, false, this);

                first = fragment.firstChild;

                if (fragment.childNodes.length === 1) {
                    fragment = first;
                }

                if (first) {
                    scripts = $.map($.getChildren(fragment, "script"), disableScript);
                    hasScripts = scripts.length;

                    while (i < l) {

                        if (i !== iNoClone && !$.nodeType(3, fragment)) {

                            fragment = $.clone(fragment, true, true);

                            if (hasScripts) {
                                $.merge(scripts, $.getChildren(fragment, "script"));
                            }
                        }

                        callback.call(this[i], fragment, i);

                        i++;
                    }

                    if (hasScripts) {
                        doc = scripts[scripts.length - 1].ownerDocument;

                        // Reenable scripts
                        $.map(scripts, restoreScript);

                        // Evaluate executable scripts on first document insertion
                        for (i = 0; i < hasScripts; i++) {

                            node = scripts[i];
                            if (rscriptType.test(node.type || "") && !$.data(node, "evaluated") && $.contains(doc, node)) {

                                if (node.src) {
                                    // Optional AJAX dependency, but won't run scripts if not present
                                    if ($._evalUrl) {
                                        $._evalUrl(node.src);
                                    }
                                } else {
                                    $.Evaluated(node.textContent.replace(rcleanScript, ""));
                                }
                            }
                        }
                    }
                }
            }

            return this;
        }

    });

})(hAzzle);