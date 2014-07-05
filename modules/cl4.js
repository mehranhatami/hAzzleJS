/**
 * Selectors Level 4
 */
var Jiesa = hAzzle.Jiesa,
    pseudos = Jiesa.pseudo_filters,

    trimspaces = /^\s*|\s*$/g,
    radicheck = /radio|checkbox/i,
    llps = /#.*?$/;

hAzzle.extend({

    // Mehran !!
    // Test and check that indeterminate are working

    'indeterminate': function (elem) {
        return typeof elem.form !== 'undefined' && (radicheck).test(elem.type) && Jiesa.parse('[checked]', elem.form).length === 0;
    },
    // HTML5 UI element states (form controls)
    'default': function (elem) {
        return typeof elem.form !== 'undefined' && ((radicheck).test(elem.type) || /option/i.test(elem.nodeName)) && (elem.defaultChecked || elem.defaultSelected);
    },

    'not': function (elem, sel) {
        return Jiesa.parse(sel.replace(trimspaces, '')).indexOf(elem) == -1;
    },

    'valid': function (elem) {
        return typeof elem.form !== 'undefined' && typeof elem.validity === 'object' && elem.validity.valid;
    },
    'invalid': function (elem) {
        // only fields for which validity applies
        return typeof elem.form !== 'undefined' && typeof elem.validity === 'object' && !elem.validity.valid;
    },

    'in-range': function (elem, sel) {
        return typeof elem.form !== 'undefined' &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && !elem.validity.typeMismatch &&
            !elem.validity.rangeUnderflow && !elem.validity.rangeOverflow;
    },
    'out-of-range': function (elem, sel) {
        // only fields for which validity applies
        return typeof elem.form !== 'undefined' &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && (elem.validity.rangeUnderflow || elem.validity.rangeOverflow);
    },
    'required': function (elem) {
		return typeof elem.form !== 'undefined' && typeof elem.required !== 'undefined' && elem.required

    },
    'read-only': function (elem) {
        // only fields for which 'readOnly' applies
        return typeof elem.form !== 'undefined' && typeof elem.readOnly !== 'undefined' && elem.readOnly;
    },
    'read-write': function (elem) {
        return typeof elem.form !== 'undefined' && typeof elem.readOnly !== 'undefined' && !elem.readOnly;
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

    'optional': function (elem) {
        return typeof elem.form !== 'undefined' && typeof elem.required !== 'undefined' && !elem.required;
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