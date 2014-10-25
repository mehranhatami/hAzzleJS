// pseudos.js
hAzzle.define('pseudos', function() {

    var _util = hAzzle.require('Util'),
        _jiesa = hAzzle.require('Jiesa');

    _util.mixin(_jiesa.pseudos, {
        
            ':hidden': function(elem) {

                var style = elem.style;
                if (style) {
                    if (style.display === 'none' ||
                        style.visibility === 'hidden') {
                        return true;
                    }
                }
                return elem.type === 'hidden';
            },

            ':visible': function(elem) {
                return !_jiesa.pseudos[':hidden'](elem);

            },
            ':active': function(elem) {
                return elem === document.activeElement;
            },

            ':empty': function(elem) {
                // DomQuery and jQuery get this wrong, oddly enough.
                // The CSS 3 selectors spec is pretty explicit about it, too.
                var cn = elem.childNodes,
                    cnl = elem.childNodes.length,
                    nt,
                    x = cnl - 1;

                for (; x >= 0; x--) {

                    nt = cn[x].nodeType;

                    if ((nt === 1) || (nt === 3)) {
                        return false;
                    }
                }
                return true;
            },
            ':text': function(elem) {
                var attr;
                return elem.nodeName.toLowerCase() === 'input' &&
                    elem.type === 'text' &&
                    ((attr = elem.getAttribute('type')) === null ||
                        attr.toLowerCase() === 'text');
            },
            ':button': function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === 'input' && elem.type === 'button' ||
                    name === 'button';
            },
            ':input': function(elem) {
                return /^(?:input|select|textarea|button)$/i.test(elem.nodeName);
            },
            ':selected': function(elem) {
                // Accessing this property makes selected-by-default
                // options in Safari work properly
                if (elem.parentNode) {
                    elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
            }
        });

    // Add button/input type pseudos

    _util.each({
        radio: true,
        checkbox: true,
        file: true,
        password: true,
        image: true
    }, function(value, prop) {
        _jiesa.pseudos[':' + prop] = createInputPseudo(prop);
    });

    _util.each({
        submit: true,
        reset: true
    }, function(value, prop) {
        _jiesa.pseudos[':' + prop] = createButtonPseudo(prop);
    });

    function createInputPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === 'input' && elem.type === type.toLowerCase();
        };
    }

    function createButtonPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return (name === 'input' || name === 'button') && elem.type === type.toLowerCase();
        };
    }

    function createDisabledPseudo(disabled) {
        return function(elem) {
            return (disabled || 'label' in elem || elem.href) && elem.disabled === disabled ||
                'form' in elem && elem.disabled === false && (
                    elem.isDisabled === disabled ||
                    elem.isDisabled !== !disabled &&
                    ('label' in elem) !== disabled
                );
        };
    }
    _jiesa.pseudos[':enabled'] = createDisabledPseudo(false);
    _jiesa.pseudos[':disabled'] = createDisabledPseudo(true);
    return {};
});