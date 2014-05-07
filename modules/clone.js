;
(function ($) {

    var rcheckableType = (/^(?:checkbox|radio)$/i);

    function fixInput(src, dest) {
        var nodeName = dest.nodeName.toLowerCase();
        if ("input" === nodeName && rcheckableType.test(src.type)) dest.checked = src.checked;
        else if ("input" === nodeName || "textarea" === nodeName) dest.defaultValue = src.defaultValue;
    };

    $.extend({

        clone: function (elem, deep) {

            var handlers = $.Events.getHandler(elem, '', null, false),
                l = handlers.length,
                i = 0,
                args, hDlr;

            // Get the data before we clone

            storage = $(elem).data();

            // Clone the elem

            clone = elem.cloneNode(deep || true);

            // Copy the events from the original to the clone

            for (; i < l; i++) {
                if (handlers[i].original) {
                    args = [clone, handlers[i].type];
                    if (hDlr = handlers[i].handler.__handler) args.push(hDlr.selector);
                    args.push(handlers[i].original);
                    $.Events.add.apply(null, args);
                }
            }

            // Copy data from the original to the clone

            if (storage) {
                $.each(storage, function (key, value) {
                    $.data(clone, key, value);
                });
            }
            // Preserve the rest 

            if (!$.support.noCloneChecked && ($.nodeType(1, elem) || $.nodeType(11, elem)) && !$.isXML(elem)) {

                destElements = $.getChildren(clone);
                srcElements = $.getChildren(elem);

                for (i = 0, l = srcElements.length; i < l; i++) {
                    fixInput(srcElements[i], destElements[i]);
                }
            }

            // Preserve script evaluation history

            destElements = getAll(clone, "script");

            if (destElements.length > 0) {

                $.Evaluated(destElements, !$.contains(elem.ownerDocument, elem) && $.getChildren(elem, "script"));
            }

            // Return the cloned set

            return clone;
        },
    });

    $.extend($.fn, {
        clone: function (deep) {
            return this.map(function (elem) {
                return $.clone(elem, deep);
            });
        }
    });


})(hAzzle);