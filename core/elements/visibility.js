// visibility.js
hAzzle.define('Visibility', function() {

    var _ccs = hAzzle.require('curCSS'),
        _core = hAzzle.require('Core'),
        _storage = hAzzle.require('Storage'),
        iframe, doc,
        elemdisplay = {
            HTML: 'block',
            BODY: 'block'
        },

        isHidden = function(elem) {
            return _ccs.curCSS(elem, 'display') === 'none' || !_core.contains(elem.ownerDocument, elem);
        },

        showHide = function(elements, show) {
            var display, elem, hidden,
                values = [],
                index = 0,
                length = elements.length;

            for (; index < length; index++) {
              
                elem = elements[index];
              
                if (!elem.style) {
                    continue;
                }

                values[index] = _storage.private.access(elem, 'cssDisplay');
                display = elem.style.display;
                if (show) {
                    if (!values[index] && display === 'none') {
                        elem.style.display = '';
                    }

                    if (elem.style.display === '' && isHidden(elem)) {

                        values[index] = _storage.private.access(elem, 'cssDisplay', getDisplay(elem.nodeName));
                    }
                } else {
                    hidden = isHidden(elem);
                    if (display && display !== 'none' || !hidden) {
                        _storage.private.set(elem, 'cssDisplay', hidden ? display : _ccs.curCSS(elem, 'display'));
                    }
                }
            }

            // Set the display of most of the elements in a second loop
            // to avoid the constant reflow
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
        },

        getDisplay = function(nodeName) {

            var display = elemdisplay[nodeName];

            if (!display) {

                var body = document.body,
                    elem = hAzzle('<' + nodeName + '>').appendTo(body);

                display = elem.css('display');
                elem.remove();

                if (display === 'none' || display === '') {
                    // No iframe to use yet, so create it

                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.frameBorder = iframe.width = iframe.height = 0;
                        iframe.display = 'block !important!';
                    }

                    body.appendChild(iframe);

                    if (!doc || !iframe.createElement) {
                        doc = (iframe.contentWindow || iframe.contentDocument).document;
                        // Support IE
                        doc.write('<!doctype html><html><body>');
                        doc.close();
                    }

                    elem = doc.createElement(nodeName);

                    doc.body.appendChild(elem);

                    display = _ccs.curCSS(elem, 'display');
                    body.removeChild(iframe);
                }

                // Store the correct default display
                elemdisplay[nodeName] = display;
            }

            return elemdisplay[nodeName];
        },

        show = function(elem) {
            return showHide(elem, true);
        },
        hide = function(elem) {
            return showHide(elem);
        };

    this.show = function() {
        return showHide(this.elements, true);
    };

    this.hide = function() {
        return showHide(this.elements);
    };
    
    // Toggle show/hide.
    
    this.toggle = function(state, /*optional*/ fn) {

        if (!fn && typeof state === 'function') {
            fn = state;
            state = '';
        } else if (typeof state === 'boolean') {
            return state ? this.show() : this.hide();
        }

        return this.each(function(elem) {
            if (isHidden(elem)) {
                hAzzle(elem).show();
            } else {
                hAzzle(elem).hide();
            }

            if (fn) {
                fn.call(elem, elem);
                    // Set to false so it  get fired only once
                fn = false;
            }
        });
    };

    return {
        show: show,
        hide: hide,
        isHidden:isHidden
    };
});