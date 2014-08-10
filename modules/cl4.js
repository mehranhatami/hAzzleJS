// CL4 - required, read-only, read-write, optional

hAzzle.each({
    'REQUIRED': 'required',
    'READ-ONLY': 'readOnly',
    'READ-WRITE': 'readOnly',
    'OPTIONAL': 'required'
}, function(prop, original) {
    hAzzle.Expr[original] = function(elem) {
        return isForm(elem) && typeof elem[prop] !== 'undefined' && !elem[prop];
    };
});

// CL4 - valid and invalid 
hAzzle.each(['VALID', 'INVALID'], function(prop) {
    hAzzle.Expr[prop] = function(elem) {
        return isForm(elem) && typeof elem.validity === 'object' &&
            prop === 'VALID' ?
            elem.validity.valid :
            !elem.validity.valid;
    };
});

/* ============================ CL4 SELECTORS =========================== */

hAzzle.extend({

    // HTML5 UI element states (form controls)
    'DEFAULT': function(elem) {
        return isForm(elem) && ((compileExpr.radicheck).test(elem.type) ||
            /option/i.test(elem.nodeName)) && (elem.defaultChecked ||
            elem.defaultSelected);
    },

    'IN-RANGE': function(elem, sel) {
        return isForm(elem) &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && !elem.validity.typeMismatch &&
            !elem.validity.rangeUnderflow && !elem.validity.rangeOverflow;
    },
    'OUT-OF-RANGE': function(elem, sel) {
        // Only fields for which validity applies
        return isForm(elem) &&
            (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
            typeof elem.validity === 'object' && (elem.validity.rangeUnderflow || elem.validity.rangeOverflow);
    },
    'DIR': function(el, val) {
        while (el) {
            if (el.dir) {
                return el.dir === val;
            }
            el = el.parentNode;
        }
        return false;
    },
    'INDETERMINATE': function(elem) {
        return isForm(elem) && (compileExpr.radicheck).test(elem.type) && Kenny(':checked', elem.form).length === 0;
    },
}, hAzzle.Expr);