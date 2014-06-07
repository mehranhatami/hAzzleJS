/**
 * hAzzle animation - special effects
 */
hAzzle.cssExpand = ["Top", "Right", "Bottom", "Left"];


hAzzle.AnimProp = function(type, includeWidth) {
    var which,
        i = 0,
        attrs = {
            height: type
        };

    includeWidth = includeWidth ? 1 : 0;

    for (; i < 4; i += 2 - includeWidth) {
        which = hAzzle.cssExpand[i];
        attrs["margin" + which] = attrs["padding" + which] = type;
    }

    if (includeWidth) {
        attrs.opacity = attrs.width = type;
    }
    return attrs;
};

hAzzle.extend({

    /**
     * Scale the element's width and height
     *
     * @param {Number} width
     * @param {Number} height
     * @param {Number/String} speed
     * @param {Function} callback
     * @param {String} easing
     * @return {hAzzle}
     */

    scale: function (width, height, speed, callback, easing) {

        return this.animate({
            height: height,
            width: width
        }, speed, callback, easing);
    },

    /**
     * Move the element to the specified x and y coordinates (from the top left of the element)
     *
     * @param {Number} The x-axis coordinate
     * @param {Number} The y-axis coordinate
     * @param {Number/String} speed
     * @param {Function} callback
     * @param {String} easing
     * @return {hAzzle}
     */

    move: function (x, y, speed, callback, easing) {
        return this.animate({
            left: x,
            top: y
        }, speed, callback, easing);
    },

    /**
     * FadeIn an element
     *
     * @param{Number} speed
     * @param{Fumction} callback
     * @param{String} easing
     * @return {hAzzle}
     *
     */

    fadeIn: function (speed, callback, easing) {
        return this.animate({
            opacity: 'show'
        }, speed, callback, easing);
    },

    /**
     * FadeOut an element
     *
     * @param{Number} speed
     * @param{Fumction} callback
     * @param{String} easing
     * @return {hAzzle}
     *
     */

    fadeOut: function (speed, callback, easing) {
        return this.animate({
            opacity: 'hide'
        }, speed, callback, easing);
    },

    slideUp: function (speed, callback, easing) {
        return this.animate(hAzzle.AnimProp("hide"), speed, callback, easing);
    },

    slideDown: function (speed, callback, easing) {
        return this.animate(hAzzle.AnimProp("show"), speed, callback, easing);
    },
    slideToggle: function (speed, callback, easing) {
        return this.animate(hAzzle.AnimProp("toggle"), speed, callback, easing);
    },
    fadeToggle: function (speed, callback, easing) {
        return this.animate({
            opacity: "toggle"
        }, speed, callback, easing);
    }
});