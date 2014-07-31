// boolean.js
// Shared with attributes.js and compile.js

var boolAttr = hAzzle.boolAttr = {}, // Boolean attributes
    boolElem = hAzzle.boolElem = {}, // Boolean elements
	
	// Booleans

    bools = [
        'multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required',
        'async', 'autofocus', 'compact', 'nowrap', 'declare', 'noshade',
        'noresize', 'defaultChecked', 'autoplay', 'controls', 'defer',
        'hidden', 'ismap', 'loop', 'scoped', 'open'
    ];
	
// Boolean attributes and elements

hAzzle.each(bools, function() {
    boolAttr[this] = this;
});

hAzzle.each(['input', 'select', 'option', 'textarea', 'button', 'form', 'details'], function() {
    boolElem[this.toUpperCase()] = true;
});	