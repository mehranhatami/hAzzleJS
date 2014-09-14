var iframe, iframeDoc,
    iframe,
    cssExpand = ['Top', 'Right', 'Bottom', 'Left'],
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


    if (!elemdisplay[nodeName]) {

        var body = document.body,
            elem = hAzzle(hAzzle.html(nodeName)).appendTo(body),
            display = elem.css('display');
        elem.remove();

        // If the simple way fails,
        // get element's real default display by attaching it to a temp iframe
        if (display === 'none' || display === '') {
            // No iframe to use yet, so create it
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.frameBorder = iframe.width = iframe.height = 0;
            }

            body.appendChild(iframe);

            // Create a cacheable copy of the iframe document on first call.
            // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
            // document to it; WebKit & Firefox won't allow reusing the iframe document.
            if (!iframeDoc || !iframe.createElement) {
                iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
                iframeDoc.write('<!doctype html>' + '<html><body>');
                iframeDoc.close();
            }

            elem = iframeDoc.createElement(nodeName);

            iframeDoc.body.appendChild(elem);

            display = hAzzle.css(elem, 'display');
            body.removeChild(iframe);
        }

        // Store the correct default display
        elemdisplay[nodeName] = display;
    }

    return elemdisplay[nodeName];
}

// Expose to the global hAzzle Object

hAzzle.isHidden = isHidden;




// Generate parameters to create a standard animation
function genFx(type, includeWidth) {
    var which,
        i = 0,
        attrs = {
            height: type
        };

    // if we include width, step value is 1 to do all cssExpand values,
    // if we don't include width, step value is 2 to skip over Left and Right
    includeWidth = includeWidth ? 1 : 0;
    for (; i < 4; i += 2 - includeWidth) {
        which = cssExpand[i];
        attrs['margin' + which] = attrs['padding' + which] = type;
    }

    if (includeWidth) {
        attrs.opacity = attrs.width = type;
    }

    return attrs;
}

hAzzle.each(['toggle', 'show', 'hide'], function(name) {
    var cssFn = hAzzle.Core[name];
    hAzzle.Core[name] = function(speed, easing, callback) {
        return speed == null || typeof speed === 'boolean' ?
            cssFn.apply(this, arguments) :
            this.animate(genFx(name, true), speed, easing, callback);
    };
});