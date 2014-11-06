// pseudos.js
// NOTE!!! Will extend the existing CSS3 pseudos included in the CORE with
// other CSS3 selectors (CL3), and a few CSS Level 4 pseudo selectors (CL4)
hAzzle.include([
    'util',
    'jiesa'
], function(_util, _jiesa) {

    var radicheck = /radio|checkbox/i,
        optcheck = /option/i,

        isForm = function(elem) {
            return elem && typeof elem.form !== 'undefined';
        };

    _util.mixin(_jiesa.pseudos, {

        ':header': function(elem) {
            return /^h\d$/i.test(elem.nodeName);
        },
        ':button': function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === 'input' && elem.type === 'button' ||
                name === 'button';
        },
        ':input': function(elem) {
            return /^(?:input|select|textarea|button)$/i.test(elem.nodeName);
        },
        ':parent': function(elem) {
            return !_jiesa.pseudos.empty(elem);
        },
        ':selected': function(elem) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (elem.parentNode) {
                elem.parentNode.selectedIndex;
            }
            return elem.selected === true;
        },
        ':target': function(elem) {
            var hash = window.location ?
                window.location.hash : '';
            return hash && hash.slice(1) === elem.id;
        },
        ':hover': function(elem) {
            return elem === document.hoverElement;
        },

        // HTML5 UI element states (form controls)
        ':default': function(elem) {
            return isForm(elem) && ((radicheck).test(elem.type) ||
                optcheck.test(elem.nodeName)) && (elem.defaultChecked ||
                elem.defaultSelected);
        },

        ':in-range': function(elem, sel) {
            return isForm(elem) &&
                (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
                typeof elem.validity === 'object' && !elem.validity.typeMismatch &&
                !elem.validity.rangeUnderflow && !elem.validity.rangeOverflow;
        },
        ':out-of-range': function(elem, sel) {
            // Only fields for which validity applies
            return isForm(elem) &&
                (sel.getAttribute(elem, 'min') || sel.getAttribute(elem, 'max')) &&
                typeof elem.validity === 'object' && (elem.validity.rangeUnderflow || elem.validity.rangeOverflow);
        },
        ':dir': function(el, val) {
            while (el) {
                if (el.dir) {
                    return el.dir === val;
                }
                el = el.parentNode;
            }
            return false;
        },
        ':indeterminate': function(elem) {
            return isForm(elem) && /radio|checkbox/i.test(elem.type) && _jiesa.find(':checked', elem.form, true).length === 0;
        }
    });


    // CL4 - required, read-only, read-write, optional

    _util.each([
        'required',
        'read-only',
        'read-write',
        'optional'
    ], function(prop) {
        _jiesa.pseudos[':' + prop] = function(elem) {
            return isForm(elem) && typeof elem[prop] !== 'undefined' && !elem[prop];
        };
    });

    // CL4 - valid and invalid 
    _util.each(['valid', 'invalid'], function(prop) {
        _jiesa.pseudos[':' + prop] = function(elem) {
            return isForm(elem) && typeof elem.validity === 'object' &&
                prop === 'valid' ?
                elem.validity.valid :
                !elem.validity.valid;
        };
    });
    return {};
});
