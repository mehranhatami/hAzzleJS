; (function ($) {

/**
 * Show | hide | toggle
 *
 * Need to be moved over to the animation engine when it's finished, and used there
 *
 */

var elemdisplay = {};


function actualDisplay(name, doc) {

    var style,
        elem = doc.createElement(name);
		
		// Vanila solution is the best choise here
		
	docbody.appendChild(elem);
					
    display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ? style.display : $.css(elem[0], "display");
    docbody.removeChild(elem);
    return display;
}


// Try to determine the default display value of an element
function defaultDisplay(nodeName) {
    var display = elemdisplay[nodeName];

    if (!display) {
        display = actualDisplay(nodeName, doc);

        // If the simple way fails, read from inside an iframe
        if (display === "none" || !display) {

            // Use the already-created iframe if possible
			
            var iframe = iframe || doc.documentElement.appendChild("<iframe frameborder='0' width='0' height='0'/>");

            // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
            doc = iframe[0].contentDocument;

            // Support: IE
            doc.write();
            doc.close();

            display = actualDisplay(nodeName, doc);
			
			doc.documentElement.removeChild(iframe);
        }

        // Store the correct default display
        elemdisplay[nodeName] = display;
    }

    return display;

}


/**
 * Check if an element is hidden
 *  @return {Boolean}

 */

function isHidden(elem, el) {
    elem = el || elem;
    return elem.style.display === "none";
}

/**
 * Show an element
 *
 * @param {Object} elem
 * @return Object}
 *
 *
 * FIXME!! Need a lot of tests and fixes to work correctly everywhere
 *
 */

function show(elem) {

    var style = elem.style;

    if (style.display === "none") {

        style.display = "";

    }

    if ((style.display === "" && curCSS(elem, "display") === "none") || !$.contains(elem.ownerDocument.documentElement, elem)) {
        $.data(elem, 'display', defaultDisplay(elem.nodeName));
    }
}

/**
 * Hide an element
 *
 * @param {Object} elem
 * @return Object}
 */

function hide(elem) {
    if (!isHidden(elem)) {
        var display = $.css(elem, 'display');
        if (display !== 'none') {
            $.data(elem, 'display', display);
        }

        // Hide the element
        $.style(elem, 'display', 'none');
    }
}


$.extend($.fn, {

    /**
     * Show elements in collection
     *
     * @return {Object}
     */

    show: function () {
        return this.each(function () {
            show(this);
        });
    },

    /**

     * Hide elements in collection
     *
     * @return {Object}
     */

    hide: function () {
        return this.each(function () {
            hide(this);
        });
    },

    /**
     * Toggle show/hide.
     * @return {Object}
     */

    toggle: function (state) {

        if (typeof state === "boolean") {
            return state ? this.show() : this.hide();
        }

        return this.each(function () {

            if (isHidden(this)) {

                show(this);

            } else {

                hide(this);

            }
        });
    }
	
	});
	
})(hAzzle);	
	
	