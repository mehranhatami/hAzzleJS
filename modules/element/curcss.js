// curcss.js
hAzzle.define('curCSS', function() {

    var _detection = hAzzle.require('Detection'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),
        _util = hAzzle.require('Util'),
        _storage = hAzzle.require('Storage'),

        sLnline = /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
        sListitem = /^(li)$/i,
        sTablerow = /^(tr)$/i,

        computedStyle = !!document.defaultView.getComputedStyle,

        computedValues = _detection.isWebkit ? function(elem) {

            var s;
            if (elem.nodeType === 1) {
                var dv = elem.ownerDocument.defaultView;
                s = dv.getComputedStyle(elem, null);
                if (!s && elem.style) {
                    elem.style.display = '';
                    s = dv.getComputedStyle(elem, null);
                }
            }
            return s || {};
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
                return view && computedStyle ?
                    (view.opener ? view.getComputedStyle(elem, null) :
                        window.getComputedStyle(elem, null)) : elem.style;
            }
            return null;
        },
        computedCSS = function(elem) {
            if (elem) {
                if (_storage.privateData.get(elem, 'computed') === undefined) {
                    _storage.privateData.access(elem, 'computed', {
                        computedStyle: null,
                    });
                }
                return _storage.privateData.get(elem, 'computed');
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
            if (sLnline.test(tagName)) {
                return 'inline';
            }
            if (sListitem.test(tagName)) {
                return 'list-item';
            }
            if (sTablerow.test(tagName)) {
                return 'table-row';
            }
            return 'block';
        },

        getOffset = function(elem, options) {

            var els = elem.length ? elem : [elem];

            if (options && !_types.isEmptyObject(options)) {
                _util.each(els, function(elem, i) {
                    setOffset(elem, options, i);
                });
            }

            elem = els[0];

            var docElem, win,
                clientTop,
                clientLeft,
                scrollTop,
                scrollLeft,

                box = {
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0,
                    right: 0,
                    bottom: 0
                },
                doc = elem && elem.ownerDocument,
                body = doc.body;

            if (!doc) {
                return;
            }

            docElem = doc.documentElement;

            if (!elem ||
                // Make sure it's not a disconnected DOM node 
                !_core.contains(docElem, elem)) {
                return box;
            }

            if (!doc) {
                return;
            }

            win = _types.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;
            box = elem.getBoundingClientRect();
            clientTop = docElem.clientTop || body.clientTop || 0;
            clientLeft = docElem.clientLeft || body.clientLeft || 0;
            scrollTop = (win.pageYOffset || body.scrollTop);
            scrollLeft = (win.pageXOffset || body.scrollLeft) - (doc.clientLeft || 0);

            return {
                top: box.top + scrollTop - clientTop,
                left: box.left + scrollLeft - clientLeft,
                right: box.right + scrollLeft - clientLeft,
                bottom: box.bottom + scrollTop - clientTop,
                height: box.right - box.left,
                width: box.bottom - box.top
            };
        },

        setOffset = function(elem, ops, i) {
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

            if (typeof ops === 'function') {
                ops = ops.call(elem, i, curOffset);
            }

            if (ops.top !== null) {
                props.top = (ops.top - curOffset.top) + curTop;
            }
            if (ops.left !== null) {
                props.left = (ops.left - curOffset.left) + curLeft;
            }

            if ('using' in ops) {
                ops.using.call(elem, props);

            } else {
                curElem.css(props);
            }
        },

        getPosition = function(elem) {

            var offsetParent = function() {
                    var offsetParent = this.offsetParent || document;

                    while (offsetParent && (offsetParent.nodeType.toLowerCase !== 'html' && offsetParent.style.position === 'static')) {
                        offsetParent = offsetParent.offsetParent;
                    }

                    return offsetParent || document;
                },
                oP = offsetParent.apply(elem),
                parentOffset,
                _offset = getOffset(elem);

            // Get correct offsets

            if (!_util.nodeName(oP, 'html')) {
                parentOffset = getOffset(oP);
            }

            // Add offsetParent borders

            parentOffset.top += parseFloat(curCSS(oP, 'borderTopWidth'));
            parentOffset.left += parseFloat(curCSS(oP, 'borderLeftWidth'));

            // Subtract parent offsets and element margins

            return {
                top: _offset.top - parentOffset.top - parseFloat(curCSS(elem, 'marginTop')),
                left: _offset.left - parentOffset.left - parseFloat(curCSS(elem, 'marginLeft'))
            };
        };

    this.offset = function(options) {
        return getOffset(this.elements, options);
    };
    this.position = function() {
        return getPosition(this.elements[0]);
    };

    // Prop to jQuery for the name!

    var curCSS = function(elem, prop, force) {

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

        if ((_detection.ie ||
                _detection.isFirefox) && prop === 'borderColor') {
            prop = 'borderTopColor';
        }

        // Support: IE9
        // getPropertyValue is only needed for .css('filter')

        if (_detection === 9 && prop === 'filter') {
            computedValue = computedStyle.getPropertyValue(prop);
        } else {
            computedValue = computedStyle[prop];
        }

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
    };

    return {
        position: getPosition,
        offset: getOffset,
        computedCSS: computedCSS,
        getStyles: getStyles,
        curCSS: curCSS,
        getDisplayType: getDisplayType
    };
});