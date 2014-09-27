var iframe,
    elemdisplay = {

        HTML: 'block',
        BODY: 'block'

    };

hAzzle.extend({

    /**
     * Show elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback
     * @return {hAzzle}
     */

    show: function() {
        return showHide(this, true);
    },

    /**
     * Hide elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback
     * @return {hAzzle}
     */

    hide: function() {
        return showHide(this);
    },

    /**
     * Toggle show/hide.
     * @return {Object}
     */

    toggle: function(state) {
        if (typeof state === 'boolean') {
            return state ? this.show() : this.hide();
        }
        return this.each(function() {
            if (isHidden(this)) {
                hAzzle(this).show();
            } else {
                hAzzle(this).hide();
            }
        });
    }
});

/* =========================== PRIVATE FUNCTIONS ========================== */

/**
 * Check if an element is hidden
 *  @return {Boolean}
 */

function isHidden(elem, el) {
    elem = el || elem;
    return hAzzle.css(elem, 'display') === 'none' ||
        !hAzzle.contains(elem.ownerDocument, elem);
}

/**
 * Show / Hide an elements
 *
 * @param {Object} elem
 * @param {Boolean} show
 * @return {Object}
 */

function showHide(elements, show) {
    var display, elem, hidden,
        values = [],
        i = 0,
        length = elements.length;

    for (; i < length; i++) {
        elem = elements[i];

        if (!elem.style) {
            continue;
        }

        values[i] = hAzzle.getPrivate(elem, 'olddisplay');

        // Cache the computedStyle on the Object, we may use
        // it later

        display = hAzzle.curCSS(elem, 'style');

        if (show) {

            if (!values[i] && display === 'none') {

                elem.style.display = '';
            }

            if (elem.style.display === '' && isHidden(elem)) {

                values[i] = hAzzle.private(
                    elem,
                    'olddisplay',
                    defaultDisplay(elem.nodeName)
                );
            }
        } else {
            hidden = isHidden(elem);

            if (display !== 'none' || !hidden) {
                hAzzle.setPrivate(
                    elem,
                    'olddisplay',
                    hidden ? display : hAzzle.css(elem, 'display')
                );
            }
        }
    }

    for (i = 0; i < length; i++) {
        elem = elements[i];
        if (!elem.style) {
            continue;
        }
        if (!show || elem.style.display === 'none' || elem.style.display === '') {
            elem.style.display = show ? values[i] || '' : 'none';
        }
    }

    return elements;
}


// Try to determine the default display value of an element
function defaultDisplay(nodeName) {

    var doc = document,
        display = elemdisplay[nodeName];

    if (!display) {
        display = actualDisplay(nodeName, doc);

        // If the simple way fails, read from inside an iframe
        if (display === "none" || !display) {

            // Use the already-created iframe if possible
            iframe = (iframe || hAzzle(hAzzle.create("<iframe frameborder='0' width='0' height='0'/>")))
                .appendTo(doc.documentElement);

            // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
            doc = (iframe[0].contentWindow || iframe[0].contentDocument).document;

            // Support: IE
            doc.write();
            doc.close();

            display = actualDisplay(nodeName, doc);
            iframe.detach();
        }

        // Store the correct default display
        elemdisplay[nodeName] = display;
    }

    return display;
}

// Expose to the global hAzzle Object

hAzzle.isHidden = isHidden;

function actualDisplay(name, doc) {
    var elem = hAzzle(doc.createElement(name)).appendTo(doc.body),

        display = hAzzle.css(elem[0], "display");

    // We don't have any data stored on the element,
    // so use "detach" method as fast way to get rid of the element
    elem.detach();

    return display;
}