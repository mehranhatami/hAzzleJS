var cssCore = hAzzle.cssCore = {
   has:  {}, // Feature / bug detection
   normalize: {} // Normalize properties
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