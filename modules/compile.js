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

  // Verify if the doc are HTML

  documentIsHTML = hAzzle.documentIsHTML,

  // Short-hand for Jiesa

  Jiesa = hAzzle.Jiesa,

  // Mehran! You benchmark this!
  // Safer solution, but slower I guess

  toArray = hAzzle.makeArray,

  // regEx are slow, so let us do it
  // differently then Sizzle

  boolElem = {
    action: 2,
    cite: 2,
    codebase: 2,
    data: 2,
    href: 2,
    longdesc: 2,
    lowsrc: 2,
    src: 2,
    usemap: 2
  },

  booleans = {
    checked: 1,
    disabled: 1,
    async: 1,
    autofocus: 1,
    aitoplay: 1,
    controls: 1,
    defer: 1,
    hidden: 1,
    loop: 1,
    multiple: 1,
    open: 1,
    required: 1,
    scoped: 1,
    ismap: 1,
    readonly: 1,
    selected: 1
  },

  PseudoCache = {},
  PseudoInfoCache = {},
  createCache = function createCache() {
    var keys = [];

    function cache(key, value) {
      if (keys.push(key + ' ') > 70) {
        delete cache[keys.shift()];
      }
      cache[key + ' '] = value;
      return value;
    }
    return cache;
  },
  chunkCache = createCache(),
  exeCache = createCache(),
  filterCache = createCache(),

  /**
   * Special regex. NOTE! This is not part of the public Jiesa Object
   */

  trimspaces = /^\s*|\s*$/g,
  whitespace = '[\\x20\\t\\r\\n\\f]',
  special = /\s?([\+~\>])\s?/g,
  identifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
  chunky = /(?:#[\w\d_-]+)|(?:\.[\w\d_-]+)|(?:\[(\w+(?:-\w+)?)(?:([\$\*\^!\|~\/]?=)(.+?))?\])|(?:[\>\+~])|\w+|\s|(?::[\w-]+(?:\([^\)]+\))?)/g,

  tokenCache = hAzzle.createCache(),
  comma = new RegExp('^' + whitespace + '*,' + whitespace + '*'),
  trim = new RegExp('^' + whitespace + '+|((?:^|[^\\\\])(?:\\\\.)*)' + whitespace + '+$', 'g'),
  combinators = new RegExp('^' + whitespace + '*([>+~]|' + whitespace + ')' + whitespace + '*'),
  specialCases;

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

  regex: {
    'id': new RegExp('^#(' + identifier + ')'),
    'tag': new RegExp('^(' + identifier + '|[*])'),
    'Class': new RegExp('^\\.(' + identifier + ')'),
    'rel': /^\>|\>|\+|~$/, // BUGGY!!! Not working!!

    'nth': new RegExp('^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' + whitespace +
      '*(even|odd|(([+-]|)(\\d*)n|)' + whitespace + '*(?:([+-]|)' + whitespace +
      '*(\\d+)|))' + whitespace + '*\\)|)', 'i'),
    'attr': /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)(?:[\x20\t\r\n\f]*([*^$|!~]?=)[\x20\t\r\n\f]*(?:'((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)"|((?:\\.|[\w-]|[^\x00-\xa0])+))|)[\x20\t\r\n\f]*\]/,

    'changer': /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i,
    'pseudo': /:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\((('((?:\\.|[^\\'])*)'|"((?:\\.|[^\\"])*)")|.*)\)|)/,
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

      if (hAzzle.documentIsHTML || elem.nodeType === 9) {

        // Check for getElementById bug
        // Support: IE<10

        if (Jiesa.has['bug-GEBI']) {

          // If buggy, we have to let the Iranian take a
          // long walk, and inspect all the DOM nodes

          return byIdRaw(id, elem);
        }
        // Everything good to go...
        var m = elem.getElementById(id);
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
   * solution for this. Maybe Sizzle solution
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

  if ((elem.ownerDocument || elem) !== document) {
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
    booleans[attribute] ? elem.getAttribute(attribute) ? attribute : 'false' :

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

    fC = filterCache[elem];

    if (!fC) {

      var a = Jiesa.filters[pieceStore.type](elem, pieceStore.text);

      if (a) {
        ret.push(elem);
      }
      exeCache(nodes[i] + ' ', ret);
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
    chunk = chunkCache[elem];

    if (!chunk) {
      ret.push({
        text: nodes[i],
        type: identify(elem)
      });

      // Cache the 'chunk'
      chunk = chunkCache(elem, ret);
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

    exe = exeCache[nodes[i] + ' '];

    if (!exe) {
      ret = exeCache(nodes[i] + ' ', ret.concat(Jiesa.getters[piece.type](nodes[i], piece.text, context)));
    }
  }

  return ret;
}

function createPositionalPseudo(nodes, sel) {
  var inf = Jiesa.regex.changer.exec(sel);
  return Jiesa.changers[inf[1]](nodes, inf[2]);
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

  pseudos = ':(' + identifier + ')(?:\\((' +
  // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
  // 1. quoted (capture 3; capture 4 or capture 5)
  '(\'((?:\\\\.|[^\\\\\'])*)\'|\"((?:\\\\.|[^\\\\\"])*)\")|' +
  // 2. simple (capture 6)
  '((?:\\\\.|[^\\\\()[\\]]|' + attributes + ')*)|' +
  // 3. anything else (capture 2)
  '.*' +
  ')\\)|)',

  rpseudo = new RegExp(pseudos);

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

hAzzle.tokenize = tokenize;