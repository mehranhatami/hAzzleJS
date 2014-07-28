var cssSupport = {

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
hAzzle.boxSizing = cssSupport['api-boxSizing'];