/**
 * compile.js
 *
 * Include:
 *
 * - parser()
 *
 * This function are an seprate selector engine
 * for public use, and in plugins.
 *
 */
var win = this,

  // Current document
  doc = win.document,

  push = Array.prototype.push,
  pop = Array.prototype.pop,

  // Verify if the doc are HTML

  documentIsHTML = hAzzle.documentIsHTML,

  expando = hAzzle.expando,

  // Short-hand for Jiesa

  Jiesa = hAzzle.Jiesa,

  // Mehran! You benchmark this!
  // Safer solution, but slower I guess

  toArray = hAzzle.makeArray,

  // regEx are slow, so let us do it
  // differently then Jiesa

  boolElem = hAzzle.boolElem,
  boolAttr = hAzzle.boolAttr,

  PseudoCache = {},
  PseudoInfoCache = {},

  chunkCache = hAzzle.createCache(),
  exeCache = hAzzle.createCache(),
  filterCache = hAzzle.createCache(),
  tokenCache = hAzzle.createCache(),
  compilerCache = hAzzle.createCache(),
  classCache = hAzzle.createCache(),
  /**
   * Special regex. NOTE! This is not part of the public Jiesa Object
   */

  trimspaces = /^\s*|\s*$/g,
  whitespace = '[\\x20\\t\\r\\n\\f]',
  special = /\s?([\+~\>])\s?/g,
  identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
  chunky = /(?:#[\w\d_-]+)|(?:\.[\w\d_-]+)|(?:\[(\w+(?:-\w+)?)(?:([\$\*\^!\|~\/]?=)(.+?))?\])|(?:[\>\+~])|\w+|\s|(?::[\w-]+(?:\([^\)]+\))?)/g,

  comma = new RegExp('^' + whitespace + '*,' + whitespace + '*'),
  ridentifier = new RegExp(identifier),
  trim = new RegExp('^' + whitespace + '+|((?:^|[^\\\\])(?:\\\\.)*)' + whitespace + '+$', 'g'),
  combinators = new RegExp('^' + whitespace + '*([>+~]|' + whitespace + ')' + whitespace + '*'),

  rinputs = /^(?:input|select|textarea|button)$/i,
  rheader = /^h\d$/i,

  specialCases,

  pseudos = {
    // Potentially complex pseudos
    'not': mark(function (selector) {
      // Trim the selector passed to compile
      // to avoid treating leading and trailing
      // spaces as combinators
      var input = [],
        results = [],
        compiled = compile(selector.replace(trim, '$1'));

      return compiled[expando] ?
        mark(function (elements, matches, context, xml) {
          var elem,
            unmatched = compiled(elements, null, xml, []),
            i = elements.length;

          // Match elements unmatched by `compiled`
          while (i--) {
            if ((elem = unmatched[i])) {
              elements[i] = !(matches[i] = elem);
            }
          }
        }) :
        function (elem, context, xml) {
          input[0] = elem;
          compiled(input, null, xml, results);
          return !results.pop();
        };
    }),

    'has': mark(function (selector) {
      return function (elem) {
        return hAzzle(selector, elem).length > 0;
      };
    }),

    'contains': mark(function (text) {
      text = text.replace(runescape, funescape);
      return function (elem) {
        return (elem.textContent || elem.innerText || hAzzle.getText(elem)).indexOf(text) > -1;
      };
    }),

    // "Whether an element is represented by a :lang() selector
    // is based solely on the element's language value
    // being equal to the identifier C,
    // or beginning with the identifier C immediately followed by "-".
    // The matching of C against the element's language value is performed case-insensitively.
    // The identifier C does not have to be a valid language name."
    // http://www.w3.org/TR/selectors/#lang-pseudo
    'lang': mark(function (lang) {
      // lang value must be a valid identifier
      if (!ridentifier.test(lang || '')) {
        console.error('unsupported lang: ' + lang);
      }
      lang = lang.replace(runescape, funescape).toLowerCase();
      return function (elem) {
        var elemLang;
        do {
          if ((elemLang = documentIsHTML ?
            elem.lang :
            elem.getAttribute('xml:lang') || elem.getAttribute('lang'))) {

            elemLang = elemLang.toLowerCase();
            return elemLang === lang || elemLang.indexOf(lang + '-') === 0;
          }
        } while ((elem = elem.parentNode) && elem.nodeType === 1);
        return false;
      };
    }),

    // Miscellaneous
    'target': function (elem) {
      var hash = window.location && window.location.hash;
      return hash && hash.slice(1) === elem.id;
    },

    'root': function (elem) {
      return elem === hAzzle.docElem;
    },

    'focus': function (elem) {
      return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
    },

    // Boolean properties
    'enabled': function (elem) {
      return elem.disabled === false;
    },

    'disabled': function (elem) {
      return elem.disabled === true;
    },

    'checked': function (elem) {
      // In CSS3, :checked should return both checked and selected elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      var nodeName = elem.nodeName.toLowerCase();
      return (nodeName === 'input' && !!elem.checked) || (nodeName === 'option' && !!elem.selected);
    },

    'selected': function (elem) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if (elem.parentNode) {
        //REVIEW NEEDED
        console.log('selectedIndex:' + elem.parentNode.selectedIndex);
      }

      return elem.selected === true;
    },

    // Contents
    'empty': function (elem) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
      // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
      //   but not by others (comment: 8; processing instruction: 7; etc.)
      // nodeType < 6 works because attributes (2) do not appear as children
      for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
        if (elem.nodeType < 6) {
          return false;
        }
      }
      return true;
    },

    'parent': function (elem) {
      return !pseudos.empty(elem);
    },

    // Element/input types
    'header': function (elem) {
      return rheader.test(elem.nodeName);
    },

    'input': function (elem) {
      return rinputs.test(elem.nodeName);
    },

    'button': function (elem) {
      var name = elem.nodeName.toLowerCase();
      return name === 'input' && elem.type === 'button' || name === 'button';
    },

    'text': function (elem) {
      var attr;
      return elem.nodeName.toLowerCase() === 'input' &&
        elem.type === 'text' &&

        // Support: IE<8
        // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
        ((attr = elem.getAttribute('type')) === null || attr.toLowerCase() === 'text');
    },

    // Position-in-collection
    'first': createPositionalPseudo(function () {
      return [0];
    }),

    'last': createPositionalPseudo(function (matchIndexes, length) {
      return [length - 1];
    }),

    'eq': createPositionalPseudo(function (matchIndexes, length, argument) {
      return [argument < 0 ? argument + length : argument];
    }),

    'even': createPositionalPseudo(function (matchIndexes, length) {
      var i = 0;
      for (; i < length; i += 2) {
        matchIndexes.push(i);
      }
      return matchIndexes;
    }),

    'odd': createPositionalPseudo(function (matchIndexes, length) {
      var i = 1;
      for (; i < length; i += 2) {
        matchIndexes.push(i);
      }
      return matchIndexes;
    }),

    'lt': createPositionalPseudo(function (matchIndexes, length, argument) {
      var i = argument < 0 ? argument + length : argument;
      for (; --i >= 0;) {
        matchIndexes.push(i);
      }
      return matchIndexes;
    }),

    'gt': createPositionalPseudo(function (matchIndexes, length, argument) {
      var i = argument < 0 ? argument + length : argument;
      for (; ++i < length;) {
        matchIndexes.push(i);
      }
      return matchIndexes;
    })
  };

function mark(fn) {
  fn[expando] = true;
  return fn;
}

/**
 * get nodes
 *
 * @param {string} context
 * @return {Object}
 */

function getNodes(context) {

  var nodes = [doc];

  if (context) { //context can be a node, nodelist, array, document
    if (context instanceof Array) {
      nodes = context;
    } else if (context.length) {
      nodes = toArray(nodes);
    } else if (context.nodeType === 1) {
      nodes = [context];
    }
    //throw error for invalid context?
  }
  // Temporary fix Allways make sure we have a nodes to return
  // else code breaks
  return nodes && nodes;
}

hAzzle.extend({

  relative: {
    '>': {
      dir: 'parentNode',
      first: true
    },
    ' ': {
      dir: 'parentNode'
    },
    '+': {
      dir: 'previousSibling',
      first: true
    },
    '~': {
      dir: 'previousSibling'
    }
  },

  regex: {
    'id': new RegExp('^#(' + identifier + ')'),
    'tag': new RegExp('^(' + identifier + '|[*])'),
    'Class': new RegExp('^\\.(' + identifier + ')'),
    'rel': /^\>|\>|\+|~$/, // BUGGY!!! Not working!!

    'nth': new RegExp('^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' + whitespace +
      '*(even|odd|(([+-]|)(\\d*)n|)' + whitespace + '*(?:([+-]|)' + whitespace +
      '*(\\d+)|))' + whitespace + '*\\)|)', 'i'),
    'attr': /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)\'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\x00-\xa0])+))|)[\x20\t\r\n\f]*\]/,

    'changer': /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i,
    'pseudo': /:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\((('((?:\\.|[^\\'])*)\'|"((?:\\.|[^\\"])*)")|.*)\)|)/,
    'whitespace': new RegExp(whitespace),
  },

  /**
   * Jiesa parser
   *
   * @param {string} selector
   * @param {string|Object|Array} context
   * @return {Object}
   */

  parse: function (selector, context) {

    // Temporary fix
    // Allways make sure we have a selector
    // else code breaks

    if (!selector) {

      return;
    }
    var i = 0,
      pieceStore = [],
      nodes,
      l, piece, piece1, j = 0,
      k,
      chunks, kf;
    // I think this nodes are buggy as well
    nodes = getNodes(context);

    selector = selector.replace(trimspaces, '').replace(special, ' $1');

    // Split the selector before we are looping through
    //when we have only one chunk match returns null
    kf = selector.match(chunky) || [selector];

    // Collect all the chunks, and identify them

    chunks = collector(kf);


    l = chunks.length;

    if (l) {

      // create the node set

      for (; i < l; i++) {

        piece = chunks[i];

        if (!piece.type) {

          hAzzle.error('Invalid Selector: ' + piece.text);
        }

        if (piece.type !== 'whitespace' && chunks[i + 1]) {

          // push all non-descendant selectors into piece store until we hit a space in the selector.

          pieceStore.push(piece);

        } else {

          if (piece.type !== 'whitespace' && piece.type !== 'changer') {

            pieceStore.push(piece);
          }

          // Grab the first piece, as the starting point, then perform the filters on the nodes.

          piece1 = pieceStore.shift();

          // Collect everything

          nodes = Execute(nodes, piece1, context);

          k = pieceStore.length;

          // filter the nodes

          for (; j < k; j++) {

            // Not everyone has a filter :)

            if (Jiesa.filters[pieceStore[j].type]) {

              nodes = filter(nodes, pieceStore[j]);
            }

          }

          // If  any positional pseudos, we have to create them

          if (piece.type === 'changer') {

            nodes = createPositionalPseudo(nodes, piece.text);
          }

          pieceStore = [];
        }
      }
    }
    return nodes;
  },

  getters: {

    /**
     * element by id
     *
     * Try nativly to use getElementById, but
     * if XML or buggy e.g., it fall back to the
     * hard and slow way of doing things
     */

    'id': function (elem, id) {

      // Grab the ID

      id = id.replace('#', '');

      if (documentIsHTML || elem.nodeType === 9) {

        // Check for getElementById bug
        // Support: IE<10

        if (Jiesa.has['bug-GEBI']) {

          // If buggy, we have to let the Iranian take a
          // long walk, and inspect all the DOM nodes

          return byIdRaw(id, elem);
        }
        // Everything good to go...
        //REVIEW NEEDED
        //var m = elem.getElementById(id);
        var m = doc.getElementById(id);
        return m && m.parentNode ? [m] : [];

      } else {

        return byIdRaw(id, elem);
      }
    },

    'Class': function (elem, sel) {

      sel = sel.replace('.', '');

      if (documentIsHTML || elem.nodeType !== 11) {
        return toArray(elem.getElementsByClassName(sel));
      } else {
        // Let the Iranian take a walk
        return IranianWalker(all(elem), 'f', function (e) {
          return Jiesa.filters.Class(e, sel);
        });
      }
    },

    /**
     * elements by tag
     */
    'tag': function (elem, tag) {

      // If getElementsByTagName  are buggy, we fix it!!

      if (Jiesa.has['bug-GEBTN']) {
        var tmp = [],
          i = 0,
          results = elem.getElementsByTagName(tag);

        // Filter out possible comments

        if (tag === '*') {

          while ((elem = results[i++])) {
            if (elem.nodeType === 1) {
              tmp.push(elem);
            }
          }

          return tmp;
        }
        return results;

      } else {

        // If XML doc or document fragment, do a
        // raw grab of the node, because the Iranian don't
        // fit for this

        if (documentIsHTML || elem.nodeType === 11) {

          return byTagRaw(tag, elem) || toArray(elem.getElementsByTagName(tag));

        } else {

          return toArray(elem.getElementsByTagName(tag));
        }
      }
    },

    /**
     * Get the attribute value
     */

    'attr': function (elem, attribute) {
      return getAttribute(elem, attribute) ||
        IranianWalker(all(elem), 'f', function (e) {
          return Jiesa.filters.attr(e, attribute);
        });
    },

    // relative selectors

    'rel': function (elem, sel) {

      if (!elem) {
        return false;
      }

      if (sel === ' ') {
        return elem && elem !== hAzzle.docElem && elem.parentNode;
      }

      // Next Adjacent Selector

      if (sel === '+') {
        return [hAzzle.nextElementSibling(elem)];
      }

      // Child Selector

      if (sel === '>') {

        return IranianWalker(elem.childNodes, 'f', function (e) {
          return e.nodeType === 1;
        });
      }

      // Next Siblings Selector

      if (sel === '~') {
        var children;
        return (elem.parentNode && (children = elem.parentNode.children)) ? IranianWalker(children, 'f', function (e) {
          return Jiesa.filters.rel(e, '~', elem);
        }) : [];
      }
    },

    'pseudo': function (elem, sel) {
      return IranianWalker(all(elem), 'f', function (e) {
        return Jiesa.filters.pseudo(e, sel);
      });
    }
  },

  // and as the name suggests, these filter the nodes to match a selector part

  filters: {

    'id': function (elem, sel) {

      return elem.id && elem.id === sel.replace('#', '');
    },

    'Class': function (elem, sel) {

      // If ClassList are supported by the browser, use it !!

      var className = sel.replace('.', ''),
        cn = elem.className,
        nT = elem.nodeType;

      if (typeof cn === 'string') {
        return Jiesa.has['api-classList'] ? elem.classList.contains(className) :
          nT === 1 && cn && (' ' + className + ' ').replace(Jiesa.whitespace, ' ').indexOf(cn) >= 0;
      } else {
        return typeof elem.getAttribute !== undefined && elem.getAttribute('class') || '';
      }
    },

    'tag': function (elem, sel) {
      return (elem.tagName && elem.tagName.toLowerCase() === sel.toLowerCase());
    },

    'attr': function (elem, sel) {

      /**
       * Mehran!!
       *
       * We could have used our own hAzzle.attr() to grab the
       * attribute, but I think that is slowe. So I creted my
       * own solution.
       */

      var info = Jiesa.regex.attr.exec(sel),
        attr = getAttribute(elem, info[1]);

      if (!info[2] || !attr) {
        return !!attr;
      }

      if (info[2] && info[3]) {

        var value = info[3].replace(/^['"]|['"]$/g, ''),
          operator = info[2];

        attr += '';

        /**
         * Special attribute - Regex Attribute Selector
         * It gives the ability to match attributes with a regexp.
         *
         *  hAzzle('div[id/= [ RegEX ] ')
         */

        if (value && operator === '/=') {

          var modifiers = value.match(/\s(\w+)$/) || ['', ''];
          value = value.replace(/\\/g, '\\\\').replace(modifiers[0], '');
          return RegExp(value, modifiers[1]).test(attr);
        }

        return value && operator === '==' ? attr === value :
          operator === '=' ? attr === value :
          operator === '!=' ? attr !== value :
          operator === '^=' ? attr.indexOf(value) === 0 :
          operator === '*=' ? attr.indexOf(value) > -1 :
          operator === '$=' ? attr.slice(-value.length) === value :
          operator === '~=' ? (' ' + attr + ' ').indexOf(value) > -1 :
          operator === '|=' ? attr === value || attr.slice(0, value.length + 1) === value + '-' :
          false;

      }
      return false;
    },

    'rel': function (elem, sel, relElem) {

      if (sel === '+') {
        var prev = elem.previousElementSibling || elem.previousSibling;
        while (prev && prev.nodeType != 1) {
          prev = prev.previousSibling;


        }
        return prev === relElem;
      }

      if (sel === '~') {

        return elem !== relElem && elem.parentNode === relElem.parentNode;
      }

      if (sel === '>') {
        return elem.parentNode === relElem;
      }



      return false;
    },
    'pseudo': function (elem, sel) {
      var pseudo = PseudoCache[sel] ? PseudoCache[sel] : PseudoCache[sel] = sel.replace(Jiesa.regex.pseudo, '$1'),
        info = PseudoInfoCache[sel] ? PseudoInfoCache[sel] : PseudoInfoCache[sel] = sel.replace(Jiesa.regex.pseudo, '$2');
      return Jiesa.pseudo_filters[pseudo](elem, info);
    }

  },


}, Jiesa);

function IranianWalker(nodes, mode, fn) {
  if (nodes) {
    var i = 0,
      ret = [],
      l = nodes.length,
      result;

    var callfn = (function (nodes) {
      return function (i) {
        return fn.call(nodes, nodes[i], i, nodes);
      };
    })(nodes);

    for (; i < l; i++) {

      result = callfn(i);
      switch (mode) {
      case 'f':
        if (result) ret.push(nodes[i]);
        break;
      case 'c':
        ret = ret.concat(result);
        break;
      case 'm':
        ret.push(result);
      }
    }

    return ret;
  }
}
//identify a chunk. Is it a class/id/tag etc?

function identify(chunk) {

  var type;

  /**
   * Mehran!!
   *
   * Dirty fix to solve the nth problem with
   * relative attributes. Need to find a better
   * solution for this. Maybe Jiesa solution
   * where they filter on 'child'
   */
  var reg = Jiesa.regex;

  if (reg.nth.test(chunk)) {
    return 'pseudo';
  }

  for (type in Jiesa.regex) {

    if (Jiesa.regex[type].test(chunk)) return type;
  }
  return false;
}

//just to prevent rewriting over and over...
function all(elem) {

  return elem.all ? elem.all : elem.getElementsByTagName('*');
}

/**
 * Mehran!
 *
 * I had to do it the ugly way, check if this is an fast
 * solution. If not, speed it up
 *
 */
function byTagRaw(tag, elem) {
  var any = tag === '*',
    element = elem,
    elements = [],
    next = element.firstChild;

  if (!any) {
    tag = tag.toUpperCase();
  }

  while ((element = next)) {
    if (element.tagName > '@' && (any || element.tagName.toUpperCase() == tag)) {
      elements[elements.length] = element;
    }
    if ((next = element.firstChild || element.nextSibling)) {
      continue;
    }
    while (!next && (element = element.parentNode) && element !== elem) {
      next = element.nextSibling;
    }
  }
  return elements;
}

// The hard and brutal way to collect ID nodes

function byIdRaw(id, elem) {
  return IranianWalker(all(elem), 'f', function (el) {
    return getAttribute(el, 'id') === id;
  });
}

// Collect attributes

function getAttribute(elem, attribute) {

  // Set document vars if needed

  if ((elem.ownerDocument || elem) !== doc) {
    doc = hAzzle.setDocument(elem);
  }

  // Lower case are always a good thing !!

  attribute = attribute.toLowerCase();

  if (typeof elem[attribute] === 'object') {
    return elem.attributes[attribute] &&
      elem.attributes[attribute].value || '';
  }
  return (
    attribute === 'type' ? elem.getAttribute(attribute) || '' :
    boolElem[attribute] ? elem.getAttribute(attribute, 2) || '' :
    boolAttr[attribute] ? elem.getAttribute(attribute) ? attribute : 'false' :

    // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies

    ((elem = elem.getAttributeNode(attribute)) && elem.value) || '');
}

function filter(nodes, pieceStore) {

  var i = 0,
    ret = [],
    l = nodes.length,
    fC, elem;

  for (; i < l; i++) {
    elem = nodes[i];

    fC = filterCache.cache(elem);

    if (!fC) {

      var a = Jiesa.filters[pieceStore.type](elem, pieceStore.text);

      if (a) {
        ret.push(elem);
      }
      exeCache.cache(nodes[i] + ' ', ret);
    }
  }

  return ret;
}

/**
 * Collect, and identify all selectors.
 *
 * @param {Object} nodes
 * @return {Object}
 *
 */

function collector(nodes) {

  var i = 0,
    ret = [],
    l = nodes.length,
    chunk, elem;

  for (; i < l; i++) {

    elem = nodes[i];
    chunk = chunkCache.cache(elem);

    if (!chunk) {
      ret.push({
        text: nodes[i],
        type: identify(elem)
      });

      // Cache the 'chunk'
      chunk = chunkCache.cache(elem, ret);
    }
  }

  return ret;
}

function Execute(nodes, piece, context) {

  var i = 0,
    ret = [],
    l = nodes.length,
    exe;

  for (; i < l; i++) {

    exe = exeCache.cache(nodes[i] + '');

    if (!exe) {
      ret = exeCache.cache(nodes[i] + '', ret.concat(Jiesa.getters[piece.type](nodes[i], piece.text, context)));
    }
  }

  return ret;
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo(fn) {
  return mark(function (argument) {
    argument = +argument;
    return mark(function (elements, matches) {
      var j,
        matchIndexes = fn([], elements.length, argument),
        i = matchIndexes.length;

      // Match elements found at the specified indexes
      while (i--) {
        if (elements[(j = matchIndexes[i])]) {
          elements[j] = !(matches[j] = elements[j]);
        }
      }
    });
  });
}

var runescape = new RegExp('\\\\([\\da-f]{1,6}' + whitespace + '?|(' + whitespace + ')|.)', 'ig'),

  funescape = function (_, escaped, escapedWhitespace) {
    var high = '0x' + escaped - 0x10000;
    return high !== high || escapedWhitespace ?
      escaped :
      high < 0 ?
      // BMP codepoint
      String.fromCharCode(high + 0x10000) :
      // Supplemental Plane codepoint (surrogate pair)
      String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
  },

  attributes = '\\[' + whitespace + '*(' + identifier + ')(?:' + whitespace +
  // Operator (capture 2)
  '*([*^$|!~]?=)' + whitespace +
  // 'Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]'
  '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|\"((?:\\\\.|[^\\\\\"])*)\"|(' + identifier + '))|)' + whitespace +
  '*\\]',

  rpseudo = new RegExp(':(' + identifier + ')(?:\\((' +
    // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
    // 1. quoted (capture 3; capture 4 or capture 5)
    '(\'((?:\\\\.|[^\\\\\'])*)\'|\"((?:\\\\.|[^\\\\\"])*)\")|' +
    // 2. simple (capture 6)
    '((?:\\\\.|[^\\\\()[\\]]|' + attributes + ')*)|' +
    // 3. anything else (capture 2)
    '.*' +
    ')\\)|)'),

  outermostContext,
  rsibling = /[+~]/,
  dirruns = 0,
  done = 0;

function testContext(context) {
  return context && typeof context.getElementsByTagName !== 'undefined' && context;
}

specialCases = {
  'attr': function (rgxResult) {
    rgxResult[1] = rgxResult[1].replace(runescape, funescape);

    // Move the given value to rgxResult[3] whether quoted or unquoted
    rgxResult[3] = (rgxResult[3] || rgxResult[4] || rgxResult[5] || '').replace(runescape, funescape);

    if (rgxResult[2] === '~=') {
      rgxResult[3] = ' ' + rgxResult[3] + ' ';
    }

    return rgxResult.slice(0, 4);
  },
  'child': function (rgxResult) {
    /* matches from matchExpr['CHILD']
        1 type (only|nth|...)
        2 what (child|of-type)
        3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
        4 xn-component of xn+y argument ([+-]?\d*n|)
        5 sign of xn-component
        6 x of xn-component
        7 sign of y-component
        8 y of y-component
    */
    rgxResult[1] = rgxResult[1].toLowerCase();

    if (rgxResult[1].slice(0, 3) === 'nth') {
      // nth-* requires argument
      if (!rgxResult[3]) {
        throw new Error('Syntax error, unrecognized expression: ' + rgxResult[0]);
      }

      // numeric x and y parameters for Expr.filter.CHILD
      // remember that false/true cast respectively to 0/1
      rgxResult[4] = +(rgxResult[4] ? rgxResult[5] + (rgxResult[6] || 1) : 2 * (rgxResult[3] === 'even' || rgxResult[3] === 'odd'));
      rgxResult[5] = +((rgxResult[7] + rgxResult[8]) || rgxResult[3] === 'odd');

      // other types prohibit arguments
    } else if (rgxResult[3]) {
      throw new Error('Syntax error, unrecognized expression: ' + rgxResult[0]);
    }

    return rgxResult;
  },
  'pseudo': function (rgxResult) {
    var excess,
      unquoted = !rgxResult[6] && rgxResult[2];

    if (Jiesa.regex.nth.test(rgxResult[0])) {
      return null;
    }

    // Accept quoted arguments as-is
    if (rgxResult[3]) {
      rgxResult[2] = rgxResult[4] || rgxResult[5] || '';

      // Strip excess characters from unquoted arguments
    } else if (unquoted && rpseudo.test(unquoted) &&
      // Get excess from tokenize (recursively)
      (excess = tokenize(unquoted, true)) &&
      // advance to the next closing parenthesis
      (excess = unquoted.indexOf(')', unquoted.length - excess) - unquoted.length)) {

      // excess is a negative index
      rgxResult[0] = rgxResult[0].slice(0, excess);
      rgxResult[2] = unquoted.slice(0, excess);
    }

    // Return only captures needed by the pseudo filter method (type and argument)
    return rgxResult.slice(0, 3);
  }
};

function tokenize(selector, parseOnly) {
  var result, rgxResult, tokens, type,
    parsed, groups,
    cached = tokenCache.cache(selector + '');

  if (cached) {
    return parseOnly ? 0 : cached.slice(0);
  }

  parsed = selector;
  groups = [];

  while (parsed) {

    // Comma and first run
    if (!result || (rgxResult = comma.exec(parsed))) {
      if (rgxResult) {
        // Don't consume trailing commas as valid
        parsed = parsed.slice(rgxResult[0].length) || parsed;
      }
      groups.push((tokens = []));
    }

    result = false;

    if ((rgxResult = combinators.exec(parsed))) {
      result = rgxResult.shift();
      tokens.push({
        value: result,
        type: rgxResult[0].replace(trim, ' ')
      });
      parsed = parsed.slice(result.length);
    }

    for (type in Jiesa.regex) {

      rgxResult = Jiesa.regex[type].exec(parsed);

      if (rgxResult && specialCases[type]) {
        rgxResult = specialCases[type](rgxResult);
      }

      if (rgxResult) {

        result = rgxResult.shift();

        tokens.push({
          value: result,
          type: type,
          matches: rgxResult
        });

        parsed = parsed.slice(result.length);
      }
    }

    if (!result) {
      break;
    }
  }

  if (parseOnly) {
    return parsed.length;
  } else if (parsed) {
    throw new Error('Syntax error, unrecognized selector: ' + selector);
  } else {
    tokenCache.cache(selector, groups);
    return groups.slice(0);
  }
}

function toSelector(tokens) {
  var i = 0,
    len = tokens.length,
    selector = '';
  for (; i < len; i++) {
    selector += tokens[i].value;
  }
  return selector;
}

function elementMatcher(matchers) {
  return matchers.length > 1 ?
    function (elem, context, xml) {
      var i = matchers.length;
      while (i--) {
        if (!matchers[i](elem, context, xml)) {
          return false;
        }
      }
      return true;
    } :
    matchers[0];
}

//REVIEW needed
function multipleContexts(selector, contexts, results) {
  var i = 0,
    len = contexts.length;
  for (; i < len; i++) {
    //REVIEW NEEDED
    hAzzle(selector, contexts[i], results);
  }
  return results;
}

function condense(unmatched, map, filter, context, xml) {
  var elem,
    newUnmatched = [],
    i = 0,
    len = unmatched.length,
    mapped = map !== null;

  for (; i < len; i++) {
    if ((elem = unmatched[i])) {
      if (!filter || filter(elem, context, xml)) {
        newUnmatched.push(elem);
        if (mapped) {
          map.push(i);
        }
      }
    }
  }

  return newUnmatched;
}

function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
  if (postFilter && !postFilter[expando]) {
    postFilter = setMatcher(postFilter);
  }
  if (postFinder && !postFinder[expando]) {
    postFinder = setMatcher(postFinder, postSelector);
  }
  return mark(function (elements, results, context, xml) {
    var temp, i, elem,
      preMap = [],
      postMap = [],
      preexisting = results.length,

      // Get initial elements from elements or context
      elems = elements || multipleContexts(selector || '*', context.nodeType ? [context] : context, []),

      // Prefilter to get matcher input, preserving a map for elements-results synchronization
      matcherIn = preFilter && (elements || !selector) ?
      condense(elems, preMap, preFilter, context, xml) :
      elems,

      matcherOut = matcher ?
      // If we have a postFinder, or filtered elements, or non-elements postFilter or preexisting results,
      postFinder || (elements ? preFilter : preexisting || postFilter) ?

      // ...intermediate processing is necessary
      [] :

      // ...otherwise use results directly
      results :
      matcherIn;

    // Find primary matches
    if (matcher) {
      matcher(matcherIn, matcherOut, context, xml);
    }

    // Apply postFilter
    if (postFilter) {
      temp = condense(matcherOut, postMap);
      postFilter(temp, [], context, xml);

      // Un-match failing elements by moving them back to matcherIn
      i = temp.length;
      while (i--) {
        if ((elem = temp[i])) {
          matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
        }
      }
    }

    if (elements) {
      if (postFinder || preFilter) {
        if (postFinder) {
          // Get the final matcherOut by condensing this intermediate into postFinder contexts
          temp = [];
          i = matcherOut.length;
          while (i--) {
            if ((elem = matcherOut[i])) {
              // Restore matcherIn since elem is not yet a final match
              temp.push((matcherIn[i] = elem));
            }
          }
          postFinder(null, (matcherOut = []), temp, xml);
        }

        // Move matched elements from elements to results to keep them synchronized
        i = matcherOut.length;
        while (i--) {
          if ((elem = matcherOut[i]) &&
            (temp = postFinder ? hAzzle.inArray(elements, elem) : preMap[i]) > -1) {

            elements[temp] = !(results[temp] = elem);
          }
        }
      }

      // Add elements to results, through postFinder if defined
    } else {
      matcherOut = condense(
        matcherOut === results ?
        matcherOut.splice(preexisting, matcherOut.length) :
        matcherOut
      );
      if (postFinder) {
        postFinder(null, results, matcherOut, xml);
      } else {
        push.apply(results, matcherOut);
      }
    }
  });
}

function addCombinator(matcher, combinator, base) {
  var dir = combinator.dir,
    checkNonElements = base && dir === 'parentNode',
    doneName = done++;

  return combinator.first ?
    // Check against closest ancestor/preceding element
    function (elem, context, xml) {
      while ((elem = elem[dir])) {
        if (elem.nodeType === 1 || checkNonElements) {
          return matcher(elem, context, xml);
        }
      }
    } :

    // Check against all ancestor/preceding elements
    function (elem, context, xml) {
      var oldCache, outerCache,
        newCache = [dirruns, doneName];

      // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
      if (xml) {
        while ((elem = elem[dir])) {
          if (elem.nodeType === 1 || checkNonElements) {
            if (matcher(elem, context, xml)) {
              return true;
            }
          }
        }
      } else {
        while ((elem = elem[dir])) {
          if (elem.nodeType === 1 || checkNonElements) {
            outerCache = elem[expando] || (elem[expando] = {});
            if ((oldCache = outerCache[dir]) &&
              oldCache[0] === dirruns && oldCache[1] === doneName) {

              // Assign to newCache so results back-propagate to previous elements
              return (newCache[2] = oldCache[2]);
            } else {
              // Reuse newcache so results back-propagate to previous elements
              outerCache[dir] = newCache;

              // A match means we're done; a fail means we have to keep checking
              if ((newCache[2] = matcher(elem, context, xml))) {
                return true;
              }
            }
          }
        }
      }
    };
}

function matcherFromTokens(tokens) {
  var checkContext, matcher, j,
    len = tokens.length,
    leadingRelative = Jiesa.relative[tokens[0].type],
    implicitRelative = leadingRelative || Jiesa.relative[' '],
    i = leadingRelative ? 1 : 0,

    // The foundational matcher ensures that elements are reachable from top-level context(s)
    matchContext = addCombinator(function (elem) {
      return elem === checkContext;
    }, implicitRelative, true),
    matchAnyContext = addCombinator(function (elem) {
      return hAzzle.inArray(checkContext, elem) > -1;
    }, implicitRelative, true),
    matchers = [

      function (elem, context, xml) {
        return (!leadingRelative && (xml || context !== outermostContext)) || (
          (checkContext = context).nodeType ?
          matchContext(elem, context, xml) :
          matchAnyContext(elem, context, xml));
      }
    ];

  for (; i < len; i++) {
    if ((matcher = Jiesa.relative[tokens[i].type]) || (matcher = Jiesa.relative[tokens[i].value])) {
      matchers = [addCombinator(elementMatcher(matchers), matcher)];
    } else {

      matcher = Jiesa.filters2[tokens[i].type].apply(null, tokens[i].matches);

      // Return special upon seeing a positional matcher
      if (matcher[expando]) {
        // Find the next relative operator (if any) for proper handling
        j = ++i;
        for (; j < len; j++) {
          if (Jiesa.relative[tokens[j].type]) {
            break;
          }
        }
        return setMatcher(
          i > 1 && elementMatcher(matchers),
          i > 1 && toSelector(
            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
            tokens.slice(0, i - 1).concat({
              value: tokens[i - 2].type === ' ' ? '*' : ''
            })
          ).replace(trim, '$1'),
          matcher,
          i < j && matcherFromTokens(tokens.slice(i, j)),
          j < len && matcherFromTokens((tokens = tokens.slice(j))),
          j < len && toSelector(tokens)
        );
      }
      matchers.push(matcher);
    }
  }

  return elementMatcher(matchers);
}

function matcherFromGroupMatchers(elementMatchers, setMatchers) {
  var bySet = setMatchers.length > 0,
    byElement = elementMatchers.length > 0,
    superMatcher = function (elements, context, xml, results, outermost) {
      var elem, j, matcher,
        matchedCount = 0,
        i = '0',
        unmatched = elements && [],
        setMatched = [],
        contextBackup = outermostContext,
        // We must always have either elements elements or outermost context
        elems = elements || byElement && Jiesa.getters.tag(outermost, '*'),
        // Use integer dirruns iff this is the outermost matcher
        dirrunsUnique = (dirruns += contextBackup === null ? 1 : Math.random() || 0.1),
        len = elems.length;

      if (outermost) {
        outermostContext = context !== doc && context;
      }

      // Add elements passing elementMatchers directly to results
      // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
      // Support: IE<9, Safari
      // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
      for (; i !== len && (elem = elems[i]) !== null; i++) {
        if (byElement && elem) {
          j = 0;
          while ((matcher = elementMatchers[j++])) {
            if (matcher(elem, context, xml)) {
              results.push(elem);
              break;
            }
          }
          if (outermost) {
            dirruns = dirrunsUnique;
          }
        }

        // Track unmatched elements for set filters
        if (bySet) {
          // They will have gone through all possible matchers
          if ((elem = !matcher && elem)) {
            matchedCount--;
          }

          // Lengthen the array for every element, matched or not
          if (elements) {
            unmatched.push(elem);
          }
        }
      }

      // Apply set filters to unmatched elements
      matchedCount += i;
      if (bySet && i !== matchedCount) {
        j = 0;
        while ((matcher = setMatchers[j++])) {
          matcher(unmatched, setMatched, context, xml);
        }

        if (elements) {
          // Reintegrate element matches to eliminate the need for sorting
          if (matchedCount > 0) {
            while (i--) {
              if (!(unmatched[i] || setMatched[i])) {
                setMatched[i] = pop.call(results);
              }
            }
          }

          // Discard index placeholder values to get only actual matches
          setMatched = condense(setMatched);
        }

        // Add matches to results
        push.apply(results, setMatched);

        // Seedless set matches succeeding multiple successful matchers stipulate sorting
        if (outermost && !elements && setMatched.length > 0 &&
          (matchedCount + setMatchers.length) > 1) {

          hAzzle.unique(results);
        }
      }

      // Override manipulation of globals by nested matchers
      if (outermost) {
        dirruns = dirrunsUnique;
        outermostContext = contextBackup;
      }

      return unmatched;
    };

  return bySet ?
    mark(superMatcher) :
    superMatcher;
}

function compile(selector, match /* Internal Use Only */ ) {
  var i,
    setMatchers = [],
    elementMatchers = [],
    cached = compilerCache.cache(selector + '');

  if (!cached) {
    // Generate a function of recursive functions that can be used to check each element
    if (!match) {
      match = tokenize(selector);
    }
    i = match.length;
    while (i--) {
      cached = matcherFromTokens(match[i]);
      if (cached[expando]) {
        setMatchers.push(cached);
      } else {
        elementMatchers.push(cached);
      }
    }

    // Cache the compiled function
    cached = matcherFromGroupMatchers(elementMatchers, setMatchers);

    compilerCache.cache(selector, cached);

    // Save selector and tokenization
    cached.selector = selector;
  }
  return cached;
}

/**
 * A low-level selection function that works with Jiesa's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Jiesa.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [elements] A set of elements to match against
 */
function parse(selector, context, results, elements) {
  var i, tokens, token, type, findfn,
    compiled = typeof selector === 'function' && selector,
    tokenized = !elements && tokenize((selector = compiled.selector || selector));

  results = results || [];

  // Try to minimize operations if there is no elements and only one group
  if (tokenized.length === 1) {

    // Take a shortcut and set the context if the root selector is an ID
    tokens = tokenized[0] = tokenized[0].slice(0);
    if (tokens.length > 2 && (token = tokens[0]).type === 'ID' &&
      !Jiesa.has['bug-GEBI'] && context.nodeType === 9 && documentIsHTML &&
      Jiesa.relative[tokens[1].type]) {

      context = (Jiesa.getters.id(context, token.matches[0].replace(runescape, funescape)) || [])[0];
      if (!context) {
        return results;

        // Precompiled matchers will still verify ancestry, so step up a level
      } else if (compiled) {
        context = context.parentNode;
      }

      selector = selector.slice(tokens.shift().value.length);
    }

    // Fetch a elements set for right-to-left matching
    i = Jiesa.regex.changer.test(selector) ? 0 : tokens.length;
    while (i--) {
      token = tokens[i];

      // Abort if we hit a combinator
      if (Jiesa.relative[(type = token.type)]) {
        break;
      }
      if ((findfn = Jiesa.getters[type])) {
        // Search, expanding context for leading sibling combinators
        if ((elements = findfn(
          rsibling.test(tokens[0].type) && testContext(context.parentNode) || context,
          token.matches[0].replace(runescape, funescape)
        ))) {

          // If elements is empty or no tokens remain, we can return early
          tokens.splice(i, 1);
          selector = elements.length && toSelector(tokens);
          if (!selector) {
            push.apply(results, elements);
            return results;
          }

          break;
        }
      }
    }
  }

  // Compile and execute a filtering function if one is not provided
  // Provide `tokenized` to avoid retokenization if we modified the selector above

  var ctx = rsibling.test(selector) && testContext(context.parentNode) || context,
    fn;

  if (!compiled) {
    fn = compile(selector, tokenized);

    fn(elements, context, !documentIsHTML, results, ctx);
  }

  return results;
}

Jiesa.filters2 = {

  'tag': function (nodeNameSelector) {
    var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
    return nodeNameSelector === '*' ?
      function () {
        return true;
      } :
      function (elem) {
        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      };
  },

  'Class': function (className) {
    var pattern = classCache.cache[className + ''];

    return pattern ||
      (pattern = new RegExp('(^|' + whitespace + ')' + className + '(' + whitespace + '|$)')) &&
      classCache.cache(className, function (elem) {
        return pattern.test(typeof elem.className === 'string' && elem.className || typeof elem.getAttribute !== 'undefined' && elem.getAttribute('class') || '');
      });
  },

  'attr': function (name, operator, check) {
    return function (elem) {
      var result = hAzzle.attr(elem, name);

      if (result === null) {
        return operator === '!=';
      }
      if (!operator) {
        return true;
      }

      result += '';

      return operator === '=' ? result === check :
        operator === '!=' ? result !== check :
        operator === '^=' ? check && result.indexOf(check) === 0 :
        operator === '*=' ? check && result.indexOf(check) > -1 :
        operator === '$=' ? check && result.slice(-check.length) === check :
        operator === '~=' ? (' ' + result + ' ').indexOf(check) > -1 :
        operator === '|=' ? result === check || result.slice(0, check.length + 1) === check + '-' :
        false;
    };
  },

  'nth': function (type, what, argument, first, last) {
    var simple = type.slice(0, 3) !== 'nth',
      forward = type.slice(-4) !== 'last',
      ofType = what === 'of-type';

    return first === 1 && last === 0 ?

      // Shortcut for :nth-*(n)
      function (elem) {
        return !!elem.parentNode;
      } :

      function (elem, context, xml) {
        var cache, outerCache, node, diff, nodeIndex, start,
          dir = simple !== forward ? 'nextSibling' : 'previousSibling',
          parent = elem.parentNode,
          name = ofType && elem.nodeName.toLowerCase(),
          useCache = !xml && !ofType;

        if (parent) {

          // :(first|last|only)-(child|of-type)
          if (simple) {
            while (dir) {
              node = elem;
              while ((node = node[dir])) {
                if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                  return false;
                }
              }
              // Reverse direction for :only-* (if we haven't yet done so)
              start = dir = type === 'only' && !start && 'nextSibling';
            }
            return true;
          }

          start = [forward ? parent.firstChild : parent.lastChild];

          // non-xml :nth-child(...) stores cache data on `parent`
          if (forward && useCache) {
            // Seek `elem` from a previously-cached index
            outerCache = parent[expando] || (parent[expando] = {});
            cache = outerCache[type] || [];
            nodeIndex = cache[0] === dirruns && cache[1];
            diff = cache[0] === dirruns && cache[2];
            node = nodeIndex && parent.childNodes[nodeIndex];

            while ((node = ++nodeIndex && node && node[dir] ||

              // Fallback to seeking `elem` from the start
              (diff = nodeIndex = 0) || start.pop())) {

              // When found, cache indexes on `parent` and break
              if (node.nodeType === 1 && ++diff && node === elem) {
                outerCache[type] = [dirruns, nodeIndex, diff];
                break;
              }
            }

            // Use previously-cached element index if available
          } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
            diff = cache[1];

            // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
          } else {
            // Use the same loop as above to seek `elem` from the start
            while ((node = ++nodeIndex && node && node[dir] ||
              (diff = nodeIndex = 0) || start.pop())) {

              if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                // Cache the index of each encountered element
                if (useCache) {
                  (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
                }

                if (node === elem) {
                  break;
                }
              }
            }
          }

          // Incorporate the offset, then check against cycle size
          diff -= last;
          return diff === first || (diff % first === 0 && diff / first >= 0);
        }
      };
  },

  'pseudo': function (pseudo, argument) {
    // pseudo-class names are case-insensitive
    // http://www.w3.org/TR/selectors/#pseudo-classes
    // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
    // Remember that setFilters inherits from pseudos
    var args,
      fn = null; //Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
    //console.error('unsupported pseudo: ' + pseudo);

    // The user may use createPseudo to indicate that
    // arguments are needed to create the filter function
    // just as Jiesa does
    if (fn[expando]) {
      return fn(argument);
    }

    // But maintain support for old signatures
    if (fn.length > 1) {
      args = [pseudo, pseudo, '', argument];
      return null;
      //REVIEW NEEDED
      /*Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
        mark(function (elements, matches) {
          var idx,
            matched = fn(elements, argument),
            i = matched.length;
          while (i--) {
            idx = hAzzle.inArray(elements, matched[i]);
            elements[idx] = !(matches[idx] = matched[i]);
          }
        }) :
        function (elem) {
          return fn(elem, 0, args);
        };*/
    }

    return fn;
  }
};

hAzzle.tokenize = tokenize;
hAzzle.parse = parse;
