//  offset.js
hAzzle.Core.offset = function(options) {

    if (arguments.length) {
        return options === undefined ?
            this :
            this.each(function(elem, i) {
                setOffset(elem, options, i);
            });
    }

    var docElem, win,
        elem = this[0],
        box = {
            top: 0,
            left: 0,
            height: 0,
            width: 0
        },
        doc = elem && elem.ownerDocument;

    if (!doc) {
        return;
    }

    docElem = doc.documentElement;

    if (!elem ||
        // Make sure it's not a disconnected DOM node 
        !hAzzle.contains(docElem, elem)) {
        return box;
    }

    if (!doc) {
        return;
    }
    win = hAzzle.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;
    box = elem.getBoundingClientRect();

    return {
        top: box.top + (win.pageYOffset || doc.scrollTop  || 0)  - (doc.clientTop  || 0),
        left: box.left + (win.pageXOffset || doc.scrollLeft  || 0) - (doc.clientLeft || 0),
        height: elem.offsetHeight,
        width: elem.offsetWidth
        
        
    };
};

function setOffset(elem, ops, i) {
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
        sops.using.call(elem, props);

    } else {
        curElem.css(props);
    }
}