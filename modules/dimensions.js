var dNumber = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)$/,
    dTrbl = ['Top', 'Right', 'Bottom', 'Left'],
    dNT = /^(none|table(?!-c[ea]).+)/,
    cssShow = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
    },
    swap = function(elem, options, callback) {
        var old = {},
            name, style = elem.style;

        // Remember the old values, and insert the new ones
        for (name in options) {
            old[name] = style[name];
            style[name] = options[name];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            style[name] = old[name];
        }
    },
    setWH = function(elem, computed, extra) {
        if (computed) {
            return dTNT.test(curCSS(elem, 'display', true)) &&
                elem.offsetWidth === 0 ?
                swap(elem, cssShow, function() {
                    return getWidthOrHeight(elem, name, extra);
                }) :
                getWidthOrHeight(elem, name, extra);
        }
    },
    getWH = function(elem, value, extra) {
        var styles = extra && getStyles(elem);
        return setPositiveNumber(elem, value, extra ?
            augmentWidthOrHeight(
                elem,
                name,
                extra,
                curCSS(elem, 'boxSizing', false, styles) === 'border-box',
                styles
            ) : 0
        );
    },
    setPositiveNumber = function(elem, value, subtract) {
        var matches = dNumber.exec(value);
        return matches ?
            // Guard against undefined 'subtract', e.g., when used as in cssHooks
            Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || 'px') :
            value;
    },

    augmentWidthOrHeight = function(elem, name, extra, isBorderBox) {
        var i = extra === (isBorderBox ? 'border' : 'content') ?
            // If we already have the right measurement, avoid augmentation
            4 :
            // Otherwise initialize for horizontal or vertical properties
            name === 'width' ? 1 : 0,

            val = 0;

        for (; i < 4; i += 2) {
            // Both box models exclude margin, so add it if we want it
            if (extra === 'margin') {
                val += parseFloat(curCSS(elem, extra + dTrbl[i]));
            }

            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === 'content') {
                    val -= parseFloat(curCSS(elem, 'padding' + dTrbl[i]));
                }

                // At this point, extra isn't border nor margin, so remove border
                if (extra !== 'margin') {
                    val -= parseFloat(curCSS(elem, 'border' + dTrbl[i] + 'Width'));
                }
            } else {
                // At this point, extra isn't content, so add padding
                val += parseFloat(curCSS(elem, 'padding' + dTrbl[i]));

                // At this point, extra isn't content nor padding, so add border
                if (extra !== 'padding') {
                    val += parseFloat(curCSS(elem, 'border' + dTrbl[i] + 'Width'));
                }
            }
        }
        return val;
    },

    getWidthOrHeight = function(elem, name, extra) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            val = name === 'width' ? elem.offsetWidth : elem.offsetHeight,
            styles = getStyles(elem),
            isBorderBox = hAzzle.css(elem, 'boxSizing', false, styles) === 'border-box';

        // Some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if (val <= 0 || val == null) {
            // Fall back to computed then uncomputed css if necessary
            val = curCSS(elem, name, null, styles);
            //alert(val)
            if (val < 0 || val == null) {
                val = elem.style[name];
            }

            // Computed unit is not pixels. Stop here and return.
            if (dNumber.test(val)) {
                return val;
            }

            // Check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox &&
                (cssCore.has['api-boxSizingReliable'] || val === elem.style[name]);

            // Normalize '', auto, and prepare for extra
            val = parseFloat(val) || 0;
        }

        // Use the active box-sizing model to add/subtract irrelevant styles
        return (val +
            augmentWidthOrHeight(
                elem,
                name,
                extra || (isBorderBox ? 'border' : 'content'),
                valueIsBorderBox
            )
        ) + 'px';
    };


// cssHook
hAzzle.each(['height', 'width'], function(name) {
    hAzzle.cssHooks[name] = {
        get: setWH, //Setter
        set: getWH // Getter
    };
});

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

            // Margin is only for outerHeight, outerWidth
            hAzzle.Core[funcName] = function(margin, value) {
                var chainable = arguments.length && (defaultExtra || typeof margin !== 'boolean'),
                    extra = defaultExtra || (margin === true || value === true ? 'margin' : 'border');

                return hAzzle.setter(this, function(elem, type, value) {

                    var doc;

                    if (hAzzle.isWindow(elem)) {
                        return elem.document.documentElement['client' + name];
                    }

                    // Get document width or height
                    if (elem.nodeType === 9) {
                        doc = elem.documentElement;

                        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                        // whichever is greatest
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

hAzzle.Core.position = function() {

    if (this[0]) {

        function offsetParent() {

            var offsetParent = this.offsetParent || document;

            while (offsetParent && (!hAzzle.nodeName(offsetParent, 'html') && offsetParent.style.position === 'static')) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || document;
        }
        var elem = this[0],
            offsetParent = offsetParent.apply(elem),
            offset = this.offset(),
            parentOffset;

        if (!hAzzle.nodeName(offsetParent[0], 'html')) {
            parentOffset = {
                top: 0,
                left: 0
            };
        } else {
            parentOffset = hAzzle(offsetParent).offset()
        }

        if (offsetParent.style) {
            parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0
            parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0
        }

        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    }
};