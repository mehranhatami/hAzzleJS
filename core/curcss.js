// curcss.js
// Note! Contains *only* native CSS, and position, and offset, for more *advanced* CSS, 
// use the style.js module
hAzzle.define('curCSS', function() {

    var _has = hAzzle.require('has'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _util = hAzzle.require('Util'),
        _storage = hAzzle.require('Storage'),

        docElem = window.document.documentElement,

        computedValues = _has.has('ComputedStyle') && _has.has('webkit') ? function(elem) {
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

            if (elem && elem.ownerDocument !== null) {
                var view = false;
                if (elem) {
                    if (elem.ownerDocument !== undefined) {
                        view = elem.ownerDocument.defaultView;
                    }
                    if( _has.has('ComputedStyle')) {
                    
                    if(view && view.opener) {
                        return view.getComputedStyle(elem, null);
                        }
                        return window.getComputedStyle(elem, null);
                    } 
                    return elem.style;
                }
            }
            return '';
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

        curCSS = function(elem, prop, force) {

            if (typeof elem === 'object' && elem instanceof hAzzle) {
                elem = elem.elements[0];
            }
            var ret = 0;

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
                // getPropertyValue is only needed for .css('filter'). It's terrible slow and ugly too!

                if (_has.ie === 9 && prop === 'filter') {
                    ret = computedStyle.getPropertyValue(prop);
                } else {
                    ret = computedStyle[prop];
                }

                // Fall back to the property's style value (if defined) when 'ret' returns nothing

                if (ret === '' && !_core.contains(elem.ownerDocument, elem)) {
                    ret = elem.style[prop];
                }

                if (ret === 'auto' && (prop === 'top' || prop === 'right' || prop === 'bottom' || prop === 'left')) {

                    var pos = curCSS(elem, 'position');

                    if (pos === 'fixed' || (pos === 'absolute' && (prop === 'left' || prop === 'top'))) {
                        ret = hAzzle(elem).position()[prop] + 'px';
                    }
                }
                return ret !== undefined ?
                    // Support: IE9-11+
                    // IE returns zIndex value as an integer.
                    ret + '' :
                    ret;

            }
        },

        setOffset = function(elem, opts, i) {
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

            if (_types.isType('function')(opts)) {
                opts = opts.call(elem, i, curOffset);
            }

            if (opts.top != null) {
                props.top = (opts.top - curOffset.top) + curTop;
            }
            if (opts.left != null) {
                props.left = (opts.left - curOffset.left) + curLeft;
            }

            if ('using' in opts) {
                opts.using.call(elem, props);

            } else {
                curElem.css(props);
            }
        };

    this.offset = function(opts) {
        if (arguments.length) {
            return opts === undefined ?
                this.elements :
                this.each(function(elem, i) {
                    setOffset(elem, opts, i);
                });
        }
        var docElem, elem = this.elements[0],
            doc = elem && elem.ownerDocument;

        if (!doc) {
            return;
        }

        docElem = doc.documentElement;

        // Make sure it's not a disconnected DOM node
        if (!_core.contains(docElem, elem)) {
            return {
                top: 0,
                left: 0
            };
        }
        // All major browsers supported by hAzzle supports getBoundingClientRect, so no
        // need for a workaround

        var bcr = elem.getBoundingClientRect(),
            isFixed = (curCSS(elem, 'position') === 'fixed'),
            win = _types.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;
        return {
            top: bcr.top + elem.parentNode.scrollTop + ((isFixed) ? 0 : win.pageYOffset) - docElem.clientTop,
            left: bcr.left + elem.parentNode.scrollLeft + ((isFixed) ? 0 : win.pageXOffset) - docElem.clientLeft
        };
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

        elem = elem.parentNode;

        if (!_util.nodeName(elem, 'html')) {
            scroll.top += elem.scrollLeft;
            scroll.left += elem.scrollTop;
        }
        position = {
            top: offset.top - scroll.top,
            left: offset.left - scroll.left
        };

        if (relative && (relative = hAzzle(relative))) {
            var relativePosition = relative.getPosition();
            return {
                top: position.top - relativePosition.top - parseInt(curCSS(relative, 'borderLeftWidth')) || 0,
                left: position.left - relativePosition.left - parseInt(curCSS(relative, 'borderTopWidth')) || 0
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
        styles: getStyles,
        css: curCSS
    };
});