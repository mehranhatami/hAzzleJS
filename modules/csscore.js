var cssCore = hAzzle.cssCore = {

   // Feature / bug detection
   
   has:  { // Check for getComputedStyle support

          'api-gCS': !!document.defaultView.getComputedStyle,
	},

	// Normalize properties

	normalize: {}
};

/* ============================ FEATURE / BUG DETECTION =========================== */

// Check for getComputedStyle support

cssCore.has['api-gCS'] = !!document.defaultView.getComputedStyle;


hAzzle.assert(function(div) {

    var style = div.style;

    // BorderImage support

    cssCore.borderImage = style.borderImage !== undefined ||
        style.MozBorderImage !== undefined ||
        style.WebkitBorderImage !== undefined ||
        style.msBorderImage !== undefined;

    // BoxShadow

    cssCore.boxShadow = style.BoxShadow !== undefined ||
        style.MsBoxShadow !== undefined ||
        style.WebkitBoxShadow !== undefined ||
        style.OBoxShadow !== undefined;

    // Transition

    cssCore.transition = style.transition !== undefined ||
        style.WebkitTransition !== undefined ||
        style.MozTransition !== undefined ||
        style.MsTransition !== undefined ||
        style.OTransition !== undefined;

    // textShadow support

    cssCore.textShadow = style.textShadow === '';
});

var support = {};

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
    support.transition = getVendorPropertyName('transition');
    support.transitionDelay = getVendorPropertyName('transitionDelay');
    support.transform = getVendorPropertyName('transform');
    support.transformOrigin = getVendorPropertyName('transformOrigin');
    support.filter = getVendorPropertyName('Filter');

    function checkTransform3dSupport() {
        div.style[cssCore.transform] = '';
        div.style[cssCore.transform] = 'rotateY(90deg)';
        return div.style[cssCore.transform] !== '';
    }

    support.transform3d = checkTransform3dSupport();
	
	 var eventNames = {
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'WebkitTransition': 'webkitTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };
  
   // Detect the 'transitionend' event needed.
  var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

  for (var key in support) {
	  
    if (support.hasOwnProperty(key) && typeof cssCore[key] === 'undefined') {
		
     cssCore.has[key] = support[key];
	 
    }
  }
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

    cssCore.has[name] = value;

    // Expost to the global hAzzle object

    hAzzle[name] = cssCore.has[name];
};

// Expose to the global hAzzle Object

hAzzle.transition = cssCore.has.transition;

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

// Expose to the global hAzzle Object

hAzzle.clearCloneStyle = cssCore.has['bug-clearCloneStyle'];
hAzzle.pixelPosition = cssCore.has['api-pixelPosition'];
hAzzle.boxSizingReliable = cssCore.has['api-boxSizingReliable'];
// Check for getComputedStyle

hAzzle.ComputedStyle = cssCore.has['api-gCS'];