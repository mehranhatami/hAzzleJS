//  CSS position, width and height
var cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    },
    pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
    rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];


hAzzle.extend({

    position: function() {

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
 * Width and height
 */
var rdisplayswap = /^(none|table(?!-c[ea]).+)/

hAzzle.each(["height", "width"], function(i, name) {
    hAzzle.cssHooks[name] = {
        get: function(elem, computed, extra) {
            if (computed) {
                // certain elements can have dimension info if we invisibly show them
                // however, it must have a current display style that would benefit from this
                return elem.offsetWidth === 0 && rdisplayswap.test(hAzzle.css(elem, "display")) ?
                    hAzzle.swap(elem, cssShow, function() {
                        return getWidthOrHeight(elem, name, extra);
                    }) :
                    getWidthOrHeight(elem, name, extra);
            }
        },

        set: function(elem, value, extra) {
            var styles = extra && getStyles(elem);
            return setPositiveNumber(elem, value, extra ?
                augmentWidthOrHeight(
                    elem,
                    name,
                    extra,
                    hAzzle.css(elem, "boxSizing", false, styles) === "border-box",
                    styles
                ) : 0
            );
        }
    };
});

/**
 * Gets a window from an element
 */

var getWindow = hAzzle.getWindow = function(elem) {
    return hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
};




function getWidthOrHeight(elem, name, extra) {

    // Start with offset property, which is equivalent to the border-box value
    var valueIsBorderBox = true,
        val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        styles = getStyles(elem),
        isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";

    // Some non-html elements return undefined for offsetWidth, so check for null/undefined
    // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
    // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
    if (val <= 0 || val == null) {
        // Fall back to computed then uncomputed css if necessary
        val = curCSS(elem, name, styles);
        if (val < 0 || val == null) {
            val = elem.style[name];
        }

        // Computed unit is not pixels. Stop here and return.
        if (rnumnonpx.test(val)) {
            return val;
        }

        // Check for style in case a browser which returns unreliable values
        // for getComputedStyle silently falls back to the reliable elem.style
        valueIsBorderBox = isBorderBox &&
            (support.boxSizingReliable() || val === elem.style[name]);

        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;
    }

    // Use the active box-sizing model to add/subtract irrelevant styles
    return (val +
        augmentWidthOrHeight(
            elem,
            name,
            extra || (isBorderBox ? "border" : "content"),
            valueIsBorderBox,
            styles
        )
    ) + "px";
}




function setPositiveNumber(elem, value, subtract) {
    var matches = rnumsplit.exec(value);
    return matches ?
        // Guard against undefined "subtract", e.g., when used as in cssHooks
        Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") :
        value;
}



function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
    var i = extra === (isBorderBox ? "border" : "content") ?
        // If we already have the right measurement, avoid augmentation
        4 :
        // Otherwise initialize for horizontal or vertical properties
        name === "width" ? 1 : 0,

        val = 0;

    for (; i < 4; i += 2) {
        // Both box models exclude margin, so add it if we want it
        if (extra === "margin") {
            val += jQuery.css(elem, extra + cssExpand[i], true, styles);
        }

        if (isBorderBox) {
            // border-box includes padding, so remove it if we want content
            if (extra === "content") {
                val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
            }

            // At this point, extra isn't border nor margin, so remove border
            if (extra !== "margin") {
                val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }
        } else {
            // At this point, extra isn't content, so add padding
            val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

            // At this point, extra isn't content nor padding, so add border
            if (extra !== "padding") {
                val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }
        }
    }

    return val;
}