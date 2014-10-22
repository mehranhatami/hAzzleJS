// support.js
hAzzle.define('Support', function() {

    // Feature detection of elements
    var cls, MultipleArgs, sortDetached,
        checkClone,
        noCloneChecked,

        assert = function(fn) {

            var el = document.createElement('fieldset');

            try {
                return !!fn(el);
            } catch (e) {
                return false;
            } finally {

                // Remove from its parent by default
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
                // release memory in IE
                el = null;
            }
        },

        checkOn, optSelected, radioValue,
        input = document.createElement('input'),
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    input.type = 'checkbox';

    // Support: iOS<=5.1, Android<=4.2+
    // Default value for a checkbox should be 'on'
    checkOn = input.value !== '';

    // Support: IE<=11+
    // Must access selectedIndex to make default options select
    optSelected = opt.selected;

    // Support: IE<=11+
    // An input loses its value after becoming a radio
    input = document.createElement('input');
    input.value = 't';
    input.type = 'radio';
    radioValue = input.value === 't';

    var imcHTML = (function() {

        if (typeof document.implementation.createHTMLDocument === 'function') {
            return true;
        }
        return false;
    }());

    // classList and MultipleArgs detections

    assert(function(div) {

        div.classList.add('a', 'b');
        // Detect if the browser supports classList
        cls = !!document.documentElement.classList;
        // Detect if the classList API supports multiple arguments
        // IE11-- don't support it

        MultipleArgs = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
    });

    sortDetached = assert(function(div) {
        // Should return 1, but returns 4 (following)
        return div.compareDocumentPosition(document.createElement('div')) & 1;
    });

    assert(function(div) {
        var fragment = document.createDocumentFragment(),
            div = fragment.appendChild(div),
            input = document.createElement('input');

        input.setAttribute('type', 'radio');
        input.setAttribute('checked', 'checked');
        input.setAttribute('name', 't');

        div.appendChild(input);
        checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
        // Support: IE<=11+
        // Make sure textarea (and checkbox) defaultValue is properly cloned
        div.innerHTML = '<textarea>x</textarea>';
        noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;

    });

    return {
        assert: assert,
        checkOn: checkOn,
        optSelected: optSelected,
        radioValue: radioValue,
        imcHTML: imcHTML,
        classList: cls,
        multipleArgs: MultipleArgs,
        sortDetached: sortDetached,
        checkClone: checkClone,
        noCloneChecked: noCloneChecked,
        cS: !!document.defaultView.getComputedStyle
    };
});