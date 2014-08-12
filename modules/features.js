// hAzzle feature detection
var docElem = hAzzle.docElem,

    mArgsL = /(^| )a( |$)/,
    mArgsR = /(^| )b( |$)/,
    cnative = /^[^{]+\{\s*\[native \w/,

    matches,

    expando = 'hAzzle-' + String('k.f.' + Math.random()).replace(/\D/g, ''),

    _features = {

        // Check if hAzzle support querySelectorAll

        'api-QSA': !!document.querySelectorAll,

        // Support: IE<=11+
        // Make sure textarea (and checkbox) defaultValue is properly cloned

        'feature-cloneCheck': hAzzle.assert(function(div) {
            div.innerHTML = "<textarea>the unknown</textarea>";
            return !!div.cloneNode(true).firstChild.defaultValue;
        })

    };

function addFeature(name, fn) {
    if (typeof fn === 'function') {
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

// Check if XML document

_features.isXML = (function(document) {
    return (!!document.xmlVersion) || (!!document.xml) || (toString.call(document) == '[object XMLDocument]') ||
        (document.nodeType == 9 && document.documentElement.nodeName != 'HTML');
}(document));

hAzzle.assert(function(div) {

    div.classList.add('a', 'b');
    // Detect if the browser supports classList
    _features['api-classList'] = !!document.documentElement.classList;
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it
    _features['api-MultiArgs'] = mArgsL.test(div.className) && mArgsR.test(div.className);

    _features['api-mS'] = cnative.test((_features.matches = docElem.matches ||
        docElem.webkitMatchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector));
});

_features['bug-QSA'] = _features['api-QSA'] ? hAzzle.assert(function(div) {

    div.innerHTML = "<p class='QsA'>hAzzle</p>";

    return div.querySelectorAll(".QsA").length === 0 ? false :
        // Check for broken :checked pseudo in Webkit/Opera
        !div.querySelectorAll(":checked").length ? false : true;
}) : false;

// matchesSelector supported, test for bugs

_features['bug-mS'] = _features['api-mS'] ? hAzzle.assert(function(div) {

    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    return matches.call(div, 'div') ? false :
        // This should fail with an exception
        // Gecko does not error, returns false instead
        matches.call(div, "[s!='']:x") ? false : true;
}) : false;

/**
 * Check if getElementsByTagName ("*") returns only elements
 */

_features['bug-GEBTN'] = hAzzle.assert(function(div) {
    div.appendChild(document.createComment(''));
    return div.getElementsByTagName('*').length > 0;
});

/**
 * Check for getElementById bug
 * Support: IE<10
 */
_features['bug-GEBI'] = hAzzle.assert(function(div) {
    hAzzle.docElem.appendChild(div).id = expando;
    return document.getElementsByName > 0 || document.getElementsByName(expando).length;
});

// Expose

hAzzle.features = _features;
hAzzle.expando = expando;