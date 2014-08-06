// hAzzle feature detection

var _hfs = hAzzle.features = {

 // Support: IE<=11+
 // Make sure textarea (and checkbox) defaultValue is properly cloned

   'feature-cloneCheck': hAzzle.assert(function(div) {
      div.innerHTML = "<textarea>the unknown</textarea>";
     return !!div.cloneNode(true).firstChild.defaultValue;
   })

	};

function addFeature(name, fn) {
   if(typeof fn === 'function') {
	_hfs[name] = fn;
   }
}

/* ============================ BUG / FEATURE DETECTION =========================== */

(function() {
    var input = doc.createElement('input'),
        select = doc.createElement('select'),
        opt = select.appendChild(doc.createElement('option'));

    input.type = 'checkbox';

    _hfs['bug-checkbox'] = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    _hfs['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = doc.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 't');

    _hfs['bug-radioValue'] = input.value === 't';

})();
