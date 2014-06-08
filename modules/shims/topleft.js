/**
 * Fixes top / left computedStyle bugs in Webkit based browsers
 * The isue is that getComputedStyle returns percent when specified for top/left/bottom/right
 */
 
var win = this,
    doc = win.document,
    pxchk = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i;

 /**
  * If the browser suports the computedStyle, we go on...
  */

if (hAzzle.features.computedStyle) {

var 
    docElem = doc.documentElement,
    container = doc.createElement("div"),
    div = doc.createElement("div");

// Only if the 'div' have style property, we continue...

if ( div.style ) {

    div.style.cssText =
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
    div.innerHTML = "";
    docElem.appendChild(container);

    var divStyle = win.getComputedStyle(div, null);

    hAzzle.pixelPosition = divStyle.top === "1%";
    hAzzle.boxSizing = divStyle.width === "4px";

    docElem.removeChild(container);

    if (! hAzzle.pixelPosition) {

        hAzzle.extend({

            'left': {
                get: function (el, computed) {

                    if (computed) {
  
                        computed = hAzzle.getStyle(el, 'left');
                        return pxchk.test(computed) ?
                            hAzzle(el).position().left + "px" :
                            computed;
                    }
                }
            },

            'top': {
                get: function (el, computed) {
                    if (computed) {
                        computed = hAzzle.getStyle(el, 'top');
                        return pxchk.test(computed) ?
                            hAzzle(el).position().top + "px" :
                            computed;
                    }
                },

            },
        }, hAzzle.cssHooks);
    }
  }
}