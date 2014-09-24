// cl3.js
var clHeader = /^h\d$/i,
    clInputs = /^(?:input|select|textarea|button)$/i,
    clIdentifier = /^(?:\\.|[\w-]|[^\x00-\xa0])+$/,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters

   clRunescape = /\\([\da-f]{1,6}[\x20\t\r\n\f]?|([\x20\t\r\n\f])|.)/ig,
   clFunescape = function(_, escaped, escapedWhitespace) {
        var high = '0x' + escaped - 0x10000;
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    };

hAzzle.extend({

    'EMPTY': function(elem) {
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

    'HIDDEN': function(elem) {
        var style = elem.style;
        if (style) {
            if (style.display === 'none' ||
                style.visibility === 'hidden') {
                return true;
            }
        }
        return elem.type === 'hidden';
    },

    'TARGET': function(elem) {
        var hash = window.location ?
            window.location.hash : '';
        return hash && hash.slice(1) === elem.id;
    },
    'ACTIVE': function(elem) {
        return elem === document.activeElement;
    },
    'HOVER': function(elem) {
        return elem === document.hoverElement;
    },
    'VISIBLE': function(elem) {
        return !hAzzle.Expr.HIDDEN(elem);
    },
    'TEXT': function(elem) {
        var attr;
        return elem.nodeName.toLowerCase() === 'input' &&
            elem.type === 'text' &&
            ((attr = elem.getAttribute('type')) === null ||
                attr.toLowerCase() === 'text');
    },
    'HEADER': function(elem) {
        return clHeader.test(elem.nodeName);
    },
    'BUTTON': function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === 'button' ||
            name === 'button';
    },
    'INPUT': function(elem) {
        return clInputs.test(elem.nodeName);
    },
    'PARENT': function(elem) {
        return !hAzzle.Expr.EMPTY(elem);
    },
    'SELECTED': function(elem) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
            elem.parentNode.selectedIndex;
        }
        return elem.selected === true;
    },
    'LANG': function(lang) {
        // lang value must be a valid identifier
        if (!clIdentifier.test(lang || '')) {
            hAzzle.error('unsupported lang: ' + lang);
        }
        lang = lang.replace(clRunescape, clFunescape).toLowerCase();
        return function(elem) {
            var elemLang;
            do {
                if ((elemLang = hAzzle.documentIsHTML ?
                    elem.lang :
                    elem.getAttribute('xml:lang') || elem.getAttribute('lang'))) {

                    elemLang = elemLang.toLowerCase();
                    return elemLang === lang || elemLang.indexOf(lang + '-') === 0;
                }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);
            return false;
        };
    }

}, hAzzle.Expr);

// Add button/input type pseudos

hAzzle.each({
    RADIO: true,
    CHECKBOX: true,
    FILE: true,
    PASSWORD: true,
    IMAGE: true
}, function(value, prop) {
    hAzzle.Expr[prop] = createInputPseudo(prop);
});

hAzzle.each({
    SUBMIT: true,
    RESET: true
}, function(value, prop) {
    hAzzle.Expr[prop] = createButtonPseudo(prop);
});

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */

function createInputPseudo(type) {
    return function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === 'input' && elem.type === type.toLowerCase();
    };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */

function createButtonPseudo(type) {
    return function(elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === 'input' || name === 'button') && elem.type === type.toLowerCase();
    };
}

function createDisabledPseudo( disabled ) {
	// Known :disabled false positives:
	// IE: *[disabled]:not(button, input, select, textarea, optgroup, option, menuitem, fieldset)
	// not IE: fieldset[disabled] fieldset
	return function( elem ) {
		// :enabled ignores ancestry for optgroup, a[href], area[href], link[href]
		return (disabled || 'label' in elem || elem.href) && elem.disabled === disabled ||
			'form' in elem && elem.disabled === false && (
				// Support: IE6-11+
				// Ancestry is covered for us
				elem.isDisabled === disabled ||

				// Otherwise, assume any non-<option> under fieldset[disabled] is disabled
				/* jshint -W018 */
				elem.isDisabled !== !disabled &&
					('label' in elem) !== disabled
			);
	};
}
hAzzle.Expr.ENABLED = createDisabledPseudo(false);
hAzzle.Expr.DISABLED = createDisabledPseudo(true);