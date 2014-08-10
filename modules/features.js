// hAzzle feature detection

var docElem = hAzzle.docElem,
   _features = hAzzle.features = {

 // Support: IE<=11+
 // Make sure textarea (and checkbox) defaultValue is properly cloned

   'feature-cloneCheck': hAzzle.assert(function(div) {
      div.innerHTML = "<textarea>the unknown</textarea>";
     return !!div.cloneNode(true).firstChild.defaultValue;
   })

	};

function addFeature(name, fn) {
   if(typeof fn === 'function') {
	_features[name] = fn;
   }
}

/* ============================ BUG / FEATURE DETECTION =========================== */

(function() {
    var input = document.createElement('input'),
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    input.type = 'checkbox';

    _features['bug-checkbox'] = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    _features['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 't');

    _features['bug-radioValue'] = input.value === 't';

})();


hAzzle.assert(function(div) {

    div.classList.add('a', 'b');
    // Detect if the browser supports classList
    _features['api-classList'] = !!document.documentElement.classList;
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it
    _features['api-MultiArgs'] = mArgsL.test(div.className) && mArgsR.test(div.className);

    _features['api-mS'] = cnative.test((Jiesa.matches = docElem.matches ||
        docElem.webkitMatchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector));
});
