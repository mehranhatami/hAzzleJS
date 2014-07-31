var cssSupport = hAzzle.cssSupport = {

    // Check for getComputedStyle support

    'api-gCS': !!document.defaultView.getComputedStyle
};

/* ============================ FEATURE / BUG DETECTION =========================== */

hAzzle.assert(function(div) {

    var style = div.style;

    // BorderImage support

    cssSupport.borderImage = style.borderImage !== undefined ||
        style.MozBorderImage !== undefined ||
        style.WebkitBorderImage !== undefined ||
        style.msBorderImage !== undefined;

    // BoxShadow

    cssSupport.boxShadow = style.BoxShadow !== undefined ||
        style.MsBoxShadow !== undefined ||
        style.WebkitBoxShadow !== undefined ||
        style.OBoxShadow !== undefined;

    // Transition

    cssSupport.transition = style.transition !== undefined ||
        style.WebkitTransition !== undefined ||
        style.MozTransition !== undefined ||
        style.MsTransition !== undefined ||
        style.OTransition !== undefined;

    // textShadow support

    cssSupport.textShadow = style.textShadow === '';
});

hAzzle.assert(function(div) {


    function getVendorPropertyName(prop) {
        // Handle unprefixed versions (FF16+, for example)
        if (prop in div.style) {

            return prop;
        }

        var i = 0,
            prefixes = ['Moz', 'Webkit', 'O', 'ms'],
            pl = prefixes.length,
            vendorProp,
            prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

        for (; i < pl; ++i) {
            vendorProp = prefixes[i] + prop_;
            if (vendorProp in div.style) {
                return vendorProp;
            }
        }
    }


    // Check for the browser's transitions support.
    cssSupport.transition = getVendorPropertyName('transition');
    cssSupport.transitionDelay = getVendorPropertyName('transitionDelay');
    cssSupport.transform = getVendorPropertyName('transform');
    cssSupport.transformOrigin = getVendorPropertyName('transformOrigin');
    cssSupport.filter = getVendorPropertyName('Filter');

    function checkTransform3dSupport() {
        div.style[cssSupport.transform] = '';
        div.style[cssSupport.transform] = 'rotateY(90deg)';
        return div.style[cssSupport.transform] !== '';
    }


    cssSupport.transform3d = checkTransform3dSupport();

});

/**
 * Quick function for adding supported CSS properties
 * to the 'cssCore'
 *
 * @param {String} name
 * @param {String} value
 *
 */

hAzzle.applyCSSSupport = function(name, value) {

    cssSupport[name] = value;

    // Expost to the global hAzzle object

    hAzzle[name] = cssSupport[name];
};

// Expose to the global hAzzle Object

hAzzle.transition = cssSupport.transition;

// Bug detection

hAzzle.assert(function(div) {

    var pixelPositionVal, boxSizingReliableVal;

    div.style.backgroundClip = "content-box";
    div.cloneNode(true).style.backgroundClip = "";

    cssSupport['bug-clearCloneStyle'] = div.style.backgroundClip === "content-box";

    if (cssSupport['api-gCS']) {

        div.style.cssText = 'border:1px;padding:1px;width:4px;position:absolute';
        var divStyle = window.getComputedStyle(div, null);

        cssSupport['api-boxSizing'] = divStyle.boxSizing === "border-box";

        pixelPositionVal = divStyle.top !== '1%';
        boxSizingReliableVal = divStyle.width === '4px';
        cssSupport['api-pixelPosition'] = pixelPositionVal;
        cssSupport['api-boxSizingReliable'] = boxSizingReliableVal;
    }
});

// Expose to the global hAzzle Object

hAzzle.clearCloneStyle = cssSupport['bug-clearCloneStyle'];
hAzzle.pixelPosition = cssSupport['api-pixelPosition'];
hAzzle.boxSizingReliable = cssSupport['api-boxSizingReliable'];
// Check for getComputedStyle

hAzzle.ComputedStyle = cssSupport['api-gCS'];