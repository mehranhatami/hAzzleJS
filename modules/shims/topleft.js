/**
 * Fixes top / left computedStyle bugs in Webkit based browsers
 */
 
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
    rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
    win = this,
    doc = win.document;

 /**
  * If the browser suports the computedStyle, we go on...
  */

if (hAzzle.features.computedStyle) {

var pixelPositionVal, boxSizing,
    docElem = doc.documentElement,
    container = doc.createElement("div"),
    div = doc.createElement("div");

    div.style.cssText =
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
    div.innerHTML = "";
    docElem.appendChild(container);

    var divStyle = win.getComputedStyle(div, null);

    pixelPositionVal = divStyle.top !== "1%";
    boxSizing = divStyle.width === "4px"
	
    hAzzle.boxSizing = divStyle.width === "4px";

    docElem.removeChild(container);

  // Extend the hAzzle object

   hAzzle.extend({
  
   /**
    * Check if the browser supports boxSizing
	*
	* @value (Boolean) True / false 
	*
	*/
	
   boxSizing: boxSizing,

   /**
    * Check if the browser supports  pixelPosition
	*
    * There is an error / bug in the getComputedStyle,
	* so this are only an 'hack' for Webkit based
	* browsers
	*
	* @value (Boolean) True / false 
	*
	*/
   
   pixelPosition: pixelPositionVal
   
   },hAzzle);


    if (hAzzle.pixelPosition) {

        hAzzle.extend({

            'left': {
                get: function (el, computed) {

                    if (computed) {
  
                        computed = hAzzle.getStyle(el, 'left');
                        return rnumnonpx.test(computed) ?
                            hAzzle(el).position().left + "px" :
                            computed;
                    }
                }
            },

            'top': {
                get: function (el, computed) {
                    if (computed) {
                        computed = hAzzle.getStyle(el, 'top');
                        return rnumnonpx.test(computed) ?
                            hAzzle(el).position().top + "px" :
                            computed;
                    }
                },

            },
        }, hAzzle.cssHooks);
    }
}