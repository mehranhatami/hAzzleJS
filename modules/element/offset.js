// offset.js
hAzzle.define('Offset', function () {

    var _style = hAzzle.require('Style'),
        _core = hAzzle.require('Core'),
        _types = hAzzle.require('Types'),

        offset = function (options) {

            if (arguments.length) {
                return options === undefined ?
                    this.elements :
                    this.each(function (elem, i) {
                        setOffset(elem, options, i);
                    });
            }

            var docElem, win,
                elem = this.elements[0],
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
                doc = elem && elem.ownerDocument;

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

            clientTop = doc.clientTop;
            clientLeft = doc.clientLeft;
            scrollTop = (win.pageYOffset || doc.scrollTop || 0),
                scrollLeft = (win.pageXOffset || doc.scrollLeft || 0) - (doc.clientLeft || 0);

            return {
                top: box.top + scrollTop - clientTop,
                left: box.left + scrollLeft - clientLeft,
                right: box.right + scrollLeft - clientLeft,
                bottom: box.bottom + scrollTop - clientTop,
                height: box.right - box.left,
                width: box.bottom - box.top
            };
        },

        setOffset = function (elem, ops, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = _style.getCSS(elem, 'position'),
                curElem = hAzzle(elem),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if (position === 'static') {
                elem.style.position = 'relative';
            }

            curOffset = curElem.offset();
            curCSSTop = _style.getCSS(elem, 'top');
            curCSSLeft = _style.getCSS(elem, 'left');
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
        };
    return {
        offset: offset
    };
});