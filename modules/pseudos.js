// pseudos.js
// NOTE!!! Will extend the existing CSS3 pseudos included in the CORE with
// other CSS3 selectors (DL3), and a few CSS4 pseudo selectors (DL4)

hAzzle.define('pseudos', function() {

    var _util = hAzzle.require('Util'),
        _jiesa = hAzzle.require('Jiesa');

    _util.mixin(_jiesa.pseudos,

        _jiesa.pseudos = {

        });
console.log(_jiesa.pseudos)

 return {};
});