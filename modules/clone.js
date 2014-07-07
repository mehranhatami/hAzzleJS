/*!
 * Clone
 */
var rcheckableType = /^(?:checkbox|radio)$/i;

function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();
    if ("input" === nodeName && rcheckableType.test(src.type)) {
		dest.checked = src.checked;
	}
    else if ("input" === nodeName || "textarea" === nodeName) {
		dest.defaultValue = src.defaultValue;
	}	
}

hAzzle.extend({

    cloneNode: function (el, deep) {
       
	   if(! el) {
		   
		   return; 
	   }
       
	    var c = el.cloneNode(deep || true),
            cloneElems, elElems;

        hAzzle(c).cloneEvents(el);

        // clone events from every child node
        cloneElems = hAzzle.select("*", c);
        elElems = hAzzle.select("*", el);

        var i = 0,
            len = elElems.length,
			a = 0, b = elTextareas.length;

        // Copy Events

        for (; i < len; i++) {
            hAzzle(cloneElems[i]).cloneEvents(elElems[i]);
        }

        if (!hAzzle.features.noCloneChecked && el.nodeType === 1 || el.nodeType === 11 && hAzzle.isXML(el)) {
            for (; i < len; i++) {
                fixInput(elElems[i], cloneElems[i]);
            }
        } else {

            // Okey, Mehran. We have cloned. Let us copy over the textarea data

            var cloneTextareas = hAzzle.select("textarea", c),
                elTextareas = hAzzle.select("textarea", el);

            // Copy over the textarea data	 

            for (; a < b; ++a) {
                hAzzle(cloneTextareas[b]).val(hAzzle(elTextareas[b]).val());
            }
        }

        // Return the cloned set

        return c;
    }
}, hAzzle);


hAzzle.extend({
    clone: function (deep) {
		var self = this;
	    return self[0] ? self.twist(function (el) {
            return hAzzle.cloneNode(el, deep);
        }) : self;
    }
});