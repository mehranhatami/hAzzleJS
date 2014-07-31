//  CSS position, width and height
var
    dir = [ "Top", "Right", "Bottom", "Left" ],

    splitRegex = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)$/i,
    numRegex = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
    displayRegex = /^(none|table(?!-c[ea]).+)/,

    cssShow = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
    };

hAzzle.extend({

    position: function() {

        if (this[0]) {

            var offsetParent, offset,
                parentOffset = {
                    top: 0,
                    left: 0
                },
                elem = this[0];

            if (hAzzle.css(elem, 'position') === 'fixed') {

                offset = elem.getBoundingClientRect();

            } else {

                offsetParent = this.offsetParent();

                offset = this.offset();

                if (!hAzzle.nodeName(offsetParent[0], 'html')) {

                    parentOffset = offsetParent.offset();
                }

                parentOffset.top += hAzzle.css(offsetParent[0], 'borderTopWidth', true);
                parentOffset.left += hAzzle.css(offsetParent[0], 'borderLeftWidth', true);
            }

            return {

                top: offset.top - parentOffset.top - hAzzle.css(elem, 'marginTop', true),
                left: offset.left - parentOffset.left - hAzzle.css(elem, 'marginLeft', true)
            };
        }
        return null;
    }
});

/* ============================ CSS HOOKS FOR POSITIONS =========================== */

hAzzle.each(['height', 'width'], function(name) {
    hAzzle.cssHooks[name] = {
        get: function(elem, computed, extra) {
            if (computed) {
                return elem.offsetWidth === 0 && displayRegex.test(hAzzle.css(elem, 'display')) ?
                    hAzzle.swap(elem, cssShow, function() {
                        return getWidthOrHeight(elem, name, extra);
                    }) :
                    getWidthOrHeight(elem, name, extra);
            }
        },

        set: function(elem, value, extra) {
            var styles = extra && hAzzle.computeStyle(elem);
            return setPositiveNumber(elem, value, extra ?
                augmentWidthOrHeight(
                    elem,
                    name,
                    extra,
                    hAzzle.css(elem, 'boxSizing', false, styles) === 'border-box',
                    styles
                ) : 0
            );
        }
    }
});


/* ============================ UTILITY METHODS =========================== */

function getWidthOrHeight(elem, name, extra) {

    var valueIsBorderBox = true,
        val = name === 'width' ? elem.offsetWidth : elem.offsetHeight,
        styles = hAzzle.computeStyle(elem);

    if (name === 'width') {

        val = elem.offsetWidth;

    } else {

        val = elem.offsetHeight;
    }

    if (val <= 0 || val === null) {

        val = curCSS(elem, name, styles);

        if (val < 0 || val === null) {

            val = elem.style[name];
        }

        if (numRegex.test(val)) {

            return val;
        }

        valueIsBorderBox = hAzzle.boxSizing &&

            (hAzzle.boxSizingReliable || val === elem.style[name]);

        val = parseFloat(val) || 0;
    }

    return (val + augmentWidthOrHeight(
        elem,
        name,
        extra || (hAzzle.boxSizing ? 'border' : 'content'),
        valueIsBorderBox,
        styles
    )) + 'px';
}

function setPositiveNumber(elem, value, subtract) {
    var matches = splitRegex.exec(value);
    return matches ?
        Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || 'px') :
        value;
}

function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {

    var css = hAzzle.css,
        i = extra === (isBorderBox ? 'border' : 'content') ? 4 :
        name === 'width' ? 1 : 0,
        val = 0;

    for (; i < 4; i += 2) {

        if (extra === 'margin') {

            val += hAzzle.css(elem, extra + dir[i], true, styles);
        }

        if (isBorderBox) {

            if (extra === 'content') {

                val -= css(elem, 'padding' + dir[i], true, styles);
            }

            if (extra !== 'margin') {

                val -= css(elem, 'border' + dir[i] + 'Width', true, styles);
            }

        } else {


            val += css(elem, 'padding' + dir[i], true, styles);

            if (extra !== 'padding') {

                val += css(elem, 'border' + dir[i] + 'Width', true, styles);
            }
        }
    }

    return val;
}

/* ============================ INTERNAL =========================== */


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
hAzzle.each({
    Height: 'height',
    Width: 'width'
}, function(type, name) {
    hAzzle.each({
            padding: 'inner' + name,
            content: type,
            '': 'outer' + name
        },
        function(funcName, defaultExtra) {

            hAzzle.Core[funcName] = function(margin, value) {
                var chainable = arguments.length && (defaultExtra || typeof margin !== 'boolean'),
                    extra = defaultExtra || (margin === true || value === true ? 'margin' : 'border');

                return hAzzle.setter(this, function(elem, type, value) {
                    var doc;

                    if (hAzzle.isWindow(elem)) {
                        return elem.document.documentElement['client' + name];
                    }
                    if (elem.nodeType === 9) {
                        doc = elem.documentElement;

                        return Math.max(
                            elem.body['scroll' + name], doc['scroll' + name],
                            elem.body['offset' + name], doc['offset' + name],
                            doc['client' + name]
                        );
                    }

                    return value === undefined ?
                        // Get width or height on the element, requesting but not forcing parseFloat
                        hAzzle.css(elem, type, extra) :

                        // Set width or height on the element
                        hAzzle.style(elem, type, value, extra);
                }, type, chainable ? margin : undefined, chainable, null);
            };
        });
});