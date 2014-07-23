/**
 * Jiesa selector engine
 *
 * Contains:
 *
 * - Jiesa selector engine
 * - Jiesa.findOne
 * - Jiesa.matchesSelector
 *
 * - Various bug checks
 */

var Jiesa = hAzzle.Jiesa,

  // Default document

  doc = this.document,

  documentIsHTML = hAzzle.documentIsHTML,

  matches,

  // Expando

  expando = hAzzle.expando,

  push = Array.prototype.push,

  // Various regEx

  sibling = /[+~]/,

  escaped = /'|\\/g,

  native = /^[^{]+\{\s*\[native \w/,

  quickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

  rtrim = /^[\x20\t\r\n\f]+|((?:^|[^\\])(?:\\.)*)[\x20\t\r\n\f]+$/g,

  quotes = /=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g;



// Extend the Jiesa Object

hAzzle.extend({

  /**
   * Jiesa selector engine
   *
   * @param {String} selector
   * @param {String/Object/Array} context
   * @param {Array} results
   * @param {Boolean} single
   * @return {hAzzle}
   *
   * 'single' are used if we want to use
   * querySelector and not querySelectorAll
   */

  find: function (selector, context, results, /* INTERNAL */ single) {

    var quickMatch = quickExpr.exec(selector),
      nodeType;

    // Set correct document

    if ((context ? context.ownerDocument || context : doc) !== document) {
      // Overwrite if needed
      doc = hAzzle.setDocument(context);
    }

    context = context || doc;
    results = results || [];

    if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
      return [];
    }

    // Activate QSA if 'single' {true}

    Jiesa.useNative = single ? true : false;

    if (documentIsHTML) {

      if (quickMatch) {

        qM(selector, context, quickMatch);
      }

      // If querySelectorAll are activated, and not buggy,
      // existing, and no XML doc - use QSA. If not, fallback
      // to the internal selector engine 

      if (Jiesa.useNative && Jiesa.has['api-QSA'] && !Jiesa.has['bug-QSA']) {

        var old = true,
          nid = expando;

        if (context !== doc) {

          // Thanks to Andrew Dupont for the technique

          old = context.getAttribute('id');

          if (old) {

            nid = old.replace(escaped, '\\$&');

          } else {

            context.setAttribute('id', nid);
          }

          nid = "[id='" + nid + "'] ";

          context = sibling.test(selector) ? context.parentElement : context;
          selector = nid + selector.split(',').join(',' + nid);
        }

        try {

          // Use 'querySelector' if single{true}, otherwise use 'querySelectorAll'

          if (single) {

            return [context.querySelector(selector)];

          } else {

            push.apply(results, context.querySelectorAll(selector));
            return results;
          }

        } finally {

          if (!old) {

            context.removeAttribute("id");
          }
        }
      }
    }
    // Run the parser

    return hAzzle.merge(results, Jiesa.parse(selector.replace(rtrim, "$1"), context));

  },

  /**
   * Find the first matched element by selector
   * @param {String} selector
   * @param {String/Object/Array} context
   * @return {hAzzle}
   */

  findOne: function (selector, context) {
    return this.find(selector, context, null, true);
  },

  /**
   * Find element matched by selector
   * @param {String} selector
   * @param {Object}  elem
   * @return {Boolean}
   */

  matchesSelector: function (elem, selector) {

    // Set correct document

    if ((elem ? elem.ownerDocument || elem : doc) !== document) {
      // Overwrite if needed
      doc = hAzzle.setDocument(elem);
    }

    // Make sure that attribute selectors are quoted

    selector = selector.replace(quotes, "='$1']");

    // If matchesSelector support

    if (Jiesa.has['api-mS'] && documentIsHTML) {

      // disconnected nodes are said to be in a document fragment in IE 9

      if (Jiesa.has['bug-mS'] || elem.doc && elem.doc.nodeType !== 11) {


        return matches.call(elem, selector);

      } else {

        checkParent(elem);
        try {
          return matches.call(elem, selector);
        } catch (e) {}

      }

    } else {

      // append to fragment if no parent

      checkParent(elem);

      // match elem with all selected elems of parent

      var els = elem.parentNode.querySelectorAll(selector),
        i = 0,
        len = els.length;

      // Do a quick loop

      for (; i < len; i++) {

        // return true if match

        if (els[i] === elem) {

          return true;
        }
      }

      // otherwise return false
      return false;
    }
  }

}, Jiesa);

/**
 * Append to fragment
 */

function checkParent(elem) {

  // not needed if already has parent

  if (!elem || elem.parentNode) {

    return;
  }

  var fragment = document.createDocumentFragment();

  try {
    fragment.appendChild(elem);
    return fragment;
  } catch (e) {} finally {
    return "";
  }


}

function qM(selector, context, quickMatch) {
  var results = [],
    m, elem;
  if ((m = quickMatch[1])) {
    if (context.nodeType === 9) {
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

      if (context.ownerDocument && ((elem = context.ownerDocument.getElementById(m))) &&
        hAzzle.contains(context, elem) && elem.id === m) {
        results.push(elem);
        return results;
      }
    }

    // Tag

  } else if (quickMatch[2]) {
    push.apply(results, context.getElementsByTagName(selector));
    return results;

    // Class

  } else if (context.getElementsByClassName) {
    push.apply(results, context.getElementsByClassName(quickMatch[3]));
    return results;
  }
}

// Expand to the global hAzzle object

hAzzle.find = Jiesa.find;
hAzzle.findOne = Jiesa.findOne;
hAzzle.matchesSelector = Jiesa.matchesSelector;

// Boolean true / false
// If 'true', QSA got activated

hAzzle.useNative = Jiesa.useNative = false;