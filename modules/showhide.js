var iframe, iframeDoc,
    elemdisplay = {};

hAzzle.extend({

    /**
     * Show elements in collection
     *
     * @param {Number} speed
     * @param {String} easing
     * @param {Function} callback
     * @return {hAzzle}
     */

    show: function(speed, easing, callback) {
        if (typeof speed === 'number') {
            return this.animate(createAnimation('show', true), {
                duration: speed,
                easing: easing,
                complete: callback
            });
        }
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

    hide: function(speed, easing, callback) {
        if (typeof speed === 'number') {
            return this.animate(createAnimation('hide', true), {
                duration: speed,
                easing: easing,
                complete: callback
            });
        }
        return showHide(this);
    },

    /**
     * Toggle show/hide.
     * @return {Object}
     */

    toggle: function(state, easing, callback) {
        if (typeof state === 'number') {
            return this.animate(createAnimation('toggle', true), {
                duration: state,
                easing: easing,
                complete: callback
            });
        }


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

function actualDisplay(name, doc) {
    var style,
        elem = hAzzle(doc.createElement(name)).appendTo(doc.body),
        display = window.getDefaultComputedStyle &&
        (style = window.getDefaultComputedStyle(elem[0])) ?
        style.display : curCSS(elem[0], 'display');
    elem.detach();
    return display;
}


// Try to determine the default display value of an element
function defaultDisplay(nodeName) {

    var display = elemdisplay[nodeName];

    if (!display) {

        var body = document.body,
            elem = hAzzle.html('div').appendTo(body);

        display = actualDisplay(nodeName, document);

        // If the simple way fails, read from inside an iframe

        if (display === 'none' || !display) {


            // Use the already-created iframe if possible

            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.frameBorder = iframe.width = iframe.height = 0;
            }

            body.appendChild(iframe);

            if (!iframeDoc || !iframe.createElement) {
                iframeDoc = iframe.contentDocument.document;
                iframeDoc.write((document.compatMode === 'CSS1Compat' ? '<!doctype html>' : '') + '<html><body>');
                iframeDoc.close();
            }

            elem = iframeDoc.createElement(nodeName);

            iframeDoc.body.appendChild(elem);

            display = hAzzle.css(elem, 'display');

            body.removeChild(iframe);
        }
    }

    return display;
}

// Expose to the global hAzzle Object

hAzzle.isHidden = isHidden;