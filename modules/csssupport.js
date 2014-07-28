var cssSupport = {

      // Check for getComputedStyle support

     'api-gCS': !!document.defaultView.getComputedStyle
}

/* ============================ FEATURE / BUG DETECTION =========================== */

hAzzle.assert(function(div) {

    var style = div.style;

    // BackgroundPositionXY 

    hAzzle.applyCSSSupport('borderImage', div.style.backgroundPositionX !== null);

    // BorderImage support
   cssSupport['borderImage'] = style.borderImage !== undefined ||
        style.MozBorderImage !== undefined ||
        style.WebkitBorderImage !== undefined ||
        style.msBorderImage !== undefined;
   
    // BoxShadow
    cssSupport['boxShadow'] = style.BoxShadow !== undefined ||
        style.MsBoxShadow !== undefined ||
        style.WebkitBoxShadow !== undefined ||
        style.OBoxShadow !== undefined;

// Transition

	cssSupport['transition'] = style.transition !== undefined || 
                            style.WebkitTransition !== undefined || 
							style.MozTransition !== undefined || 
							style.MsTransition !== undefined || 
							style.OTransition !== undefined;

    // textShadow support

     cssSupport['textShadow'] = style.textShadow === '';
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

    // Support: IE9-11+

    cssSupport['bug-clearCloneStyle'] = div.style.backgroundClip === 'content-box';

    var pixelPositionVal, boxSizingReliableVal,
        container = document.createElement('div');

    container.style.cssText = 'border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;' +
        'position:absolute';

    container.appendChild(div);

    function computePixelPositionAndBoxSizingReliable() {
        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
            '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;' +
            'box-sizing:border-box;display:block;margin-top:1%;top:1%;' +
            'border:1px;padding:1px;width:4px;position:absolute';
        div.innerHTML = '';
        docElem.appendChild(container);

        var divStyle = window.getComputedStyle(div, null);
        pixelPositionVal = divStyle.top !== '1%';
        boxSizingReliableVal = divStyle.width === '4px';

        docElem.removeChild(container);
    }

    // Check if we support getComputedStyle

    if (cssSupport['api-gCS']) {

        cssSupport['api-pixelPosition'] = (function() {
            computePixelPositionAndBoxSizingReliable();
            return pixelPositionVal;
        })();

        cssSupport['api-boxSizingReliable'] = (function() {
            if (boxSizingReliableVal === null) {
                computePixelPositionAndBoxSizingReliable();
            }
            return boxSizingReliableVal;
        })();

        cssSupport['api-reliableMarginRight'] = (function() {
            var ret, marginDiv = div.appendChild(document.createElement('div'));
            marginDiv.style.cssText = div.style.cssText =
                '-webkit-box-sizing:content-box;-moz-box-sizing:content-box;' +
                'box-sizing:content-box;display:block;margin:0;border:0;padding:0';
            marginDiv.style.marginRight = marginDiv.style.width = '0';
            div.style.width = '1px';
            docElem.appendChild(container);
            ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);
            docElem.removeChild(container);
            return ret;
        })();
    }
});

// Expose to the global hAzzle Object

hAzzle.clearCloneStyle = cssSupport['bug-clearCloneStyle'];
hAzzle.pixelPosition = cssSupport['api-pixelPosition'];
hAzzle.boxSizingReliable = cssSupport['api-boxSizingReliable'];
hAzzle.reliableMarginRight = cssSupport['api-reliableMarginRight'];