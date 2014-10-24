// pseudos.js
hAzzle.define('pseudos', function() {

    var _util = hAzzle.require('Util'),
        _jiesa = hAzzle.require('Jiesa');

    _util.mixin(_jiesa.pseudos,

        _jiesa.pseudos = {

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

            'empty': function(elem) {
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
        });

    return {};
});