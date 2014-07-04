/**
 * Jiesa CSS4 pseudo selectors
 */
var Jiesa = hAzzle.Jiesa,
    pseudos = Jiesa.pseudo_filters;

var llps = /#.*?$/;

hAzzle.extend({

    'valid': function (el) {
        return el.willValidate || (el.validity && el.validity.valid);
    },
    'invalid': function (el) {
        return !pseudos.valid(el);
    },
    'in-range': function (el) {
        return el.value > el.min && el.value <= el.max;
    },
    'out-of-range': function (el) {
        return !pseudos['in-range'](el);
    },
    'required': function (el) {
        return !!el.required;
    },
    'optional': function (el) {
        return !el.required;
    },
    'read-only': function (el) {
        if (el.readOnly) return true;

        var attr = el.getAttribute('contenteditable'),
            prop = el.contentEditable,
            name = el.nodeName.toLowerCase();

        name = name !== 'input' && name !== 'textarea';

        return (name || el.disabled) && attr === null && prop !== 'true';
    },
    'read-write': function (el) {
        return !pseudos['read-only'](el);
    },


    'dir': function (el, val) {
        while (el) {
            if (el.dir) {
                return el.dir === val;
            }
            el = el.parentNode;
        }
        return false;
    },

    'has': function (elem, sel) {
        return Jiesa.parse(sel, elem).length > 0;
    },
    'nothas': function (elem, sel) {
        return !Jiesa.pseudo_filters.has(elem, sel);
    },

    'local-link': function (el, val) {
        var href, i, location, _i;

        if (!el.href) {
            return false;
        }

        href = el.href.replace(llps, '');

        location = el.ownerDocument.location.href.replace(llps, '');

        if (val === void 0) {

            return href === location;

        } else {

            href = href.split('/').slice(2);
            location = location.split('/').slice(2);

            for (i = _i = 0; _i <= val; i = _i += 1) {
                if (href[i] !== location[i]) {
                    return false;
                }
            }
            return true;
        }
    },
    'with': function (el, val) {
        return hAzzle.select(val, [el]).length > 0;
    },
    'without': function (el, val) {
        return hAzzle.select(val, [el]).length === 0;
    },
    'scope': function (el, con) {
        var context = con || el.ownerDocument;
        if (context.nodeType === 9) {
            return el === context.documentElement;
        }
        return el === context;
    },
    'any-link': function (el) {
        return typeof el.href === 'string';
    }

}, pseudos);