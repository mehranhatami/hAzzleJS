var curCSS = hAzzle.curCSS;

hAzzle.Core.position = function() {

    if (this[0]) {

        var offsetParent, offset,
            parentOffset = {
                top: 0,
                left: 0
            },
            elem = this[0];

        // Use of curCSS here gives a more accurate value, and
        // faster lookup

        if (curCSS(elem, 'position') === 'fixed') {

            offset = elem.getBoundingClientRect();

        } else {

            offsetParent = this.offsetParent();

            offset = this.offset();

            if (!hAzzle.nodeName(offsetParent[0], 'html')) {

                parentOffset = offsetParent.offset();
            }

            parentOffset.top += parseFloat(curCSS(offsetParent[0], 'borderTopWidth'));
            parentOffset.left += parseFloat(curCSS(offsetParent[0], 'borderLeftWidth'));
        }

        return {

            top: offset.top - parentOffset.top - parseFloat(curCSS(elem, 'marginTop')),
            left: offset.left - parentOffset.left - parseFloat(curCSS(elem, 'marginLeft'))
        };
    }
    return null;
};

hAzzle.each({
    Height: 'height',
    Width: 'width'
}, function(type, name) {
    hAzzle.Core[type] = function(value) {
        return hAzzle.setter(this, function(elem, type, value) {
            var doc, orig, ret;

            if (hAzzle.isWindow(elem)) {
                return elem.document.documentElement['client' + name];
            }

            // Get document width or height
            if (elem.nodeType === 9) {
                doc = elem.documentElement;

                return Math.max(
                    elem.body['scroll' + name], doc['scroll' + name],
                    elem.body['offset' + name], doc['offset' + name],
                    doc['client' + name]
                );
            }

            // Get width or height on the element
            if (value === undefined) {
                orig = curCSS(elem, type, true);
                ret = parseFloat(orig);
                return hAzzle.isNumeric(ret) ? ret : orig;
            }

            // Set the width or height on the element
            hAzzle.style(elem, type, value);
        }, type, value, arguments.length, null);
    };
});