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

(function () {
    var input = document.createElement("input"),
        select = document.createElement("select"),
        opt = select.appendChild(document.createElement("option"));

    input.type = "checkbox";

    // Support: iOS<=5.1, Android<=4.2+
    // Default value for a checkbox should be "on"
    features['bug-checkbox'] = input.value !== "";

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    features['bug-optSelected'] = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = document.createElement("input");
    input.value = "t";
    input.type = "radio";
    features['bug-radioValue'] = input.value === "t";
})();

// classList support

features.has['bug-clsp'] = hAzzle.assert(function (div) {
    return !!div.classList;
});

features.has['bug-sMa'] = hAzzle.assert(function (div) {
    div.classList.add('a', 'b');
    return /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
});

// Expand the global hAzzle object

hAzzle.features.optSelected = features['bug-optSelected'];
hAzzle.features.radioValue = features['bug-radioValue'];
hAzzle.features.noCloneChecked = features.has['bug-noCloneChecked'];
hAzzle.features.computedStyle = document.defaultView && document.defaultView.getComputedStyle;
hAzzle.features.classList = features.has['bug-clsp'];
hAzzle.features.sMa = features.has['bug-sMa'];