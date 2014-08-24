	var i,
	    boolElemArray = ['input', 'select', 'option', 'textarea', 'button', 'form', 'details'],
	    boolAttrArray = ('multiple selected checked disabled readOnly required ' +
	        'async autofocus compact nowrap declare noshade ' +
	        'noresize defaultChecked autoplay controls defer ' +
	        'hidden ismap loop scoped open').split(' ');

	 // boolean.js - Shared with attributes.js and compile.js

	hAzzle.boolAttr = {}; // Boolean attributes
	hAzzle.boolElem = {}; // Boolean elements

	i = boolAttrArray.length;

	while (i--) {
	    hAzzle.boolAttr[boolAttrArray[i]] = boolAttrArray[i];
	}
	i = boolElemArray.length;

	while (i--) {
	    hAzzle.boolElem[boolElemArray[i].toUpperCase()] = true;
	}