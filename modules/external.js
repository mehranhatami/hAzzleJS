//  External CSS functions

var docElem = hAzzle.docElem;

hAzzle.extend({

    /**
     * @param {number=} x
     * @param {number=} y
     * @return {hAzzle|number}
     */

    offset: function (ops) {
        if (arguments.length) {
            return ops === undefined ?
                this :
                this.each(function (el, i) {
                    xy(el, ops, i);
                });
        }

        var el = this[0],
            d = el && el.ownerDocument,
            w = getWindow(d),

            // getBoundingClientRect() are supported from IE9, and all the 
            // other major browsers hAzzle are supposed to support

            bcr = el.getBoundingClientRect();

        // If current element don't exist in the document
        // root, return empty object

        if (!hAzzle.contains(docElem, el)) {

            return {
                top: 0,
                left: 0
            };
        }

        // Return all angeles of the 'offset'

        return {
            top: bcr.top + w.pageYOffset - docElem.clientTop,
            left: bcr.left + w.pageXOffset - docElem.clientLeft,
            right: bcr.right + w.pageXOffset - docElem.clientLeft,
            bottom: bcr.bottom + w.pageYOffset - docElem.clientTop,
            height: bcr.bottom - bcr.top,
            width: bcr.right - bcr.left
        };
    },

    offsetParent: function () {
        return hAzzle(this.map(function (el) {
            var offsetParent = el.offsetParent || docElem;
            if (offsetParent) {
                while ((!hAzzle.nodeName(offsetParent, 'html') && hAzzle.css(offsetParent, 'position') === 'static')) {
                    offsetParent = offsetParent.offsetParent || docElem;
                }
            }
            return offsetParent;
        }));
    },

    position: function () {

        if (this[0]) {

            var offsetParent, offset,
                parentOffset = {
                    top: 0,
                    left: 0
                },
                elem = this[0];

            if (hAzzle.style(elem, 'position') === 'fixed') {

                offset = elem.getBoundingClientRect();

            } else {

                // Get *real* offsetParent

                offsetParent = this.offsetParent();

                // Get correct offsets

                offset = this.offset();

                if (!hAzzle.nodeName(offsetParent[0], 'html')) {

                    parentOffset = offsetParent.offset();
                }

                offset.top -= parseFloat(hAzzle.css(elem, 'margin-top')) || 0;
                offset.left -= parseFloat(hAzzle.css(elem, 'margin-left')) || 0;

                // Add offsetParent borders
                parentOffset.top += parseFloat(hAzzle.css(offsetParent[0], 'border-top-width')) || 0;
                parentOffset.left += parseFloat(hAzzle.css(offsetParent[0], 'border-left-width')) || 0;
            }
            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }
        return null;
    }
});


/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} element
 * @param {Object/Number} ops
 * @param {Number} i
 */
function xy(elem, ops, i) {

    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft,
        position = hAzzle.css(elem, 'position'),
        props = {};

        elem = hAzzle(elem);

    // Set position first, in-case top/left are set even on static elem
    if (position === 'static') {

        elem.style.position = 'relative';
    }

    curOffset = elem.offset();

    curCSSTop = hAzzle.css(elem, 'top');
    curCSSLeft = hAzzle.css(elem, 'left');

    // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed

    if ((position === 'absolute' || position === 'fixed') &&
        hAzzle.inArray((curCSSTop + curCSSLeft), 'auto') > -1) {
        curPosition = elem.position();
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
        elem.css(props);
    }
}

/**
 * Gets a window from an element
 */

function getWindow(elem) {
    return hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}



/**
 * Width and height
 */

hAzzle.each(['width', 'height'], function (name) {

    var dimensionProperty =
        name.replace(/./, function (m) {
            return m[0].toUpperCase();
        });

    hAzzle.Core[name] = function (value) {

        var elem = this[0],
            _doc = elem.documentElement;

        if (!elem) {

            return '';
        }

        if (getWindow(elem)) {

            return _doc['client' + dimensionProperty];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.body['scroll' + dimensionProperty], _doc['scroll' + dimensionProperty],
                elem.body['client' + dimensionProperty], _doc['client' + dimensionProperty],
                _doc['client' + dimensionProperty]
            );
        }

        // Get width or height on the element
        if (value === undefined) {

            return parseFloat(hAzzle.css(elem, name));
        }

        // Set the width or height on the element

        hAzzle(elem).css(name, value);
    };
});
