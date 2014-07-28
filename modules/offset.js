//  Offset
var docElem = hAzzle.docElem;

hAzzle.extend({

    /**
     * Calculates offset of the current element
     * @param {number} x
     * @param {number} y
     * @return {hAzzle|number}
     */

    offset: function(obj) {

        if (arguments.length) {

            return obj === undefined ?
                this :
                this.each(function(el, i) {
                    xy(el, obj, i);
                });
        }

        var el = this[0],
            d, w, boundingRect;

        if (el) {

            d = el.ownerDocument;
            boundingRect = el.getBoundingClientRect();
            w = getWindow(d);

            // If current element don't exist in the 
            // document root, return empty object

            if (!hAzzle.contains(docElem, el)) {

                return {
                    top: 0,
                    left: 0
                };
            }

            // Return all angeles of the 'offset'

            return {
                top: boundingRect.top + w.pageYOffset - docElem.clientTop,
                left: boundingRect.left + w.pageXOffset - docElem.clientLeft,
                right: boundingRect.right + w.pageXOffset - docElem.clientLeft,
                bottom: boundingRect.bottom + w.pageYOffset - docElem.clientTop,
                height: boundingRect.bottom - boundingRect.top,
                width: boundingRect.right - boundingRect.left
            };
        }
    },

    offsetParent: function() {
        return hAzzle(this.map(function(el) {
            var offsetParent = el.offsetParent || docElem;
            if (offsetParent) {
                while ((!hAzzle.nodeName(offsetParent, 'html') && hAzzle.css(offsetParent, 'position') === 'static')) {
                    offsetParent = offsetParent.offsetParent || docElem;
                }
            }
            return offsetParent;
        }));
    }
});


/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} element
 * @param {Object/Number} ops
 * @param {Number} i
 */
function xy(elem, ops, i) {

    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
        position = hAzzle.css(elem, 'position'),
        curElem = hAzzle(elem),
        props = {};

    // Set position first, in-case top/left are set even on static elem
    if (position === 'static') {

        elem.style.position = 'relative';
    }

    curOffset = curElem.offset();

    curCSSTop = hAzzle.css(elem, 'top');
    curCSSLeft = hAzzle.css(elem, 'left');

    calculatePosition = (position === 'absolute' || position === 'fixed') &&
        (curCSSTop + curCSSLeft).indexOf('auto') > -1;

    if (calculatePosition) {
        curPosition = curElem.position();
        curTop = curPosition.top;
        curLeft = curPosition.left;

    } else {
        curTop = parseFloat(curCSSTop) || 0;
        curLeft = parseFloat(curCSSLeft) || 0;
    }

    if (hAzzle.isFunction(ops)) {
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
}


// scrollTop and scrollLeft functions

hAzzle.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
}, function(prop, method) {
    var top = "pageYOffset" === prop;

    hAzzle.Core[method] = function(val) {
        return hAzzle.setter(this, function(elem, method, val) {
            var win = getWindow(elem);

            if (val === undefined) {
                return win ? win[prop] : elem[method];
            }

            if (win) {
                win.scrollTo(!top ? val : window.pageXOffset,
                    top ? val : window.pageYOffset
                );

            } else {
                elem[method] = val;
            }
        }, method, val, arguments.length, null);
    };
});

/**
 * Gets a window from an element
 */

function getWindow(elem) {
    return hAzzle.isWindow(elem) ? elem :
        elem.nodeType === 9 && elem.defaultView;
}