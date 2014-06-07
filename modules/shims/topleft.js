/**
 * Fixes top / left computedStyle bugs in Webkit based browsers
 */
 
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
    rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

var win = this,
    doc = win.document;

if (hAzzle.features.computedStyle) {

var pixelPositionVal, boxSizingReliableVal,
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
    boxSizingReliableVal = divStyle.width === "4px";

    docElem.removeChild(container);

    if (pixelPositionVal) {

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