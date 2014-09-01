var cssExpand = ['Top', 'Right', 'Bottom', 'Left'],
    elemdisplay = {},
    iframe, iframeDoc,

    // Container for the user's custom animation effects that are referenced by name in 
    // place of a properties map object.

    effects = {};

hAzzle.each(['fade', 'slide'], function(direction) {

    effects[direction + 'Toggle'] = function(elem, prop) {

        // Override the properties to be a Object
        prop = {};

        if (direction === 'fade') {

            prop.opacity = 'toggle';

        } else {

            prop = genFx('toggle');
        }

        return prop;
    };

    hAzzle.Core[direction + 'Toggle'] = function(speed, easing, callback) {
        return this.animate(direction + 'Toggle', speed, easing, callback);
    };

});

hAzzle.each({
    Down: 'show',
    Up: 'hide'
}, function(val, direction) {

    effects['slide' + direction] = function(elem, prop) {

        // Override the properties to be a Object
        prop = {};
        prop = genFx(val);
        prop.display = (direction === 'Down' ? (hAzzle.getDisplayType(elem) === 'inline' ? 'inline-block' : 'block') : 'none');

        // Force vertical overflow content to clip so that sliding works as expected.

        prop.overflow = elem.style.overflow;

        elem.style.overflow = 'hidden';

        return prop;
    };

    hAzzle.Core['slide' + direction] = function(speed, easing, callback) {
        return this.animate('slide' + direction, speed, easing, callback);
    };

});

// Iterate through all effects, and append them to the Core

hAzzle.each([
    'In',
    'Out'
], function(direction) {

    effects['fade' + direction] = function(elem, prop) {

        // Override the properties to be a Object
        prop = {};
        prop.opacity = (direction === 'In' ? 'show' : 'hide');
        prop.display = (direction === 'In' ? 'auto' : 'none');

        // Force vertical overflow content to clip so that sliding works as expected.

        prop.overflow = elem.style.overflow;

        elem.style.overflow = 'hidden';
        return prop;
    };

    hAzzle.Core['fade' + direction] = function(speed, easing, callback) {
        return this.animate('fade' + direction, speed, easing, callback);
    };

});


hAzzle.extend({
    show: function(speed, easing, callback) {
        if (speed || speed === 0) {

            return this.animate(genFx('show'), speed, easing, callback);

        } else {
            return showHide(this, true);
        }
    },

    hide: function(speed, easing, callback) {
        if (speed || speed === 0) {
            return this.animate(genFx('hide'), speed, easing, callback);

        } else {
            return showHide(this);
        }
    },
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

// Try to determine the default display value of an element

function defaultDisplay(nodeName) {

    var display = elemdisplay[nodeName];

    if (!display) {

        var body = document.body,
            elem = hAzzle.html('div').appendTo(body);

        display = elem.css('display');

        // If the simple way fails, read from inside an iframe

        if (display === 'none' || !display) {
            // Use the already-created iframe if possible

            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.frameBorder = iframe.width = iframe.height = 0;
            }

            body.appendChild(iframe);

            if (!iframeDoc || !iframe.createElement) {
                iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
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

function showHide(elements, show) {
    var display, elem, hidden,
        values = [],
        index = 0,
        length = elements.length;

    for (; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
            continue;
        }

        values[index] = hAzzle.private(elem, 'olddisplay');
        display = elem.style.display;
        if (show) {

            if (!values[index] && display === 'none') {
                elem.style.display = '';
            }

            if (elem.style.display === '' && isHidden(elem)) {
                values[index] = hAzzle.private(
                    elem,
                    'olddisplay',
                    defaultDisplay(elem.nodeName)
                );
            }
        } else {
            hidden = isHidden(elem);

            if (display !== 'none' || !hidden) {
                hAzzle.private(
                    elem,
                    'olddisplay',
                    hidden ? display : hAzzle.css(elem, 'display')
                );
            }
        }
    }

    for (index = 0; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
            continue;
        }
        if (!show || elem.style.display === 'none' || elem.style.display === '') {
            elem.style.display = show ? values[index] || '' : 'none';
        }
    }

    return elements;
}

function genFx(type, includeWidth) {
    var which,
        i = 0,
        attrs = {
            height: type
        };

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


/**
 * Check if an element is hidden
 *  @return {Boolean}
 */

function isHidden(elem, el) {
    elem = el || elem;
    return hAzzle.css(elem, 'display') === 'none' ||
        !hAzzle.contains(elem.ownerDocument, elem);
}

// Expose to the global hAzzle Object

hAzzle.effects = effects;
hAzzle.isHidden = isHidden;