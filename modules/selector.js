/**
 * Jiesa - hAzzle selector engine
 */
var win = this,

    winDoc = win.document,

    // document & root

    docElem = hAzzle.docElem,

    documentIsHTML = hAzzle.documentIsHTML,

    // result of parser, parsed index

    parsed = null,

    pi = 0,

    context,

    found,

    // variables for nth-pseudo arguments
    a, b,

    // caching indices
    // Note: callIndex will be incremented for every new call to the getter
    // but gUID can be incremented anytime a new id is required
    callIndex = 0,

    gUID = 0,

    // mathod containers -- find, filter, pseudos
    // Note: ALL of these methods take whatever is in 'found' as input and
    // return the result (always a TRUE array) back in 'found'

    find = {},

    filter = {},

    pseudos = {},

    // Whitespace

    wspace = /^\s*/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors

    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),

    funescape = function (_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        // Support: Firefox
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
            escaped :
            high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    },

    expressions = {
        'nl': null, // newline
        'ws': null, // whitespace
        'hex': null, // hexadecimal character
        'esc': null, // css escape sequence
        'uc': null, // unicode character
        'id_1char': null, // first identifier character
        'id_char': null, // all but first identifier character
        'str_dq': null, // double quoted string
        'str_sq': null // single quoted string
    },

    hasDuplicate,

    sortOrder = function (a, b) {

        // Flag for duplicate removal

        if (a === b) {
            hasDuplicate = true;
            return 0;
        }

        var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);

        if (compare) {
            // Disconnected nodes
            if (compare & 1) {

                // Choose the first element that is related to our document
                if (a === document || hAzzle.contains(document, a)) {
                    return -1;
                }
                if (b === document || hAzzle.contains(document, b)) {
                    return 1;
                }

                // Maintain original order
                return 0;
            }

            return compare & 4 ? -1 : 1;
        }

        // Not directly comparable, sort on existence of method
        return a.compareDocumentPosition ? -1 : 1;
    },

    escapeRegex = function (str) {

        return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");

    },

    // the main regular expressions
    // these should capture relevant parts
    // also note that some match the start (^) -- this is essential for the parser
    re = {
        // css identifier -- no capture
        'identifier': /(?:[-]?<%id_1char><%id_char>*)/,

        // css string -- no capture
        'string': /(?:<%str_dq>|<%str_sq>)/,

        // attribute operators (including =) -- no capture
        'attr_op': /(?:[\^\$\*\~\|]?\=)/,

        // nth pseudo name (function name without '-nth:' part) -- no capture
        'nth_fn': /(?:(?:last-)?(?:child|of-type))/,

        // nth pseudo argument ('a' part in expression an+b) -- no capture
        'nth_expr__an': /(?:(?:\+|\-)?\d*n)/,

        // nth pseudo argument ('b' part in expression an+b) -- no capture
        'nth_expr__b': /(?:(?:<%ws>*(?:\+|\-)<%ws>*\d+)?)/,

        // nth pseudo argument ('x' part which is something not an+b) -- no capture
        'nth_expr__x': /(?:(?:(?:\+|\-)?\d+)|even|odd)/,

        // type selector (doesn't include *) -- no capture
        'type': /^<%identifier>/,

        // id selector
      
	    'id': /^#([\w\-]*)$/,

        // class selector

        'class': /^\.([\w\-]*)$/,

        // attribute selector
        // $1 - attribute name
        // $2 - attribute operator including =
        // $3 - attribute value (identifier)
        // $4 - attribute value (string)
        'attribute': /^\[<%ws>*(<%identifier>)<%ws>*(?:(<%attr_op>)<%ws>*(?:(<%identifier>)|(<%string>))<%ws>*)?\]/,

        'simple_pseudo': /^:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/,

        'nth_pseudo':
        // $1 - nth function (without ':nth-')
        // $2 - an (a is +/- integer)
        // $3 - b (b is +/- integer)
        // $4 - x (+/- integer or 'even' or 'odd')
            /^:nth-(<%nth_fn>)\(<%ws>*(?:(?:(<%nth_expr__an>)(<%nth_expr__b>))|(<%nth_expr__x>))<%ws>*\)/,

        'combinator':
        // combinators
        // $1 - combinator
        // /^\s*([>+~]|\s)\s*/,
            /^<%ws>*([>+~]|<%ws>)<%ws>*/,

        'comma':
        // comma -- no capture
            /^<%ws>*,<%ws>*/
    },

    clutter = /\\/g,

    // constants to flag various parts
    co = {

        // comma
        'COMMA': 0,

        // simple selectors
        'TYPE': 1,
        'ID': 2,
        'CLASS': 3,
        'ATTR': 4,
        'PSEUDO': 5,
        'NOT_PSEUDO': 6,

        // combinators
        'DESCENDANT': 91,
        'CHILD': 92,
        'ADJACENT_SIBLING': 93,
        'GENERAL_SIBLING': 94,

        // pseudo classes ---------- //
        // Note: you can assign values to pseudo classes independent of above values

        // special
        'empty': 0,

        // structural - nth
        'nth-child': 10,
        'nth-last-child': 11,
        'nth-of-type': 12,
        'nth-last-of-type': 13,

        // structural - others
        'first-child': 14,
        'last-child': 15,
        'only-child': 16,
        'first-of-type': 17,
        'last-of-type': 18,
        'only-of-type': 19,

        // ui
        'enabled': 30,
        'disabled': 31,
        'checked': 32,
        'selected': 33,

        // Prevent IE from freaking out at the last comma

        '_end_': -1
    },

    // save parsed representation

    parsed = null,

    // remaining string to be parsed

    left = '',

    /**
     * Check if the nodeName is
     * uppercase (true) or lowercase (false)
     */

    NODENAME_UPPERCASE = (function () {

        var div = document.createElement('div'),
            char = (/DIV/.test(div.nodeName));

        // release memory in IE

        div = null;

        return char;
    })(),

    // Check if the document has attributes

    hasAttr = docElem.hasAttribute ?

    function (a, e) {
        return e.hasAttribute(a);
    } :
    function (a, e) {
        return (a = e.getAttributeNode(a)) && a.specified;
    },

    toArray = function () {
        var self = this,
            arr = [],
            i = 0,
            l = self.length;

        for (; i < l; i++)
            arr.push(self[i]);
        return arr;
    },

    indexOf = function (elem) {
		
        var i = 0,
            len = this.length;
        for (; i < len; i++) {
            if (this[i] === elem) {
                return i;
            }
        }
        return -1;
    },

    // Here we go....

    Jiesa = {

        has: {}
    };

// QSA - the native selector engine ------------------------------ //

// api: QSA is available
// bug: Safari 3.2 can't handle mixedcase/uppercase class names

(function () {

    if (!(Jiesa.has['api-QSA'] = document.querySelectorAll !== undefined)) {
        return;
    }

    var e = document.createElement('div');

    e.innerHTML = "<p class='QsA'>TEST</p>";

    Jiesa.has['bug-QSA'] = (e.querySelectorAll(".QsA").length === 0);

    e = null;
})();

/**
 * Compile regular expressions
 */

(function (nl, esc, uc) {

    // first populate expressions regexes with values
    var Expr = expressions;

    // whitespace
    Expr.ws = /(?: |\t|\n|\r\n|\r|\f)/;

    // hexadecimal character
    Expr.hex = /[0-9a-fA-F]/;

    // newline
    if (nl) {

        Expr.nl = /(?:\n|\r\n|\r|\f)/;

    } else {

        delete Expr.nl;
    }

    // css escape sequence
    if (esc) {

        Expr.esc = /(?:(?:\\<%hex>{1,6}<%ws>?)|(?:\\[^\n\r\f0-9a-fA-F]))/;

    } else {

        delete Expr.esc;
    }

    // unicode character

    if (uc) {

        Expr.uc = /[\u00A1-\uFFFF]/;

    } else {

        delete Expr.uc;
    }

    // first identifier character - (?:(?:[-]?[_a-zA-Z])|<%uc>|<%esc>)
    Expr.id_1char = new RegExp(
        '(?:' + '[_a-zA-Z]' + (uc ? '|<%uc>' : '') + (esc ? '|<%esc>' : '') + ')'
    );

    // all but first identifier character - (?:[_a-zA-Z0-9-]|<%uc>|<%esc>)
    Expr.id_char = new RegExp(
        '(?:' + '(?:[_a-zA-Z0-9-])' + (uc ? '|<%uc>' : '') + (esc ? '|<%esc>' : '') + ')'
    );

    // double quoted string (?:\"(?:[^\n\r\f\\"]|(?:\\<%nl>)|<%uc>|<%esc>)*\")

    Expr.str_dq = new RegExp(
        '(?:' + /\"/.source + '(?:' + /[^\n\r\f\\"]/.source +
        (nl ? /|(?:\\<%nl>)/.source : '') + (uc ? '|<%uc>' : '') + (esc ? '|<%esc>' : '') +
        ')*' + /\"/.source + ')'
    );

    // single quoted string (?:\'(?:[^\n\r\f\\']|(?:\\<%nl>)|<%uc>|<%esc>)*\')
    Expr.str_sq = new RegExp(
        '(?:' + /\'/.source + '(?:' + /[^\n\r\f\\']/.source +
        (nl ? /|(?:\\<%nl>)/.source : '') + (uc ? '|<%uc>' : '') + (esc ? '|<%esc>' : '') +
        ')*' + /\'/.source + ')'
    );

    // compile the regular expressions in this order
    var order = [
        'esc', 'id_1char', 'id_char', 'str_dq', 'str_sq',
        'identifier', 'string', 'nth_expr__b',
        'type', 'id', 'class', 'attribute', 'simple_pseudo', 'nth_pseudo',
        'combinator', 'comma'
    ];

    // replace map -- key to object map
    var map = {},
        s, arr;

    for (s in expressions) {

        map[s] = expressions;

    }

    for (s in re) {

        map[s] = re;
    }

    var re_replace = /<%([_a-zA-Z0-9]*)>/g;

    // Note: the 'g' flag in re_replace is very important as it makes the
    // RegExp::exec() mathod behave slightly differently -- which is what we need

    // do the replacing

    var i = 0,
        l = order.length;

    for (; i < l; i++) {

        s = order[i];

        if (!map[s]) {

            continue;
        }

        Expr = map[s][s];

        while (arr = re_replace.exec(Expr.source)) {

            if (map[arr[1]]) {

                Expr = new RegExp(Expr.source.replace(
                    new RegExp(arr[0], 'g'),
                    map[arr[1]][arr[1]].source
                ));

                re_replace.lastIndex = 0;

            } else {

                continue;
            }
        }
        map[s][s] = Expr;
    }

    re['nth_pseudo'] = new RegExp(re['nth_pseudo'].source, 'i');

})(true, true, true);


/* =========================== PRIVATE FUNCTIONS ========================== */

/**
 * Sort Attributes
 */

function sortAttr(elem, name, operator, check) {
    var result = hAzzle.attr(elem, name);
    if (result === null) {
        return operator === "!=";
    }

    if (!operator) {
        return true;
    }
    result += "";

    return operator === "=" ? result === check :
        operator === "!=" ? result !== check :
        operator === "^=" ? check && result.indexOf(check) === 0 :
        operator === "*=" ? check && result.indexOf(check) > -1 :
        operator === "$=" ? check && result.slice(-check.length) === check :
        operator === "~=" ? (" " + result + " ").indexOf(check) > -1 :
        operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
        false;
}


/**
 * Find next element sibiling.
 *
 * @param {Object} el
 *
 * @return {Object}
 */

function nextElementSibling(el) {
    if (el.nextElementSibling) {
        return el.nextElementSibling;
    } else {
        while (el = el.nextSibling) {
            if (el.nodeType !== 1) return el;
        }
    }
}

/**
 * Find previous element sibling.
 *
 * @param {Object} el
 *
 * @return {Object}
 */

function previousElementSibling(el) {
    if (el.previousElementSibling) {
        return el.previousElementSibling;
    } else {
        while (el = el.previousSibling) {
            if (el.nodeType === 1) return el;
        }
    }
}

function firstElementChild(el) {
    var child = el.firstElementChild;
    if (!child) {
        child = el.firstChild;
        while (child && child.nodeType !== 1)
            child = child.nextSibling;
    }
    return child;
}

function lastElementChild(el) {
    var child = el.lastElementChild;
    if (!child) {
        child = el.lastChild;
        while (child && child.nodeType !== 1)
            child = child.previousSibling;
    }
    return child;
}


function compileSimple() {

    // save the initial length of the remaining expression

    var l = left.length;

    // first match any type selector, as it can only appear at the beginning

    compileType();

    // match other simple selectors

    while (left !== '') {

        switch (left.charAt(0)) {

        case '#':

            if (!parseID()) {

                hAzzle.error('invalid selector expression');
            }

            break;

        case '.':

            if (!parseCLASS()) {

                hAzzle.error('invalid selector expression');
            }
            break;

        case '[':

            if (!parseATTR()) {

                hAzzle.error('invalid selector expression');

            }
            break;

        case ':':

            if (/^:not/i.test(left)) {

                if (!compileNOT()) {

                    hAzzle.error('invalid selector expression');

                }
            } else {

                if (!compilePseudo()) {

                    hAzzle.error('invalid selector expression');
                }
            }

            break;

        default:
            // if remaining expression's length is same, we couldn't match anything
            if (left.length == l) {

                hAzzle.error('invalid selector expression');

            } else return;
        }
    }
}



function compileType() {
    var m;

    if (left.charAt(0) == '*') {

        m = '*';

    } else {

        var arr = left.match(re['type']);

        if (arr) {

            m = NODENAME_UPPERCASE ? arr[0].toUpperCase() : arr[0].toLowerCase();

        }
    }

    if (m) {
        left = left.slice(m.length);
        parsed.push(co['TYPE'], m.replace(clutter, ''));
        return true;
    }

    return false;
}

// id parser
function parseID() {

    var arr = left.match(re['id']);

    if (arr) {
        left = left.slice(arr[0].length);
        parsed.push(co['ID'], arr[1].replace(clutter, ''));
        return true;
    }

    return false;
}

// class parser

function parseCLASS() {
    var arr = left.match(re['class']);

    if (arr) {
        left = left.slice(arr[0].length);
        parsed.push(co['CLASS'], arr[1].replace(clutter, ''));
        return true;
    }

    return false;
}

// attribute parser
function parseATTR() {
    var arr = left.match(re['attribute']);

    if (arr) {
        left = left.slice(arr[0].length);
        parsed.push(co['ATTR']);

        // push name first
        parsed.push(arr[1].replace(clutter, ''));

        // push operator and value if they exist

        if (arr[2]) {

            parsed.push(arr[2]);

            // Note:
            // attribute value is in
            // arr[3] - non-string (identifier) value or
            // arr[4] - string value
            // the attribute value (whether string or identifier)
            // will be saved in the as a string;
            // for this reason we'll strip the quotes from the string values

            // Note:
            // we'll remove '\' characters only when the attribute value
            // is NOT a string -- for strings don't touch backslashes

            if (arr[3]) {

                parsed.push(arr[3].replace(clutter, ''));

            } else if (arr[4]) {

                parsed.push(arr[4].slice(1, -1));

            } else {

                parsed.push('');
            }

        } else {

            parsed.push(undefined, undefined);
        }

        return true;
    }

    return false;
}

// pseudo parser
function compilePseudo() {
    var arr, l = 0;

    if (/^:nth-/i.test(left)) {
        if ((arr = left.match(re['nth_pseudo'])) === null) return false;

        l = arr[0].length;

        parsed.push(co['PSEUDO'], co['nth-' + arr[1].toLowerCase()]);

        var a = arr[2],
            b = arr[3],
            x = arr[4],
            ws = /\s/g;

        // Mehran!! IE treats arr[2], arr[3], arr[4] differently than other browsers --
        // if nothing is matched, these will be undefined in other browsers BUT
        // will be empty strings in IE. Take care of this.

        // Mehran!! a and x are mutually exclusive -- they can't be
        // non-undefined or undefnied at the same time; if a is undefined,
        // x must be non-undefined, and vice-versa

        if (a) {

            a = parseInt(a.replace(ws, ''));

            // this is for when 'n' is not preceded by a number
            // in expressions like n+1 or -n
            if (isNaN(a)) a = parseInt((a = arr[2]).replace(/n/, '1'));
        }

        b = (b && parseInt(b.replace(ws, ''))) || 0;

        if (x) {
            if (/even|odd/i.test(x)) {
                x = x.toLowerCase();
                a = 2;
                b = (x == 'odd') ? 1 : 0;
            } else {
                a = 0;
                b = parseInt(x.replace(ws, ''));
            }
        }

        parsed.push(a, b);

    } else if ((arr = left.match(re['simple_pseudo'])) !== null) {

        l = arr[0].length;

        var m = co[arr[1].toLowerCase()];

        // verify that the pseudo class actually exists

        if (m === undefined) {

            return false;
        }

        parsed.push(co['PSEUDO'], m);
    }

    if (l > 0) {

        left = left.slice(l);
        return true;
    }

    return false;
}

/**
 * Not pseudo parser
 */

function compileNOT() {

    left = left.slice(5);

    parsed.push(co['NOT_PSEUDO']);

    // skip whitespace

    left = left.slice(left.match(wspace)[0].length);

    var m, prfx = left.charAt(0);

    if (prfx === '#') {

        m = parseID();

    } else if (prfx === '.') {

        m = parseCLASS();

    } else if (prfx === '[') {

        m = parseATTR();

    } else if (prfx === ':') {

        m = compilePseudo();

    } else {

        m = compileType();
    }

    // skip whitespace

    left = left.slice(left.match(wspace)[0].length);

    if (!m || left.charAt(0) != ')') {

        return false;
    }

    left = left.slice(1);

    return true;
}

/**
 * Combinator & comma parser
 */

function compileExtra() {

    var arr = left.match(re['comma']);

    if (arr !== null) {

        left = left.slice(arr[0].length);

        parsed.push(co['COMMA']);

        // Combinators

    } else if ((arr = left.match(re['combinator'])) !== null) {

        left = left.slice(arr[0].length);

        // Child

        if (arr[1] === '>') {

            parsed.push(co['CHILD']);

            // Adjacent sibling

        } else if (arr[1] === '+') {

            parsed.push(co['ADJACENT_SIBLING']);

            // General sibling

        } else if (arr[1] === '~') {

            parsed.push(co['GENERAL_SIBLING']);

        } else {

            parsed.push(co['DESCENDANT']);
        }

    } else {

        hAzzle.error('Uknown expression');
    }

    if (!left.length) {

        hAzzle.error('Uknown expression');
    }
}

// Main method ---------------------------------------- //

function parse(expr) {
    // strip extra whitespace
    left = String(expr).replace(/^\s*|\s*$/g, '');

    // don't accept empty selector
    if (!left.length) {

        hAzzle.error('Uknown expression');
    }

    // init a new array in parsed
    parsed = [];

    // this loop does the parsing
    while (true) {
        compileSimple();
        if (left.length) compileExtra();
        else break;
    }

    // return the parsed representation
    return parsed;
}

/* =========================== FIND METHODS ========================== */

find[co['TYPE']] = function () {
    found = toArray.call(context.getElementsByTagName(parsed[pi++]), 0);
};

find[co['ID']] = function () {
    var e = context.getElementById(parsed[pi++]);

    if (e) {

        found = (context === document) ? [e] : (hAzzle.contains(context, e) ? [e] : []);

    } else {

        found = [];
    }
};

find[co['CLASS']] = function () {

    if (documentIsHTML) {

        var e = toArray.call(context.getElementsByClassName(parsed[pi++]));

        if (e) {

            found = e;

        } else {

            found = [];
        }

        // If XML, we have to use 'getElementsByTagName' and
        // filter the result - a much slower solution

    } else {

        found = context.getElementsByTagName('*');
        filter[co['CLASS']]();
    }

};

find[co['ATTR']] = function () {
    found = context.getElementsByTagName('*');
    filter[co['ATTR']]();
};

find[co['PSEUDO']] = function () {
    found = context.getElementsByTagName('*');
    filter[co['PSEUDO']]();
};

find[co['NOT_PSEUDO']] = function () {
    found = context.getElementsByTagName('*');
    filter[co['NOT_PSEUDO']]();
};

/* =========================== FILTER METHODS ========================== */

filter[co['TYPE']] = function () {

    var t = parsed[pi++];

    if (t == '*') {

        if (found instanceof Array) {

            return;
        }

        found = toArray.call(found, 0);
        return;
    }

    var arr = [],
        e, i = 0,
        l = found.length;

    for (; i < l; i++) {
        if ((e = found[i]).nodeName == t)
            arr.push(e);
    }

    found = arr;
};

filter[co['ID']] = function () {

    var attrId = parsed[pi++].replace(runescape, funescape),
        i = 0,
        l = found.length;

    for (; i < l; i++) {
        if (found[i].getAttribute('id') === attrId) {
            found = [found[i]];
            return;
        }
    }
    found = [];
};

filter[co['CLASS']] = function () {
    // TODO!! Add classList support
    var re = new RegExp('(^|\\s)' + escapeRegex(parsed[pi++]) + '(\\s|$)'),
        arr = [],
        e, c,
        i = 0,
        l = found.length;

    for (; i < l; i++) {
        if ((c = (e = found[i]).className) && re.test(c)) {

            arr.push(e);
        }
    }

    found = arr;
};



filter[co['ATTR']] = function () {

    // get name, operator, value
    var name = parsed[pi++],
        operator = parsed[pi++],
        check = parsed[pi++];

    var arr = [],
        e, i, l = found.length;

    if (operator && check.length) {

        var m, av, ln = check.length;

        for (i = 0; i < l; i++) {

            e = found[i];

            // Sort the attributes and collect the result

            if ((m = sortAttr(e, name, operator, check))) {

                arr.push(e);
            }
        }
    } else if (operator && v.length === 0) {

        if (operator !== '=') {
            found = [];
            return;
        }

        for (i = 0; i < l; i++) {

            e = found[i];

            if (attr(name, e) === '') {

                arr.push(e);
            }
        }
    } else {
        for (i = 0; i < l; i++) {
            e = found[i];
            if (hasAttr(name, e)) {

                arr.push(e);
            }
        }
    }

    found = arr;
};

filter[co['PSEUDO']] = function () {

    var p = parsed[pi++];

    if (p === co['nth-child'] ||
        p === co['nth-last-child'] ||
        p === co['nth-of-type'] ||
        p === co['nth-last-of-type']) {

        a = parsed[pi++], b = parsed[pi++];

        if (b === 0) {
            if (a === 0) {
                found = [];
                return;
            }
            if (a == 1) {

                if (found instanceof Array) {
                    return;
                }

                found = toArray.call(found, 0);
                return;
            }
        }
    }
    pseudos[p]();
};

// NOT pseudo

filter[co['NOT_PSEUDO']] = function () {

    var old = found;

    filter[parsed[pi++]]();

    var arr = found,
        i = 0,
        j = 0,
        k = 0,
        e, x, temp = [];

    while ((x = arr[i++])) {

        while ((e = old[j++]) !== x) {
            temp[k++] = e;
        }

        while (e = old[j++]) {

            temp[k++] = e;
        }
    }

    found = temp;
};

// Descendant

filter[co['DESCENDANT']] = function () {

    /** 
     * Mehran!
     *
     * Note very carefully that the following method of collecting
     * descendants (specially caching) relies on the fact that elements
     * in 'found' are in "document order"
     */

    var i = 0,
        elems = found,
        l = elems.length,
        arr = [],
        old_cxt = context,
        old_pi = pi,
        e, ii = 0,
        ll = found.length,
        x = ++gUID;

    for (; i < l; i++) {
        // reset pi, and set new context
        pi = old_pi;
        context = elems[i];

        if (context.uid == x) {

            continue;
        }

        // find in found -- this is to optimize things

        find[parsed[pi++]]();

        for (; ii < ll; ii++) {

            if ((e = found[ii]).uid == x) {
                break;
            }

            e.uid = x;
            arr.push(e);
        }
    }

    // reset context
    context = old_cxt;

    found = arr;
};

// Child

filter[co['CHILD']] = function () {
    var i = 0,
        l = found.length,
        arr = [],
        e;

    for (; i < l; i++) {
        if (!(e = found[i].firstChild)) continue;
        do {
            if (e.nodeType == 1) arr.push(e);
        } while (e = e.nextSibling);
    }

    found = arr;
};

// Adjacent sibling

filter[co['ADJACENT_SIBLING']] = function () {
    var i, l = found.length,
        arr = [],
        e;

    for (i = 0; i < l; i++) {
        e = found[i];

        // get the adjacent sibling
        while ((e = e.nextSibling) && e.nodeType != 1);

        // no duplicates possible
        if (e) arr.push(e);
    }

    found = arr;
};

// General sibling

filter[co['GENERAL_SIBLING']] = function () {
    var i = 0,
        l = found.length,
        arr = [],
        e,
        x = ++gUID;

    for (; i < l; i++) {

        e = found[i];

        while (e = e.nextSibling) {
            if (e.nodeType != 1) {
                continue;
            }

            if (e.uid == x) {

                break;
            }

            e.uid = x;
            arr.push(e);
        }
    }

    found = arr;
};

/* =========================== PSEUDO FILTER METHODS ========================== */

pseudos[co['empty']] = function () {
    var arr = [],
        e,
        i = 0,
        l = found.length;

    for (; i < l; i++) {

        if (!((e = found[i]).firstChild)) {

            if (!e.nodeType < 6) {

                arr.push(e);
            }
        }
    }

    found = arr;
};

pseudos[co['nth-child']] = function () {

    var i, l = found.length,
        elem, e, x, p, arr = [],
        n;

    for (i = 0; i < l; i++) {
        elem = found[i];
        p = elem.parentNode;

        if (!elem.childIndex || p.childrenIndexed != callIndex) {
            x = 1;
            p.childrenIndexed = callIndex;

            for (e = firstElementChild(p); e; e = nextElementSibling(e))
                e.childIndex = x++;
        }

        x = elem.childIndex;
        if (a == 0 ? x == b : (n = x - b), (n / a >= 0 && n % a == 0))
            arr.push(elem);
    }

    found = arr;
};

pseudos[co['nth-last-child']] = function () {
    var i, l = found.length,
        elem, e, x, p, arr = [],
        n;

    for (i = 0; i < l; i++) {
        elem = found[i];
        p = elem.parentNode;

        if (!elem.lastChildIndex || p.lastChildrenIndexed != callIndex) {
            x = 1;
            p.lastChildrenIndexed = callIndex;

            for (e = lastElementChild(p); e; e = previousElementSibling(e))
                e.lastChildIndex = x++;
        }

        x = elem.lastChildIndex;
        if (a == 0 ? x == b : (n = x - b), (n / a >= 0 && n % a == 0))
            arr.push(elem);
    }

    found = arr;
};

pseudos[co['nth-of-type']] = function () {
    var i, l = found.length,
        elem, e, t, x, p, arr = [],
        n, c;

    for (i = 0; i < l; i++) {
        elem = found[i];
        p = elem.parentNode;
        t = elem.nodeName;
        c = 'childrenIndexed_' + t;

        if (!elem.childIndex_t || p[c] != callIndex) {
            x = 1;
            p[c] = callIndex;

            for (e = firstElementChild(p); e; e = nextElementSibling(e))
                if (e.nodeName == t) e.childIndex_t = x++;
        }

        x = elem.childIndex_t;
        if (a == 0 ? x == b : (n = x - b), (n / a >= 0 && n % a == 0))
            arr.push(elem);
    }

    found = arr;
};

pseudos[co['nth-last-of-type']] = function () {

    var i, l = found.length,
        elem, e, t, x, p, arr = [],
        n, c;

    for (i = 0; i < l; i++) {
        elem = found[i];
        p = elem.parentNode;
        t = elem.nodeName;
        c = 'lastChildrenIndexed_' + t;

        if (!elem.lastChildIndex_t || p[c] != callIndex) {
            x = 1;
            p[c] = callIndex;

            for (e = lastElementChild(p); e; e = previousElementSibling(e))
                if (e.nodeName == t) e.lastChildIndex_t = x++;
        }

        x = elem.lastChildIndex_t;
        if (a == 0 ? x == b : (n = x - b), (n / a >= 0 && n % a == 0))
            arr.push(elem);
    }

    found = arr;
};

pseudos[co['first-child']] = function () {
    var i, l = found.length,
        e, arr = [];

    for (i = 0; i < l; i++) {
        e = found[i];
        if (e === firstElementChild(e.parentNode)) arr.push(e);
    }

    found = arr;
};

pseudos[co['last-child']] = function () {
    var i, l = found.length,
        e, arr = [];

    for (i = 0; i < l; i++) {
        e = found[i];
        if (e === lastElementChild(e.parentNode)) arr.push(e);
    }

    found = arr;
};

pseudos[co['only-child']] = function () {
    var i, l = found.length,
        e, arr = [];

    for (i = 0; i < l; i++) {
        e = found[i];
        if (e.parentNode.childElementCount == 1) arr.push(e);
    }

    found = arr;
};

pseudos[co['first-of-type']] = function () {
    var i, l = found.length,
        e, elem, t, arr = [];

    for (i = 0; i < l; i++) {
        e = elem = found[i];
        t = elem.tagName;

        while ((e = previousElementSibling(e)) && e.tagName != t);
        if (!e) arr.push(elem);
    }

    found = arr;
};

pseudos[co['last-of-type']] = function () {
    var i, l = found.length,
        e, elem, t, arr = [];

    for (i = 0; i < l; i++) {
        e = elem = found[i];
        t = elem.tagName;

        while ((e = nextElementSibling(e)) && e.tagName != t);
        if (!e) arr.push(elem);
    }

    found = arr;
};

pseudos[co['only-of-type']] = function () {
    var i, l = found.length,
        elem, e, t, arr = [];

    outer: for (i = 0; i < l; i++) {
        elem = found[i];
        t = elem.nodeName;

        e = elem;
        while ((e = previousElementSibling(e)) && e.nodeName != t);
        if (e) continue outer;

        e = elem;
        while ((e = nextElementSibling(e)) && e.nodeName != t);
        if (e) continue outer;

        arr.push(elem);
    }

    found = arr;
};

/**
 * 'Find' function to be used by hAzzle.select if
 * we  are not using querySelectorAll (QSA)
 */

function get(selector, ctx, results) {

    var match, elem, m, nodeType;

    if ((ctx ? ctx.ownerDocument || ctx : winDoc) !== document) {
        hAzzle.setDocument(ctx);
    }

    // Always set correct context

    context = normalizeRoot(ctx);
	
    results = results || [];

    if (!selector || typeof selector !== "string") {
        return results;
    }

    if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
       return [];
    }
    /*
    if (documentIsHTML) {
        if ((match = rquickExpr.exec(selector))) {
            if ((m = match[1])) {
                if (nodeType === 9) {
                    elem = context.getElementById(m);
                    if (elem && elem.parentNode) {
                        if (elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    } else {
                        return results;
                    }
                } else {
                    if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                        hAzzle(context, elem) && elem.id === m) {
                        results.push(elem);
                        return results;
                    }
                }
            } else if (match[2]) {
                push.apply(results, context.getElementsByTagName(selector));
                return results;

                // Speed-up: Sizzle(".CLASS")
            } else if ((m = match[3]) && context.getElementsByClassName) {
                push.apply(results, context.getElementsByClassName(m));
                return results;
            }
        } 
    } */


    // call the parser here
    parsed = parse(selector);

    callIndex++;
    pi = 0;

    var l = parsed.length,
        arr = [],
        c = 0;
    // arr is result collector, c is a comma counter

    // this loop does the getting
    while (true) {
        find[parsed[pi++]]();

        // you'll get out of this loop only when you encounter a ',' or reach the end
        while (parsed[pi]) filter[parsed[pi++]]();

        arr[c] = found;
        if (pi == l) break;
        else {
            pi++;
            c++;
        }
    }

    // reset found
    found = null;

    // we don't need to sort the results if there was no comma
    if (c == 0) return arr[0];

    var i, ii, ll, temp, e,
        result = [],
        x = ++gUID;

    // filter unique elements from all arrays in arr array
    for (i = 0, l = arr.length; i < l; i++)
        for (temp = arr[i], ii = 0, ll = temp.length; ii < ll; ii++)
            if ((e = temp[ii]).uid != x) {
                result.push(e);
                e.uid = x;
            }

            // now sort elements in "Document Order"

    if (sortOrder) {

        result.sort(sortOrder);
    }

    return result;
};

/**
 * Filter elements node
 */

function onlyElems(arr) {
    var elems = [],
        e,
        i = 0,
        j = 0,
        l = arr.length;

    for (; i < l; i++) {

        if ((e = arr[i]).nodeType == 1) {

            elems[j++] = e;
        }
    }
    return elems;
}

/**
 * Get / Has attribute
 */

function attr(a, e) {


    if (a === 'class') {

        return ('className' in e) ? e.className : e.getAttribute('class');
    }

    if (a === 'for') {

        return ('htmlFor' in e) ? e.htmlFor : e.getAttribute('for');
    }

    if (a === 'href') {

        return ('href' in e) ? e.getAttribute('href', 2) : e.getAttribute('href');

    }

    if (a === 'type') {

        return e.getAttribute('type');

    }

    if (a === 'tabindex') {
        var attributeNode = e.getAttributeNode('tabindex');
        return (attributeNode && attributeNode.specified) ? attributeNode.nodeValue : null;
    }

    if (a === 'style') {

        return (e.style) ? e.style.cssText : e.getAttribute('style');
    }

    return (a in e) ? e[a] : e.getAttribute(a);

}

/* =========================== BUG CHECK AND FIXES ========================== */


/**
 * Support testing using an element
 * @param {Function} fn
 */
function assert(fn) {
    var div = document.createElement("div");

    try {
        return !!fn(div);
    } catch (e) {
        return false;
    } finally {
        // Remove from its parent by default
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
        // release memory in IE
        div = null;
    }
}

Jiesa.has["bug-GEBTN"] = assert(function (div) {

    div.appendChild(document.createComment(''));

    return div.getElementsByTagName('*').length > 0;

});

// Check for getElementsByClassName bug


Jiesa.has["bug-GEBTN"] = assert(function (div) {

    div.innerHTML = "<p class='x y'>MEHRAN</p>";

    var b1 = (div.getElementsByClassName('y').length === 0);

    div.firstChild.className = 'z';

    var b2 = (div.getElementsByClassName('z').length === 0);

    return b1 || b2;
});


// Bug Fixes ------------------------------ //

if (Jiesa.has["bug-GEBTN"]) {

    /**
     * Fixing the getElementsByTagName bug.  For this bug we'll have to change some find methods;
     */

    find[co['TYPE']] = function () {
        var p = parsed[pi++];
        found = (p == '*') ?
            onlyElems(context.getElementsByTagName('*')) :
            toArray.call(context.getElementsByTagName(p), 0);
    };

    find[co['CLASS']] = function () {
        found = onlyElems(context.getElementsByTagName('*'));
        filter[co['CLASS']]();
    };

    find[co['ATTR']] = function () {
        found = onlyElems(context.getElementsByTagName('*'));
        filter[co['ATTR']]();
    };

    find[co['PSEUDO']] = function () {
        found = onlyElems(context.getElementsByTagName('*'));
        filter[co['PSEUDO']]();
    };

    find[co['NOT_PSEUDO']] = function () {
        found = onlyElems(context.getElementsByTagName('*'));
        filter[co['NOT_PSEUDO']]();
    };
}

/**
 * Check for getElementsByClassName support and bug
 */

if (Jiesa.has["api-GEBCN"] && !Jiesa.has['bug-GEBCN']) {
    find[co['CLASS']] = function () {
        found = toArray.call(context.getElementsByClassName(parsed[pi++]), 0);
    };
}

function normalizeRoot(ctx) {

    if (!ctx) {

        return winDoc;
    }

    if (typeof ctx === 'string') {

        return hAzzle.select(ctx)[0];
    }

    if (!ctx.nodeType && arrayLike(ctx)) {
        return ctx[0];
    }
    return ctx;
}

/**
 * QSA selector engine
 */

var QSA = (Jiesa.has['api-QSA'] && !Jiesa.has['bug-QSA']) ?
    function (selector, context) {
        var res, nodeType;
        if ((context ? context.ownerDocument || context : winDoc) !== document) {
            hAzzle.setDocument(context);
        }
        context = normalizeRoot(context)
        selector = selector + '';
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        // Fallback to non-native selector engine
        // if QSA fails

        res = toArray.call(context.querySelectorAll(selector), 0);
        if (!res) {
            res = get(selector, context);
        }
        return res;
    } : null;


// Extend the globale hAzzle object

hAzzle.extend({

    /** 
     * Provide a enable/disable switch for QSA
     */
    useNative: QSA ?
        function (b) {
            if (typeof b === 'boolean' && b) {
                hAzzle.select = QSA;
            } else {
                hAzzle.select = get;
            }
        } : function () {}

}, hAzzle);

// Never remove!!!

hAzzle.useNative(false);


// Enabled / disabled

hAzzle.forOwn({

    'enabled': false,
    'disabled': true,

}, function (bool, p) {

    pseudos[co[p]] = function () {
        var arr = [],
            e,
            i = 0,
            l = found.length;

        for (; i < l; i++) {

            if ((e = found[i]).disabled === bool) {
                arr.push(e);
            }
        }
        found = arr;
    };
});


// Disabled / Unchecked


pseudos[co['checked']] = function () {
    var arr = [],
        e,
        i = 0,
        l = found.length,
        nodeName;
    for (; i < l; i++) {

        nodeName = found[i].nodeName.toLowerCase();

        if ((nodeName === "input" && !!found[i].checked) || (nodeName === "option" && !!found[i].selected))
            arr.push(found[i]);
    }

    found = arr;
};

pseudos[co['selected']] = function () {
    var arr = [],
        e,
        i = 0,
        l = found.length,
        elem;

    for (; i < l; i++) {

        elem = found[i];

        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
            elem.parentNode.selectedIndex;
        }

        if (elem.selected === true) {
            arr.push(elem);
        }
    }

    found = arr;
};