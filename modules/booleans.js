// booleans.js
var boolElemArray = ('input select option textarea button form details').split(' '),
    boolAttrArray = ('multiple selected checked disabled readOnly required ' +
        'async autofocus compact nowrap declare noshade hreflang ' +
        'noresize defaultChecked autoplay controls defer autocomplete ' +
        'hidden tabindex readonly type accesskey dropzone spellcheck ismap loop scoped open').split(' '),
    boolAttr = {}, // Boolean attributes
    boolElem = {}; // Boolean elements

hAzzle.each(boolAttrArray, function(prop) {
    boolAttr[boolAttrArray[prop]] = boolAttrArray[prop];
});
hAzzle.each(boolElemArray, function(prop) {
    boolElem[prop.toUpperCase()] = true;
});

// Expose

hAzzle.boolAttr = boolAttr;
hAzzle.boolElem = boolElem;