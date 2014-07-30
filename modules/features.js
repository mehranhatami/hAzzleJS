// hAzzle feature detection

var _features = hAzzle.features = {

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
