/**
 * Selectors Level 4
 */
var Jiesa = hAzzle.Jiesa,
    pseudos = Jiesa.pseudo_filters,

    trimspaces = /^\s*|\s*$/g,

    llps = /#.*?$/;

hAzzle.extend({

    // Negation pseudo-class
    'not': function (elem, sel) {
        return Jiesa.parse(sel.replace(trimspaces, '')).indexOf(elem) == -1;
    },

    'valid': function (elem) {
        return elem.willValidate || (elem.validity && elem.validity.valid);
    },
    'invalid': function (elem) {
        return !pseudos.valid(elem);
    },
    'in-range': function (elem) {
        return el.value > elem.min && elem.value <= elem.max;
    },
    'out-of-range': function (elem) {
        return !pseudos['in-range'](elem);
    },
    'required': function (elem) {
        return !!elem.required;
    },
    'optional': function (elem) {
        return !elem.required;
    },
    'read-only': function (elem) {
        if (elem.readOnly) return true;

        var attr = elem.getAttribute('contenteditable'),
            prop = elem.contentEditable,
            name = elem.nodeName.toLowerCase();

        name = name !== 'input' && name !== 'textarea';

        return (name || elem.disabled) && attr === null && prop !== 'true';
    },
    'read-write': function (elem) {
        return !pseudos['read-only'](elem);
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

    'local-link': function (elem, val) {
        var href, i, location, _i;

        if (!elem.href) {
            return false;
        }

        href = elem.href.replace(llps, '');

        location = elem.ownerDocument.location.href.replace(llps, '');

        if (val === undefined) {

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
    'with': function (elem, val) {
        return Jiesa.parse(val, [elem]).length > 0;
    },
    'without': function (elem, val) {
        return Jiesa.parse(val, [elem]).length === 0;
    },
    'scope': function (elem, con) {
        var context = con || elem.ownerDocument;
        if (context.nodeType === 9) {
            return elem === context.documentElement;
        }
        return elem === context;
    },
    'any-link': function (elem) {
        return typeof elem.href === 'string';
    }

}, pseudos);