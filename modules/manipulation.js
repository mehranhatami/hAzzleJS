; (function ($) {

    var // Short-hand functions we are using

    isFunction = $.isFunction,
        isUndefined = $.isUndefined,
        isDefined = $.isDefined,
        isString = $.isString,

        doc = document,

        // Boolean attributes and elements

        boolean_attr = {
            'multiple': true,
            'selected': true,
            'checked': true,
            'disabled': true,
            'readOnly': true,
            'required': true,
            'open': true
        },

        boolean_elements = {
            'input': true,
            'select': true,
            'option': true,
            'textarea': true,
            'button': true,
            'form': true,
            'details': true
        },

        // Cross-browser compatible variabels

        optSelected,
        optDisabled,
        radioValue,
        checkOn,

        // RegEx we are using

        rtagName = /<([\w:]+)/,

        cached = [];

    // Support check

    (function () {

        var input = doc.createElement("input"),
            select = doc.createElement("select"),
            opt = select.appendChild(doc.createElement("option"));

        optSelected = opt.selected;

        select.disabled = true;
        optDisabled = !opt.disabled;

        input.type = "checkbox";

        checkOn = input.value !== "";

        input.value = "t";
        input.type = "radio";

        radioValue = input.value === "t";
    }());

    function getBooleanAttrName(element, name) {
        // check dom last since we will most likely fail on name
        var booleanAttr = boolean_attr[name.toLowerCase()];
        // booleanAttr is here twice to minimize DOM access
        return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
    }

    /**
     * Check if the elem matches the current nodeType
     */

    function NodeMatching(elem) {
        return $.nodeType(1, elem) || $.nodeType(9, elem) || $.nodeType(11, elem) ? true : false;
    }

    // Global

    $.extend($, {

        // Get the properties right

        propMap: {

            "for": "htmlFor",
            "class": "className"
        },

        Hooks: {

            'SELECT': function (elem) {

                var option,
                    options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === "select-one" || index < 0,
                    values = one ? null : [],
                    value,
                    max = one ? index + 1 : options.length,
                    i = index < 0 ?
                        max :
                        one ? index : 0;

                for (; i < max; i++) {

                    option = options[i];

                    if ((option.selected || i === index) && !option.disabled &&
                        (optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
                        (!option.parentNode.disabled || !$.nodeName(option.parentNode, "optgroup"))) {

                        // Get the specific value for the option
                        value = $(option).val();

                        // We don't need an array for one selects
                        if (one) {
                            return value;
                        }

                        // Multi-Selects return an array
                        values.push(value);
                    }
                }
                return values;
            },

            'OPTION': function (elem) {
                var val = $(elem).filter(function (option) {
                    return option.selected && !option.disabled;
                }).pluck('value');

                return val !== null ? val : $.trim($.getText(elem));
            },
            'TYPE': function (elem, value) {
                if (!radioValue && value === "radio" &&
                    $.nodeName(elem, "input")) {

                    var val = elem.value;
                    elem.setAttribute("type", value);
                    if (val) {
                        elem.value = val;
                    }
                    return value;
                }
            }
        },

        // Inspired by jQuery	

        propHooks: {
            tabIndex: {
                get: function (elem) {
                    return elem.hasAttribute("tabindex") || /^(?:input|select|textarea|button)$/i.test(elem.nodeName) || elem.href ?
                        elem.tabIndex : -1;
                }
            }
        },

        /**
         * Get text
         */

        getText: function (elem) {
            var node, ret = "",
                i = 0;

            if (!elem.nodeType) {
                // If no nodeType, this is expected to be an array
                for (; node = elem[i++];) ret += $.getText(node);

            } else if (NodeMatching(elem)) {

                if (isString(elem.textContent)) return elem.textContent;
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += $.getText(elem);

            } else if ($.nodeType(3, elem) || $.nodeType(4, elem)) {
                return elem.nodeValue;
            }
            return ret;
        },

        /**
         * Get / set the value of a property for the first element in the set of matched elements
         *
         * @param {Object} elem
         * @param {String} name
         * @param {String/Null} value
         *
         */

        prop: function (elem, name, value) {

            var ret, hooks, notxml;

            // don't get/set properties on text, comment and attribute nodes
            if (!$.nodeType(2, elem) || $.nodeType(3, elem) || !$.nodeType(8, elem)) {

                notxml = !($.nodeType(1, elem)) || !$.isXML(elem);

                if (notxml) {

                    hooks = $.propHooks[$.propMap[name] || name];
                }

                if (isDefined(value)) {

                    return hooks && "set" in hooks && isDefined((ret = hooks.set(elem, value, name))) ? ret : (elem[name] = value);

                } else {

                    return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
                }
            }
        },

        /**
         * Get / set the value of an attribute for the first element in the set of matched elements
         *
         * @param {Object} elem
         * @param {String} name
         * @param {String/Null} value
         *
         */

        attr: function (elem, name, value) {

            if (!elem) {

                return;
            }

            if (!$.nodeType(2, elem) || $.nodeType(3, elem) || !$.nodeType(8, elem)) {

                if (typeof elem.getAttribute === typeof undefined) {

                    return $.prop(elem, name, value);
                }

                if (isUndefined(value)) {

                    // Checks if a "hook" exist for this...:

                    if ($.Hooks[elem.nodeName]) {

                        return $.Hooks[elem.nodeName](elem);
                    }

                    // The extra argument "2" is to get the right thing for a.href in IE, see jQuery code
                    // some elements (e.g. Document) don't have get attribute, so return undefined

                    elem = elem.getAttribute(name, 2);

                    return elem === null ? undefined : elem;
                }

                // Jquery support a value to be an function, but I don't see the point
                // in supporting this now. If someone want to implement it, go for it !!

                if (isFunction(value)) {
                    console.log("Not supported!");
                    return;
                }

                if (value === null) {

                    $.removeAttr(elem, name);
                }


                // Value is set - no need for hooks on this one...

                if (elem.nodeName === 'SELECT') {

                    var optionSet, option,
                        options = elem.options,
                        values = $.makeArray(value),
                        i = options.length;

                    while (i--) {
                        option = options[i];
                        if ((option.selected = $.inArray(option.value, values) >= 0)) {
                            optionSet = true;
                        }
                    }

                    if (!optionSet) {
                        elem.selectedIndex = -1;
                    }
                    return values;

                } else {

                    elem.setAttribute(name, value + "");
                    return value;

                }
            }
        }
    });


    // Core

    $.extend($.fn, {

        /**
         * Get text for the first element in the collection
         * Set text for every element in the collection
         *
         * $('div').text() => div text
         *
         * @param {String} value
         * @param {String} dir
         * @return {Object|String}
         */

        text: function (value) {

            if (isDefined(value)) {

                // Avoid memory leaks, do empty()

                this.empty().each(function (_, elem) {

                    if (NodeMatching(elem)) {

                        // Firefox does not support insertAdjacentText 

                        if (isString(value) && isDefined(HTMLElement) && HTMLElement.prototype.insertAdjacentText) {

                            elem.insertAdjacentText('beforeEnd', value);

                        } else {

                            elem.textContent = value;
                        }
                    }
                });

            } else {

                // Get the textvalue

                return $.getText(this);
            }
        },

        /**
         * Get html from element.
         * Set html to element.
         *
         * @param {String} value
         * @param {String} keep
         * @return {Object|String}
         */

        html: function (value, keep) {

            var elem = this[0];

            if (isUndefined(value) && $.nodeType(1, elem)) {

                return elem.innerHTML;

            }

            // We could have used 'this' inside the loop, but faster if we don't

            if (isString(value)) {

                return this.each(function (_, elem) {

                    /**
                     * 'keep' if we want to keep the existing children of the node and add some more.
                     */
                    if (keep && isString(value) && $.nodeType(1, elem)) {

                        elem.insertAdjacentHTML('beforeend', value || '');

                    } else {

                        if (isString(value) && $.nodeType(1, elem) && !/<(?:script|style|link)/i.test(value) && !$.htmlHooks[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

                            // Do some magic

                            value = cached[value] ? cached[value] : cached[value] = value.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, "<$1></$2>");

                            // Remove stored data on the object to avoid memory leaks

                            $.removeData(elem);

                            // Get rid of existing children

                            elem.textContent = '';

                            // Do innerHTML

                            elem.innerHTML = value;
                        }
                    }
                });
            }

            return this.empty().append(value);
        },

        /**
         * Get value for input/select elements
         * Set value for input/select elements
         *
         * @param {String} value
         * @return {Object|String}
         */

        val: function (value) {

            if (arguments.length) {

                return this.each(function (index, elem) {

                    var val;

                    if (!$.nodeType(1, elem)) {
                        return;
                    }

                    if (isFunction(value)) {
                        val = value.call(elem, index, $(elem).val());

                    } else {

                        val = value;
                    }

                    if (val === null) {

                        val = "";

                    } else if (typeof val === "number") {

                        val += "";

                    } else if ($.isArray(val)) {

                        val = $.map(val, function (value) {

                            return value === null ? "" : value + "";
                        });
                    }

                    if (elem.type === 'radio' || elem.type === 'checkbox') {

                        return (elem.checked = $.inArray($(elem).val(), value) >= 0);
                    }

                    if (elem.type === "select") {


                        var optionSet, option,
                            options = elem.options,
                            values = $.makeArray(value),
                            i = options.length;

                        while (i--) {
                            option = options[i];
                            if ((option.selected = $.inArray(option.value, values) >= 0)) {
                                optionSet = true;
                            }
                        }

                        // force browsers to behave consistently when non-matching value is set
						
                        if (!optionSet) {
							
                            elem.selectedIndex = -1;
                        }
						
                        return values;
                    }

                    elem.value = val;
                });

            } else {

                var elem = this[0],
                    ret;

                if (!checkOn) {

                    return elem.getAttribute("value") === null ? "on" : elem.value;
                }

                ret = $.Hooks[elem.tagName] ? $.Hooks[elem.tagName](elem) : elem.value;

                return typeof ret === "string" ? ret.replace(/\r\n/g, "") : ret === null ? "" : ret;

            }
        },

        /**
         * Get attribute from element
         * Set attribute to element collection
         *
         * @param {String} name
         * @param {String|Object} value
         *
         * @return {Object|String}
         */

        attr: function (name, value) {
            return $.isObject(name) ? this.each(function (index, element) {
                $.each(name, function (key, value) {
                    $.attr(element, key, value);
                });
            }) : $.isUndefined(value) ? $.attr(this[0], name) : this.length === 1 ? $.attr(this[0], name, value) : this.each(function () {
                return $.attr(this, name, value);
            });
        },

        /**
         * Remove a given attribute from an element
         *
         * @param {String} value
         *
         * @return {Object}
         */

        removeAttr: function (value) {

            var name, propName, i = 0,
                attrNames = value && value.match(/\S+/g);

            return this.each(function (_, elem) {

                if (attrNames && $.nodeType(1, elem)) {

                    while ((name = attrNames[i++])) {
                        propName = $.propMap[name] || name;

                        if (getBooleanAttrName(elem, name)) {

                            elem[propName] = false;
                        }

                        elem.removeAttribute(name);
                    }
                }
            });
        },

        /**
         * Check if an element have an attribute
         *
         * @param{String} name
         * @return {Boolean}
         */

        hasAttr: function (name) {
            return name && isDefined(this.attr(name));
        },

        /**
         * Sets an HTML5 data attribute
         *
         * @param{String} dataAttribute
         * @param{String} dataValue
         *
         * @return {Object}
         */

        dataAttr: function (dataAttribute, dataValue) {

            if (!dataAttribute || !isString(dataAttribute)) {
                return false;
            }

            //if dataAttribute is an object, we will use it to set a data attribute for every key
            if (typeof (dataAttribute) == "object") {
                for (var key in dataAttribute) {
                    this.attr('data-' + key, dataAttribute[key]);
                }

                return this;
            }
			
            //if a value was passed, we'll set that value for the specified dataAttribute
			
            else if (dataValue) {
                return this.attr('data-' + dataAttribute, dataValue);
            }
			
            // lastly, try to just return the requested dataAttribute's value from the element
			
            else {
                var value = this.attr('data-' + dataAttribute);

                // specifically checking for undefined in case "value" ends up evaluating to false
				
                if (isUndefined(value)) {
                   return;
                }

                return value;
            }
        },

        /**
         * Read or set properties of DOM elements
         *
         * @param {String/Object}
         * @param {String/Null}
         *
         * @return {Object}
         */

        prop: function (name, value) {
            return $.isObject(name) ? this.each(function (value, element) {
                $.each(name, function (key, value) {
                    $.prop(element, key, value);
                });
            }) : isUndefined(value) ? this[0] && this[0][$.propMap[name] || name] : $.prop(this[0], name, value);
        },

        /**
         * Toggle properties
         */

        toggleProperty: function (property) {
            return this.each(function () {
                return this.prop(property, !this.prop(property));
            });

        },

        /*
         * Remove properties from DOM elements
         *
         * @param {String}
         *
         * @return {Object}
         */

        removeProp: function (name) {
            return this.each(function () {
                delete this[$.propMap[name] || name];
            });
        },

        /**
         * Replace each element in the set of matched elements with the provided new content
         *
         * @param {String} html
         * @return {Object}
         */

        replaceWith: function (html) {

            // Use the faster 'insertAdjacentHTML' if we can

            if (isString(html) && this[0].parentNode) {

                return this.before(html).remove();
            }

            // If function

            if (isFunction(html)) {
                return this.each(function (index) {
                    var self = $(this),
                        old = self.html();
                    self.replaceWith(html.call(this, index, old));
                });
            }

            var arg = arguments[0];
            this.manipulateDOM(arguments, function (elem) {

                arg = this.parentNode;

                if (arg) {
                    arg.replaceChild(elem, this);
                }
            });

            // Force removal if there was no new content (e.g., from empty arguments)
            return arg && (arg.length || arg.nodeType) ? this : this.remove();
        },

        /**
         * Append the current element to another
         *
         * @param {Object|String} sel
         * @return {Object}
         */

        appendTo: function (sel) {
            return this.each(function () {
                $(sel).append(this);
            });
        },

        /**
         * Prepend the current element to another.
         *
         * @param {Object|String} sel
         * @return {Object}
         */

        prependTo: function (sel) {
            return this.each(function () {
                $(sel).prepend(this);
            });
        }
    });


    /* 
     * Prepend, Append, Befor and After
     *
     *  NOTE!!!
     *
     *  If 'html' are plain text, we use the insertAdjacentHTML to inject the content.
     *	This method is faster, and now supported by all major browsers.
     *
     *	If not a pure string, we have to go the long way jQuery walked before us :)
     *
     *	K.F
     */


    $.each({

        prepend: "afterbegin",
        append: "beforeend"
    }, function (name, second) {

        $.fn[name] = function (html) {
			
            // Take the easy and fastest way if it's a string
			
            if (isString(html)) {
                return this.each(function (_, elem) {
                    if (NodeMatching(this)) {
                        elem.insertAdjacentHTML(second, html);
                    }
                });
            } else { // The long walk :(
                return this.manipulateDOM(arguments, function (elem) {
                    if (NodeMatching(this)) {

                        var target = $.nodeName(this, "table") &&
                            $.nodeName($.nodeType(11, elem) ? elem : elem.firstChild, "tr") ?
                            this.getElementsByTagName("tbody")[0] ||
                            elem.appendChild(this.ownerDocument.createElement("tbody")) :
                            this;
							
                        // Choose correct method	
						
                        name === 'prepend' ? target.insertBefore(elem, target.firstChild) : target.appendChild(elem);
                    }
                });
            }
        };
    });

    /**
     * Before and After
     */

    $.each({
        before: "beforebegin",
        after: "afterend"
    }, function (name, second) {

        $.fn[name] = function (html) {
            if (isString(html)) {
                return this.each(function () {
                    this.insertAdjacentHTML(second, html);
                });
            }
            return this.manipulateDOM(arguments, function (elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, name === 'after' ? this.nextSibling : this);
                }
            });
        };
    });

    // Support: IE9+
    if (!optSelected) {
        $.propHooks.selected = {
            get: function (elem) {
                var parent = elem.parentNode;
                if (parent && parent.parentNode) {
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }

    $.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
    ], function () {
        $.propMap[this.toLowerCase()] = this;
    });

})(hAzzle);