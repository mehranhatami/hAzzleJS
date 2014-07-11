// hAzzle feature detection
var features = hAzzle.features = {
    version: '0.0.3',

    has: {},

};

// Feature / Bug detection

// Support: IE<=11+
// Make sure textarea (and checkbox) defaultValue is properly cloned

features.has['bug-noCloneChecked'] = hAzzle.assert(function (div) {
    div.innerHTML = "<textarea>x</textarea>";
    return !!div.cloneNode(true).lastChild.defaultValue;
});



// Expand the global hAzzle object

hAzzle.features.noCloneChecked = features.has['bug-noCloneChecked'];
hAzzle.features.classList = features.has['bug-clsp'];
hAzzle.features.sMa = features.has['bug-sMa'];