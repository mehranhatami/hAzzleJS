/**
 * Fixes top / left computedStyle bugs in Webkit based browsers
 */
 
var win = this,
    doc = win.document,
	computedstyle = !!document.defaultView.getComputedStyle,
    pxchk = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i;

 /**
  * If the browser suports the computedStyle, we go on...
  */
hAzzle.assert( function(div) {

  var container = doc.createElement("div");
	
    div.style.cssText =
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
  
    div.innerHTML = "";
  
    hAzzle.docElem.appendChild(container);

    var divStyle = win.getComputedStyle(div, null);

  // Check if browser supports pixelposition (Webkit don't)
    cssCore.has['api-pixelPosition'] = divStyle.top === "1%";
  
    // Check if support boxSizing
    
	cssCore.has['api-boxSizing'] = divStyle.width === "4px";

    hAzzle.docElem.removeChild(container);	
	
	});

if (computedstyle) {

    if (! cssCore.has['api-pixelPosition']) {

        hAzzle.extend({

            'left': {
                get: function (el, computed) {

                    if (computed) {

                        computed = curCSS(el, 'left');

                        return pxchk.test(computed) ?
                            hAzzle(el).position().left + "px" :
                            computed;
                    }
                }
            },

            'top': {
                get: function (el, computed) {
                    if (computed) {
                        computed = curCSS(el, 'top');
                        return pxchk.test(computed) ?
                            hAzzle(el).position().top + "px" :
                            computed;
                    }
                },

            },
        }, hAzzle.cssHooks);
    }
  }