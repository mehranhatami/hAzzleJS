var
    cssProperties = hAzzle.cssProperties = ['textShadow', 'opacity', 'clip', 'zIndex',
        'flex', 'order', 'borderCollapse', 'animation', 'animationFillMode', 'animationDirection',
        'animatioName', 'animationTimingFunction', 'animationPlayState', 'perspective', 'boxSizing',
        'textOverflow', 'columns', 'borderRadius', 'boxshadow', 'borderImage'
    ],
    i = cssProperties.length,
    cssCore = hAzzle.cssCore = {
        has: {}, // Feature / bug detection
    };

/* ============================ FEATURE / BUG DETECTION =========================== */

// Check for getComputedStyle support

cssCore.has['api-gCS'] = !!document.defaultView.getComputedStyle;

// Bug detection

hAzzle.assert(function(div) {

    var pixelPositionVal, boxSizingReliableVal;

    div.style.backgroundClip = "content-box";
    div.cloneNode(true).style.backgroundClip = "";

    cssCore.has['bug-clearCloneStyle'] = div.style.backgroundClip === "content-box";

    if (cssCore.has['api-gCS']) {

        div.style.cssText = 'border:1px;padding:1px;width:4px;position:absolute';
        var divStyle = window.getComputedStyle(div, null);

        cssCore.has['api-boxSizing'] = divStyle.boxSizing === "border-box";

        pixelPositionVal = divStyle.top !== '1%';
        boxSizingReliableVal = divStyle.width === '4px';
        cssCore.has['api-pixelPosition'] = pixelPositionVal;
        cssCore.has['api-boxSizingReliable'] = boxSizingReliableVal;
    }
});

hAzzle.assert(function(div) {

    var support = {};

    // Helper function to get the proper vendor property name.
    // (`transition` => `WebkitTransition`)
    function getVendorPropertyName(prop) {
        // Handle unprefixed versions (FF16+, for example)
        if (prop in div.style) return prop;

        var prefixes = ['Moz', 'Webkit', 'O', 'ms'],
            vendorProp, i = prefixes.length,
            prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

        while (i--) {
            vendorProp = prefixes[i] + prop_;
            if (vendorProp in div.style) {
                return vendorProp;
            }
        }
    }

    // Helper function to check if transform3D is supported.
    // Should return true for Webkits and Firefox 10+.

    function checkTransform3dSupport() {
        div.style[support.transform] = '';
        div.style[support.transform] = 'rotateY(90deg)';
        return div.style[support.transform] !== '';
    }

    // Check for the browser's transitions support.
    support.transition = getVendorPropertyName('transition');
    support.transitionDelay = getVendorPropertyName('transitionDelay');
    support.transform = getVendorPropertyName('transform');
    support.transformOrigin = getVendorPropertyName('transformOrigin');
    support.filter = getVendorPropertyName('Filter');
    support.transform3d = checkTransform3dSupport();

    // Detect the 'transitionend' event needed.
    var key;

    for (key in support) {
        if (support.hasOwnProperty(key) && typeof cssCore[key] === 'undefined') {
            cssCore[key] = support[key];
        }
    }

    // Detect support for other CSS properties

    while (i--) {
        if (getVendorPropertyName(cssProperties[i])) {
            cssCore[cssProperties[i]] = getVendorPropertyName(cssProperties[i]);
        }
    }
});

 // Check if support translate3d

hAzzle.assert(function(div) {

    var has3d, t, transforms = {
        'webkitTransform': '-webkit-transform',
        'OTransform': '-o-transform',
        'msTransform': '-ms-transform',
        'MozTransform': '-moz-transform',
        'transform': 'transform'
    };

    for (t in transforms) {

        if (div.style[t] !== undefined) {
            div.style[t] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(div).getPropertyValue(transforms[t]);
        }
    }
    cssCore.translate3d = (has3d !== undefined && has3d.length > 0 && has3d !== "none");
});