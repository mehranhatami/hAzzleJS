// boolean.js
// Shared with attributes.js and compile.js
(function() {

    var boolAttr = hAzzle.boolAttr = {}, // Boolean attributes
        boolElem = hAzzle.boolElem = {}, // Boolean elements

        // Booleans

        bools = [
            'multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required',
            'async', 'autofocus', 'compact', 'nowrap', 'declare', 'noshade',
            'noresize', 'defaultChecked', 'autoplay', 'controls', 'defer',
            'hidden', 'ismap', 'loop', 'scoped', 'open'
        ],
        belem = ['input', 'select', 'option', 'textarea', 'button', 'form', 'details'];


    // Boolean attributes and elements

    hAzzle.each(bools, function() {
        boolAttr[this] = this;
    });

    hAzzle.each(belem, function() {
        boolElem[this.toUpperCase()] = true;
    });

}());