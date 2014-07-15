// fragment.js
// Quick, dirty, temprorary solution
// Use hAzzle.create() for something better

hAzzle.elem = function (tag, props) {

    var p, elem = document.createElement(tag);

    if (hAzzle.isObject(props)) {

	// Copy over the properties

        for (p in props) {
        
		    elem[p] = props[p];
        }
    }

    return elem;
};

// Create a document fragment from a string

hAzzle.frag = function (html) {

    var frag = document.createDocumentFragment();

    if (hAzzle.isString(html)) {
        var cur, div = hAzzle.elem('div', {
            innerHTML: html
        });

        while (cur = div.firstChild) {
            frag.appendChild(cur);
        }
    } else {
        hAzzle(html).all(function (n) {
            frag.appendChild(n);
        });
    }

    return frag;
};