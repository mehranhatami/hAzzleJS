/**
 * Selectors Level 4
 */
var win = this,
    Jiesa = hAzzle.Jiesa,
    pseudos = Jiesa.pseudo_filters,
    trimspaces = /^\s*|\s*$/g,
    radicheck = /radio|checkbox/i,

    // Validate if the elem are a form element
    // or not

    isForm = function (elem) {
        return typeof elem.form !== 'undefined'
    };

hAzzle.extend({

    'indeterminate': function (elem) {
        return isForm(elem) && (radicheck).test(elem.type) && Jiesa.find(':checked', elem.form).length === 0;
    },
    // HTML5 UI element states (form controls)
    'default': function (elem) {
        return isForm(elem) && ((radicheck).test(elem.type) || /option/i.test(elem.nodeName)) && (elem.defaultChecked || elem.defaultSelected);
    },

    'not': function (elem, sel) {
        return hAzzle.inArray(Jiesa.find(sel.replace(trimspaces, '')), elem) === -1;
    },
    'valid': function (elem) {
        return isForm(elem) && typeof elem.validity === 'object' && elem.validity.valid;
    },
    'invalid': function (elem) {
        // only fields for which validity applies
        return isForm(elem) && typeof elem.validity === 'object' && !elem.validity.valid;
    },

    'in-range': function (elem, sel) {
        return isForm(elem) &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && !elem.validity.typeMismatch &&
            !elem.validity.rangeUnderflow && !elem.validity.rangeOverflow;
    },
    'out-of-range': function (elem, sel) {
        // only fields for which validity applies
        return isForm(elem) &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && (elem.validity.rangeUnderflow || elem.validity.rangeOverflow);
    },
    'required': function (elem) {
        return isForm(elem) && typeof elem.required !== 'undefined' && elem.required;
    },
    'read-only': function (elem) {
        // only fields for which 'readOnly' applies
        return isForm(elem) && typeof elem.readOnly !== 'undefined' && elem.readOnly;
    },
    'read-write': function (elem) {
        return isForm(elem) && typeof elem.readOnly !== 'undefined' && !elem.readOnly;
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
        return isForm(elem) && typeof elem.required !== 'undefined' && !elem.required;
    },

    // What is the point? 
    //  has equal to  'with' pseudo, but stands in the specs !! 

    'has': function (elem, sel) {
        return Jiesa.find(sel, elem).length > 0;
    },
    'nothas': function (elem, sel) {
        return !Jiesa.pseudo_filters.has(elem, sel);
    },

    'local-link': function (elem) {

        if (elem.nodeName) {

            return elem.href && elem.host === win.location.host;
        }

        var param = +elem + 1;

        if (!elem.href) return;

        var url = win.location + '',
            href = elem + '';

        return truncateUrl(url, param) === truncateUrl(href, param);

    },
    // Same as 'has'
    'with': function (elem, val) {
        return Jiesa.find(val, elem).length > 0;
    },
    'without': function (elem, val) {
        return Jiesa.find(val, elem).length === 0;
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

var truncateUrl = function (url, num) {
    return url
        .replace(/^(?:\w+:\/\/|\/+)/, '')
        .replace(/(?:\/+|\/*#.*?)$/, '')
        .split('/', num)
        .join('/');
};