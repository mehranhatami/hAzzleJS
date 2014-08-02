// boolean.js
// Shared with attributes.js and compile.js

    hAzzle.boolAttr = {}, // Boolean attributes
    hAzzle.boolElem = {}, // Boolean elements

    hAzzle.each([
        'multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required',
        'async', 'autofocus', 'compact', 'nowrap', 'declare', 'noshade',
        'noresize', 'defaultChecked', 'autoplay', 'controls', 'defer',
        'hidden', 'ismap', 'loop', 'scoped', 'open'
    ], function() {
        hAzzle.boolAttr[this] = this;
    });

hAzzle.each(['input', 'select', 'option', 'textarea', 'button', 'form', 'details'], function() {
    hAzzle.boolElem[this.toUpperCase()] = true;
});