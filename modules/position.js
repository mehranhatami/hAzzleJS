//  CSS position
hAzzle.extend({

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



/**
 * Gets a window from an element
 */

var getWindow = hAzzle.getWindow = function (elem) {
    return hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
};