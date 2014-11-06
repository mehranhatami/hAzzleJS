// text.js
hAzzle.include(function() {

    var getText = function(elem) {

        if (elem) {

            var node, text = '',
                i = 0,
                l = elem.length,
                etc, nodetype = elem.nodeType;

            if (!nodetype) {

                for (; i < l; i++) {

                    node = elem[i++];

                    ///Skip comments.
                    if (node.nodeType !== 8) {
                        text += getText(node);
                    }
                }

            } else if (nodetype === 1 ||
                nodetype === 9 ||
                nodetype === 11) {

                etc = elem.textContent;

                if (typeof etc === 'string') {
                    return elem.textContent;
                } else {

                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        text += getText(elem);
                    }
                }
            } else if (nodetype === 3 || nodetype === 4) { // Text or CDataSection

                // Use nodedValue so we avoid that <br/> tags e.g, end up in
                // the text as any sort of line return.

                return elem.nodeValue;
            }
            return text;
        }
        return;
    };
    return {
        getText: getText
    };
});