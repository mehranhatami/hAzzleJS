// curcss.js
hAzzle.define('curCSS', function() {

    var _has = hAzzle.require('has'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _util = hAzzle.require('Util'),
        _support = hAzzle.require('Support'),
        _storage = hAzzle.require('Storage'),

        docElem = window.document.documentElement,

        computedStyle = !!document.defaultView.getComputedStyle,

        computedValues = _support.computedStyle && _has.has('webkit') ? function(elem) {
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
                        computedStyle: null
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
        curHeight = function(elem) {
            return elem.offsetHeight -
                (parseFloat(curCSS(elem, 'borderTopWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderBottomWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingTop')) || 0) -
                (parseFloat(curCSS(elem, 'paddingBottom')) || 0);
        },
        curWidth = function(elem) {
            return elem.offsetWidth -
                (parseFloat(curCSS(elem, 'borderLeftWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderRightWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingLeft')) || 0) -
                (parseFloat(curCSS(elem, 'paddingRight')) || 0);
        },
        // Prop to jQuery for the name!

        curCSS = function(elem, prop, force) {

            if (typeof elem === 'object' && elem instanceof hAzzle) {
                elem = elem.elements[0];
            }
            var computedValue = 0;

            if (!force) {

                if (prop === 'height' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curHeight(elem);
                } else if (prop === 'width' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curWidth(elem);
                }
            }

            var computedStyle = getStyles(elem);

            if (computedStyle) {

                // IE and Firefox do not return a value for the generic borderColor -- they only return 
                // individual values for each border side's color.

                if ((_has.ie || _has.has('firefox')) && prop === 'borderColor') {
                    prop = 'borderTopColor';
                }

                // Support: IE9
                // getPropertyValue is only needed for .css('filter')

                if (_has.ie === 9 && prop === 'filter') {
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

        setOffset = function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = curCSS(elem, 'position'),
                curElem = hAzzle(elem),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if (position === 'static') {
                elem.style.position = 'relative';
            }

            curOffset = curElem.offset();
            curCSSTop = curCSS(elem, 'top');
            curCSSLeft = curCSS(elem, 'left');
            calculatePosition = (position === 'absolute' || position === 'fixed') &&
                (curCSSTop + curCSSLeft).indexOf('auto') > -1;

            // Need to be able to calculate position if either
            // top or left is auto and position is either absolute or fixed
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;

            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }

            if (_types.isType('function')(options)) {
                options = options.call(elem, i, curOffset);
            }

            if (options.top != null) {
                props.top = (options.top - curOffset.top) + curTop;
            }
            if (options.left != null) {
                props.left = (options.left - curOffset.left) + curLeft;
            }

            if ('using' in options) {
                options.using.call(elem, props);

            } else {
                curElem.css(props);
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
        var docElem, elem = this.elements[0],
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
        // If we don't have gBCR, just use 0,0 rather than error
        if (elem.getBoundingClientRect) {

            var bound = elem.getBoundingClientRect(),
                isFixed = (curCSS(elem, 'position') == 'fixed');
            return {
                top: bound.top + elem.parentNode.scrollTop + ((isFixed) ? 0 : docElem.scrollTop) - docElem.clientTop,
                left: bound.left + elem.parentNode.scrollLeft + ((isFixed) ? 0 : docElem.scrollLeft) - docElem.clientLeft
            };
        }

        // Get *real* offsetParent
        var offsetParent = this.offsetParent();

        while (elem) {
            box.left += elem.offsetLeft;
            box.top += elem.offsetTop;

            if (_has.has('firefox')) {
                if (curCSS(elem, '-moz-box-sizing') !== 'border-box') {

                    box.top += parseInt(curCSS(elem, 'border-top-width')) || 0;
                    box.left += parseInt(curCSS(elem, 'border-left-width')) || 0;
                }
                var parent = elem.parentNode;
                if (parent && curCSS(parent, 'overflow') != 'visible') {
                    box.top += parseInt(curCSS(parent, 'border-top-width')) || 0;
                    box.left += parseInt(curCSS(parent, 'border-left-width')) || 0;
                }
            } else if (elem !== offsetParent.elements[0] && _has.has('safari')) {
                box.top += parseInt(curCSS(elem, 'border-top-width')) || 0;
                box.left += parseInt(curCSS(elem, 'border-left-width')) || 0;
            }

            if (_has.has('firefox') && curCSS(offsetParent.elements[0], '-moz-box-sizing') !== 'border-box') {
                box.top -= parseInt(curCSS(offsetParent.elements[0], 'border-top-width')) || 0;
                box.left -= parseInt(curCSS(offsetParent.elements[0], 'border-left-width')) || 0;
            }

            return box;
        }
    };

    this.position = function(relative) {

        var offset = this.offset(),
            elem = this.elements[0],
            scroll = {
                top: 0,
                left: 0
            },
            position = {
                top: 0,
                left: 0
            };

        if (!this.elements[0]) {
            return;
        }

        var element = elem.parentNode;
        
        while (element && !_util.nodeName(element, 'html')) {
            scroll.top += element.scrollLeft;
            scroll.left += element.scrollTop;
            element = element.parentNode;
        }
         position = {
            top: offset.top - scroll.top,
            left: offset.left - scroll.left
        };

        if (relative && (relative = hAzzle(relative))) {
            var relativePosition = relative.getPosition();
            return {
                top: position.top - relativePosition.top - parseInt(curCSS(relative, 'border-left-width')) || 0,
                y: position.left - relativePosition.left - parseInt(curCSS(relative, 'border-top-width')) || 0
            };
        }
        return position;
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
        computed: computedCSS,
        getStyles: getStyles,
        css: curCSS
    };
});