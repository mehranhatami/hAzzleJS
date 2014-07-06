
var findExpr = !!doc.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/;


var rsibling = /[+~]/;
	
hAzzle.find = function (selector, context, /*INTERNAL*/ all) {

        var quickMatch = findExpr.exec(selector),
            elements, old, nid;

        doc = hAzzle.setDocument(context);

        context = context || doc;

        if (quickMatch) {

            if (quickMatch[1]) {

                // speed-up: 'TAG'
                elements = context.getElementsByTagName(selector);

            } else {

                // speed-up: '.CLASS'
                elements = context.getElementsByClassName(quickMatch[2]);
            }

            if (elements && !all) {

                elements = elements[0];
            }

        } else {

            old = true;
            nid = expando;

            if (context !== doc) {

                if ((old = context.getAttribute('id'))) {

                    nid = old.replace(rescape, '\\$&');

                } else {

                    context.setAttribute('id', nid);
                }

                nid = "[id='" + nid + "'] ";

                context = rsibling.test(selector) ? context.parentNode : context;
                selector = nid + selector.split(',').join(',' + nid);
            }

            try {
                elements = context[all ? 'querySelectorAll' : 'querySelector'](selector);
            } finally {
                if (!old) context.removeAttribute('id');
            }
        }

        return elements;
    },

    /**
     * Find all matched elements by css selector
     * @param  {String} selector
     * @param  {Object/String} context
     * @return {hAzzle}
     */

hAzzle.findAll = function (selector, context) {
        return hAzzle.find(selector, context || doc, true);
};
