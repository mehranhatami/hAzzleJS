/**
 *  TODO!!!
 *
 * - Clone data
 * - deal with the script tags
 */
// Support: IE >= 9
function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();
    if ("input" === nodeName && rcheckableType.test(src.type)) dest.checked = src.checked;
    else if ("input" === nodeName || "textarea" === nodeName) dest.defaultValue = src.defaultValue
};

function getChildren(context, tag) {
    var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") :
        context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];

    return tag === undefined || tag && hAzzle.nodeName(context, tag) ?
        hAzzle.merge([context], ret) :
        ret;
}

hAzzle.fn.extend({

    clone: function (deep) {

        var _clone,
            srcElements, destElements;

        return this.map(function (elem) {

            /* Get all handlers from the original elem before we do a clone job
	
	   NOTE!! This has to be done BEFORE we clone the elem, else
	          hAzzle will be confused and wonder wich of the two
			  'identical' elems to get the handlers and data from
	*/

            var handlers = hAzzle.Events.getHandler(elem, '', null, false),
                l = handlers.length,
                i = 0,
                args, hDlr;

            // Clone the elem

            _clone = elem.cloneNode(true);

            // Copy the events from the original to the clone

            for (; i < l; i++) {
                if (handlers[i].original) {

                    args = [_clone, handlers[i].type];
                    if (hDlr = handlers[i].handler.__handler) args.push(hDlr.selector);
                    args.push(handlers[i].original);
                    hAzzle.Events.add.apply(null, args);
                }
            }
            destElements = getChildren(_clone);
            srcElements = getChildren(elem);

            for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
            }

            return _clone;
        });
    }
});