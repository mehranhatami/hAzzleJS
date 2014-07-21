 /**
  * Get text
  */

hAzzle.getText = function (elem) {
	     
		 if(!elem) { 
		 
		    return; 
		 }
            var node, ret = '',
                i = 0,
                l = elem.length,
                etc,
                nodetype = elem.nodeType;

            if (!nodetype) {

                for (; i < l; i++) {

                    node = elem[i++];

                    // Do not traverse comment nodes
                    ret += hAzzle.getText(node);
                }

            } else if (nodetype === 1 || nodetype === 9 || nodetype === 11) {

                etc = elem.textContent;

                if (typeof etc === 'string') {

                    return elem.textContent;

                } else {

                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {

                        ret += hAzzle.getText(elem);
                    }

                }
            } else if (nodetype === 3 || nodetype === 4) {

                return elem.nodeValue;
            }

            return ret;
        };