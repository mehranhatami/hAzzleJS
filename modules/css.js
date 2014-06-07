/*!
 * CSS
 */
var win = this,
    doc = win.document,
    html = doc.documentElement,
    pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
    rrelNum = new RegExp('^([+-])=(' + pnum + ')', 'i'),
    lrmp = /^(left$|right$|margin|padding)/,
    reaf = /^(relative|absolute|fixed)$/,
    topbot = /^(top|bottom)$/,
    elemdisplay = {},

    cssPrefixes = ["Webkit", "O", "Moz", "ms"],

    getStyles = hAzzle.features.computedStyle ? function (el) {

        if (el && el.ownerDocument.defaultView.opener) {
            return el.ownerDocument.defaultView.getComputedStyle(el[0], null);
        }

        return el && win.getComputedStyle(el, null);

    } : function (el) {

        /**
         * We will never reach down here unless we are using some old
         * mobile browsers. Anyways. After a few months when all
         * vendors have upgraded their browsers - I guess we
         * can remove this 'hack'
         *
         */

        return el.style || el.currentStyle;
    },

    cssProps = {
        // normalize float css property
        "float": "cssFloat"
    };



function vendorPropName(style, name) {

    // shortcut for names that are not vendor prefixed
    if (name in style) {
        return name;
    }

    // check for vendor prefixed names
    var capName = name[0].toUpperCase() + name.slice(1),
        origName = name,
        i = cssPrefixes.length;

    while (i--) {
        name = cssPrefixes[i] + capName;
        if (name in style) {
            return name;
        }
    }

    return origName;
}

var cssNormalTransform = {
    letterSpacing: "0",
    fontWeight: "400"
};



/**
 * Get CSS3 transition prefix
 */

function getVendorPrefix() {
    var el = doc.createElement("div"),
        i = cssPrefixes.length;

    while (i--) {
        if (cssPrefixes[i] + "Transition" in el.style) {
            return cssPrefixes[i];
        }
    }

    return "transition" in el.style ? "" : false;
}

function actualDisplay(name, doc) {

    var style,
        docbody = doc.body,
        display,
        elem = doc.createElement(name);

    // Vanila solution is the best choice here

    docbody.appendChild(elem);

    display = win.getDefaultComputedStyle && (style = win.getDefaultComputedStyle(elem)) ? style.display : hAzzle.getStyle(elem[0], 'display');

    docbody.removeChild(elem);

    return display;
}


// Try to determine the default display value of an element
function defaultDisplay(nodeName) {

    var display = elemdisplay[nodeName];

    if (!display) {
        display = actualDisplay(nodeName, doc);

        // If the simple way fails, read from inside an iframe
        if (display === 'none' || !display) {

            // Use the already-created iframe if possible

            var iframe = iframe || doc.documentElement.appendChild('<iframe frameborder="0" width="0" height="0"/>');

            // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
            doc = iframe[0].contentDocument;

            // Support: IE
            doc.write();
            doc.close();

            display = actualDisplay(nodeName, doc);

            doc.documentElement.removeChild(iframe);
        }

        // Store the correct default display
        elemdisplay[nodeName] = display;
    }

    return display;
}

/**
 * Check if an element is hidden
 *  @return {Boolean}
 */

function isHidden(elem, el) {
    elem = el || elem;
    return elem.style.display === 'none';
}

/**
 * Show an element
 *
 * @param {Object} elem
 * @return Object}
 *
 *
 * FIXME!! Need a lot of tests and fixes to work correctly everywhere
 *
 */

function show(elem) {

    var style = elem.style;

    if (style.display === 'none') {

        style.display = '';
    }

    if ((style.display === '' && hAzzle.getStyle(elem, 'display') === 'none') || !hAzzle.contains(elem.ownerDocument.documentElement, elem)) {
        hAzzle.data(elem, 'display', defaultDisplay(elem.nodeName));
    }
}

/**
 * Show / Hide an elements
 *
 * @param {Object} elem
 * @param {Boolean} show
 * @return {Object}
 */

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = hAzzle.data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = hAzzle.data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				hAzzle.data( elem, "olddisplay", hidden ? display : hAzzle.getStyle( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}


/**
 * @param {string} p
 * @return {string}
 */

function styleProperty(p) {

    if (p === 'transform') {

        p = hAzzle.features.transform;

    } else if (/^transform-?[Oo]rigin$/.test(p)) {

        p = hAzzle.features.transform + 'Origin';
    }

    return p ? hAzzle.camelize(p) : null;
}

hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function (prop, value) {

        var p, obj = prop;

        // is this a request for just getting a style?

        if (value === undefined && typeof prop === 'string') {

            var val, el,
                hooks,
                origName = hAzzle.camelize(prop);

            el = this[0];

            // If no element, return

            if (!el) {

                return null;
            }

            // Inspiration from jQuery

            hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

            // Short-cuts for document and window size

            if (el === doc || el === win) {

                p = (el === doc) ? docu() : viewport();

                return prop === 'width' ? p.width : prop === 'height' ? p.height : '';
            }

            // If a hook was provided get the computed value from there

            if (hooks && "get" in hooks) {
                val = hooks.get(el, true);
            }

            // Otherwise, if a way to get the computed value exists, use that

            if (val === undefined) {

                val = hAzzle.getStyle(el, value);
            }

            //convert "normal" to computed value

            if (val === "normal" && name in cssNormalTransform) {

                val = cssNormalTransform[name];
            }

            return (prop = styleProperty(prop)) ? val : '';
        }

        /**
         * If both prop and value are string values, we
         * create an object out of it, so we can iterate
         * through
         */

        if (typeof prop === 'string') {
            obj = {};
            obj[prop] = value;
        }

        function fn(el) {

            for (var k in obj) {

                if (obj.hasOwnProperty(k)) {

                    return hAzzle.style(el, k, obj[k]);
                }

            }
        }

        // Loop through, and collect the result

        return this.each(fn);
    },

    /**
     * @param {number=} x
     * @param {number=} y
     * @return {hAzzle|number}
     */

    offset: function (options) {
        if (arguments.length) {
            return options === undefined ?
                this :
                this.each(function (el, i) {
                    xy(el, options, i);
                });
        }

        var el = this[0],
            bcr = {
                top: 0,
                left: 0
            };

        if (!hAzzle.contains(html, el)) {
            return bcr;
        }

        if (typeof el.getBoundingClientRect !== typeof undefined) {

            bcr = el.getBoundingClientRect();
        }

        // We return all angeles of the 'offset'

        return {
            top: bcr.top + win.pageYOffset - html.clientTop,
            left: bcr.left + win.pageXOffset - html.clientLeft,
            right: bcr.right + win.pageXOffset - html.clientLeft,
            bottom: bcr.bottom + win.pageYOffset - html.clientTop,
            height: bcr.bottom - bcr.top,
            width: bcr.right - bcr.left
        };
    },

    width: function (value) {

        var orig, ret, elem = this[0];

        if (!elem) return '';
        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement.clientWidth;
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement.clientWidth,
                elem.body.scrollWidth, elem.documentElement.scrollWidth,
                elem.body.clientWidth, elem.documentElement.clientWidth);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = hAzzle.getStyle(elem, 'width');
            ret = parseFloat(orig);
            return hAzzle.IsNaN(ret) ? ret : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css('width', value);

    },

    height: function (value) {

        var orig, ret, elem = this[0];

        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement.clientHeight;
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement.clientHeight,
                elem.body.scrollHeight, elem.documentElement.scrollHeight,
                elem.body.clientHeight, elem.documentElement.clientHeight);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = hAzzle.getStyle(elem, 'height');
            ret = parseFloat(orig);
            return hAzzle.IsNaN(ret) ? ret : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css('height', value);
    },

    /**
     * @param {number} y
     */

    scrollTop: function (val) {

        var elem = this[0],
            win = hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;

        if (typeof val === 'undefined') {

            return val ? val.pageYOffset : elem.scrollTop;
        }
        if (win) {
            win.scrollTo(window.scrollTop);
        } else {
            elem.scrollTop = val;
        }
    },

    /**
     * @param {number} val
     */

    scrollLeft: function (val) {
        var elem = this[0],
            win = hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;

        if (typeof val === 'undefined') {

            return val ? val.pageXOffset : elem.scrollLeft;
        }

        if (win) {

            win.scrollTo(window.scrollLeft);

        } else {

            elem.scrollLeft = val;
        }
    },

    offsetParent: function () {
        return hAzzle(this.map(function (el) {
            var op = el.offsetParent || doc.documentElement;
            while (op && (!hAzzle.nodeName(op, 'html') && hAzzle.getStyle(op, 'position') === 'static')) {
                op = op.offsetParent || doc.documentElement;
            }
            return op;
        }));
    },

    position: function () {

        if (!this[0]) {
            return null;
        }

        var offsetParent, offset,
            parentOffset = {
                top: 0,
                left: 0
            },
            elem = this[0];

        if (hAzzle.style(elem, "position") === "fixed") {
            // we assume that getBoundingClientRect is available when computed position is fixed
            offset = elem.getBoundingClientRect();

        } else {

            // Get *real* offsetParent

            offsetParent = this.offsetParent();

            // Get correct offsets

            offset = this.offset();

            if (!hAzzle.nodeName(offsetParent[0], "html")) {
                parentOffset = offsetParent.offset();
            }

            offset.top -= parseFloat(hAzzle(elem).css('margin-top')) || 0;
            offset.left -= parseFloat(hAzzle(elem).css('margin-left')) || 0;

            // Add offsetParent borders
            parentOffset.top += parseFloat(hAzzle(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat(hAzzle(offsetParent[0]).css('border-left-width')) || 0;
        }
        // Subtract the two offsets
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    },

    /**
     * Show elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback	 
     * @return {hAzzle}
     */

    show: function (speed, easing, callback) {
		if ( speed || speed === 0 ) {
			return this.animate( AnimProp("show"), speed, easing, callback);
		}
       return showHide( this, true );
    },

    /**
     * Hide elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback	 
     * @return {hAzzle}
     */

    hide: function (speed, easing, callback) {
		if ( speed || speed === 0 ) {
			return this.animate( AnimProp("hide"), speed, easing, callback);
		} 
       return showHide( this );
    },

    /**
     * Toggle show/hide.
     * @return {Object}
     */

    toggle: function (state) {
      if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
	  }
		return this.each(function() {
			if ( isHidden( this ) ) {
				hAzzle( this ).show();
			} else {
				hAzzle( this ).hide();
			}
		});
    }
});


// Let us extend the hAzzle Object a litle ...

hAzzle.extend({

// Properties that shouldn't have units behind e.g. 
// zIndex:33px are not allowed

    unitless: {
        'lineHeight': 1,
        'zoom': 1,
        'zIndex': 1,
        'opacity': 1,
        'boxFlex': 1,
        'WebkitBoxFlex': 1,
        'MozBoxFlex': 1,
        'columns': 1,
        'fontWeight': 1,
        'overflow': 1,
        'fillOpacity': 1,
        'flexGrow': 1,
        'columnCount': 1,
        'flexShrink': 1,
        'order': 1,
        'orphans': 1,
        'widows': 1,
    },

    /**
     * Yes, we are now supporting CSS hooks, but not
     * in the same way as jQuery.
     */

    cssHooks: {

        opacity: {
            get: function (el, computed) {

                if (computed) {
                    var ret = hAzzle.getStyle(el, "opacity");
                    return ret === "" ? "1" : ret;
                }
            }
        },
    },

    style: function (elem, name, value, extra) {

        var type, p, hooks, ret;

        // Don't set styles on text and comment nodes

        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {

            return;
        }

        var style = elem.style;

        // Check if we're setting a value

        if (value !== undefined) {

            type = typeof value;

            // Camelize the name

            p = styleProperty(name);

            name = cssProps[p] || (cssProps[p] = vendorPropName(style, p));

            // Props to jQuery

            hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[p];

            // convert relative number strings

            if (typeof value === 'string' && (ret = rrelNum.exec(value))) {
                value = (ret[1] + 1) * ret[2] + parseFloat(hAzzle.getStyle(elem, name));
                type = 'number';
            }


            // Make sure that null and NaN values aren't set.

            if (value === null || value !== value) {

                return;
            }

            // If a number was passed in, add 'px' to the (except for certain CSS properties)

            if (type === 'number' && !hAzzle.unitless[name]) {

                value += 'px';
            }

            if (!hAzzle.features.clearCloneStyle && value === '' && name.indexOf('background') === 0) {

                style[hAzzle.camelize(name)] = 'inherit';
            }

            // If a hook was provided, use that value, otherwise just set the specified value

            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                style[p] = hAzzle.setter(elem, value);
            }
        } else {

            return style[name];
        }

    },

    getStyle: function (elem, prop, computed) {

        var ret,
            value;

        /* FireFox, Chrome/Safari, Opera and IE9+
         * ONLY supports 'getComputedStyle'
         *
         * Some mobile browsers don't support it yet
         *
         * http://caniuse.com/getcomputedstyle
         */

        computed = computed || getStyles(elem);

        if (computed) {

            ret = computed.getPropertyValue(prop) || computed[prop];
        }

        if (computed) {

            if (ret === "" && !hAzzle.contains(elem.ownerDocument, prop)) {

                ret = hAzzle.style(elem, name);
            }
        }

        return ret !== undefined ?
            // Support: IE
            // IE returns zIndex value as an integer.
            ret + "" :
            ret;
    },

    /**
     * Converts one unit to another
     *
     * @param {Object} target
     * @param {String} prop
     * @param {String} returnUnit
     *
     */

    units: function (px, unit, elem, prop) {

        var val, num;

        switch (unit) {
        case "":
        case "px":
            return px; // Don't waste our time if there is no conversion to do.
        case "em":

            val = hAzzle.style(elem, "fontSize");
            num = parseFloat(val);

            prop = hAzzle.isNumeric(num) ? num || 0 : val;

            return px / prop;

        case "%":
            if (lrmp.test(prop)) {
                prop = "width";
            } else if (topbot.test(prop)) {
                prop = "height";
            }
            elem = reaf.test(hAzzle.getStyle(elem, "position")) ?
                elem.offsetParent : elem.parentNode;
            if (elem) {

                val = hAzzle.style(elem, prop);
                num = num = parseFloat(val);

                prop = hAzzle.isNumeric(num) ? num || 0 : val;

                if (prop !== 0) {
                    return px / prop * 100;
                }
            }
            return 0;
        }
        // The first time we calculate how many pixels there is in 1 meter
        // for calculate what is 1 inch/cm/mm/etc.
        if (hAzzle.units.unity === undefined) {
            var units = hAzzle.units.unity = {},
                div = document.createElement("div");
            div.style.width = "100cm";
            document.body.appendChild(div); // If we don't link the <div> to something, the offsetWidth attribute will be not set correctly.
            units.mm = div.offsetWidth / 1000;
            document.body.removeChild(div);
            units.cm = units.mm * 10;
            units.in = units.cm * 2.54;
            units.pt = units.in * 1 / 72;
            units.pc = units.pt * 12;
        }
        // If the unity specified is not recognized we return the value.
        unit = hAzzle.units.unity[unit];
        return unit ? px / unit : px;

    }

}, hAzzle);


/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} element
 * @param {Object/Number} options
 * @param {Number} i
 */
function xy(elem, options, i) {

    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
        position = hAzzle.getStyle(elem, "position"),
        curElem = hAzzle(elem),
        props = {};

    // Set position first, in-case top/left are set even on static elem
    if (position === "static") {
        elem.style.position = "relative";
    }

    curOffset = curElem.offset();

    curCSSTop = hAzzle.getStyle(elem, "top");
    curCSSLeft = hAzzle.getStyle(elem, "left");
    calculatePosition = (position === "absolute" || position === "fixed") &&
        hAzzle.inArray((curCSSTop + curCSSLeft), 'auto') > -1;

    // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if (calculatePosition) {
        curPosition = curElem.position();
        curTop = curPosition.top;
        curLeft = curPosition.left;

    } else {
        curTop = parseFloat(curCSSTop) || 0;
        curLeft = parseFloat(curCSSLeft) || 0;
    }

    if (hAzzle.isFunction(options)) {
        options = options.call(elem, i, curOffset);
    }

    if (options.top !== null) {
        props.top = (options.top - curOffset.top) + curTop;
    }
    if (options.left !== null) {
        props.left = (options.left - curOffset.left) + curLeft;
    }

    if ("using" in options) {
        options.using.call(elem, props);

    } else {
        curElem.css(props);
    }
}

function docu() {
    var vp = viewport();
    return {
        width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width),
        height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
    };
}

function viewport() {
    var self = this;
    return {
        width: self.innerWidth,
        height: self.innerHeight
    };
}
