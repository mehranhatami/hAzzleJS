// curcss.js
hAzzle.define('curCSS', function() {

    var _detection = hAzzle.require('Detection'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _storage = hAzzle.require('Storage'),

        inlineRegEx = /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
        listItemRegEx = /^(li)$/i,
        tablerowRegEx = /^(tr)$/i,
        
        docElem = window.document.documentElement,

        computedStyle = !!document.defaultView.getComputedStyle,

        computedValues = _support.computedStyle && _detection.isWebkit ? function(elem) {
            // Looks stupid, but gives better performance in Webkit browsers
            var str;
            if (elem.nodeType === 1) {
                var dv = elem.ownerDocument.defaultView;
                str = dv.getComputedStyle(elem, null);
                if (!str && elem.style) {
                    elem.style.display = '';
                    str = dv.getComputedStyle(elem, null);
                }
            }
            return str || {};
        } :

        function(elem) {
            var view = false;

            if (elem && elem !== window) {

                if (elem.ownerDocument !== undefined) {
                    view = elem.ownerDocument.defaultView;
                }
                // Support: IE<=11+, Firefox<=30+
                // IE throws on elements created in popups
                // FF meanwhile throws on frame elements through 'defaultView.getComputedStyle'
                return _support.cS ? (view && computedStyle ?
                    (view.opener ? view.getComputedStyle(elem, null) :
                        window.getComputedStyle(elem, null)) : elem.style) : elem.style;
            }
            return null;
        },
        computedCSS = function(elem) {
            if (elem) {
                if (_storage.private.get(elem, 'computed') === undefined) {
                    _storage.private.access(elem, 'computed', {
                        computedStyle: null,
                    });
                }
                return _storage.private.get(elem, 'computed');
            }
        },
        getStyles = function(elem) {
            var computed;
            if (computedCSS(elem).computedStyle === null) {
                computed = computedCSS(elem).computedStyle = computedValues(elem);
            } else {
                computed = computedCSS(elem).computedStyle;
            }

            return computed;
        },

        curHeight = function(elem, toggleDisplay) {
            var contentBoxHeight = elem.offsetHeight -
                (parseFloat(curCSS(elem, 'borderTopWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderBottomWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingTop')) || 0) -
                (parseFloat(curCSS(elem, 'paddingBottom')) || 0);

            revertDisplay(elem, toggleDisplay);

            return contentBoxHeight;
        },
        curWidth = function(elem, toggleDisplay) {
            var contentBoxWidth = elem.offsetWidth -
                (parseFloat(curCSS(elem, 'borderLeftWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderRightWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingLeft')) || 0) -
                (parseFloat(curCSS(elem, 'paddingRight')) || 0);

            revertDisplay(elem, toggleDisplay);

            return contentBoxWidth;
        },

        revertDisplay = function(elem, toggleDisplay) {
            if (toggleDisplay) {
                elem.style.display = 'none';
            }
        },

        getDisplayType = function(elem) {
            var tagName = elem.tagName.toLowerCase();
            if (inlineRegEx.test(tagName)) {
                return 'inline';
            }
            if (listItemRegEx.test(tagName)) {
                return 'list-item';
            }
            if (tablerowRegEx.test(tagName)) {
                return 'table-row';
            }
            return 'block';
        },

        // Prop to jQuery for the name!

        curCSS = function(elem, prop, force) {

            if (typeof elem === 'object' && elem instanceof hAzzle) {
                elem = elem.elements[0];
            }
            var computedValue = 0,
                toggleDisplay = false;

            if ((prop === 'height' || prop === 'width') && curCSS(elem, 'display') === 0) {
                toggleDisplay = true;
                elem.style.display = hAzzle.getDisplayType(elem);
            }

            if (!force) {

                if (prop === 'height' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curHeight(elem, toggleDisplay);
                } else if (prop === 'width' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curWidth(elem, toggleDisplay);
                }
            }

            var computedStyle = getStyles(elem);

            if (computedStyle) {

                // IE and Firefox do not return a value for the generic borderColor -- they only return 
                // individual values for each border side's color.

                if ((_detection.ie ||
                        _detection.isFirefox) && prop === 'borderColor') {
                    prop = 'borderTopColor';
                }

                // IE9 has a bug in which the 'filter' property must be accessed from 
                // computedStyle using the getPropertyValue method instead of a direct property lookup. 

                if (_detection === 9 && prop === 'filter') {
                    computedValue = computedStyle.getPropertyValue(prop);
                } else {
                    computedValue = computedStyle[prop];
                }

                // Fall back to the property's style value (if defined) when computedValue returns nothing

                if (computedValue === '' || computedValue === null) {
                    computedValue = elem.style[prop];
                }

                if (computedValue === 'auto' && (prop === 'top' || prop === 'right' || prop === 'bottom' || prop === 'left')) {

                    var position = curCSS(elem, 'position');

                    if (position === 'fixed' || (position === 'absolute' && (prop === 'left' || prop === 'top'))) {
                        computedValue = hAzzle(elem).position()[prop] + 'px';
                    }
                }
                return computedValue;
            }
        },
        
       
	setOffset = function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = curCSS( elem, "position" ),
			curElem = hAzzle( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = curCSS( elem, "top" );
		curCSSLeft = curCSS( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( _types.isType('function')( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
};

    this.offset = function(options) {
        if (arguments.length) {
            return options === undefined ?
                this.elements :
                this.each(function(elem, i) {
                    setOffset(elem, options, i);
                });
        }

        var docElem, win,
            elem = this.elements[0],
            box = {
                top: 0,
                left: 0
            },
            doc = elem && elem.ownerDocument;

        if (!doc) {
            return;
        }

        docElem = doc.documentElement;

        // Make sure it's not a disconnected DOM node
        if (!_core.contains(docElem, elem)) {
            return box;
        }

        // Support: BlackBerry 5, iOS 3 (original iPhone)
        // If we don't have gBCR, just use 0,0 rather than error
        if (elem.getBoundingClientRect) {
            box = elem.getBoundingClientRect();
        }
        win = _types.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;

        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    };

    this.position = function() {
            if (!this.elements[0]) {
                return;
            }

            var offsetParent, offset,
                elem = this.elements[0],
                parentOffset = {
                    top: 0,
                    left: 0
                };

            // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
            // because it is its only offset parent
            if (curCSS(elem, 'position') === 'fixed') {
                // Assume getBoundingClientRect is there when computed position is fixed
                offset = elem.getBoundingClientRect();

            } else {
                // Get *real* offsetParent
                offsetParent = this.offsetParent();

                // Get correct offsets
                offset = this.offset();

                if (!_util.nodeName(offsetParent.elements[0], 'html')) {

                    parentOffset = offsetParent.offset();
                }

                // Add offsetParent borders

                parentOffset.top += parseFloat(curCSS(offsetParent.elements[0], 'borderTopWidth', true));
                parentOffset.left += parseFloat(curCSS(offsetParent.elements[0], 'borderLeftWidth', true));
            }
            // Subtract offsetParent scroll positions

            parentOffset.top -= offsetParent.scrollTop();
            parentOffset.left -= offsetParent.scrollLeft();
            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - parseFloat(curCSS(elem, 'marginTop', true)),
                left: offset.left - parentOffset.left - parseFloat(curCSS(elem, 'marginLeft', true))
            };
        };

        this.offsetParent = function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || docElem;

                while (offsetParent && (!_util.nodeName(offsetParent, 'html') &&
                        curCSS(offsetParent, 'position') === 'static')) {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent || docElem;
            });
        };

    return {
        computedCSS: computedCSS,
        getStyles: getStyles,
        curCSS: curCSS,
        getDisplayType: getDisplayType
    };
});