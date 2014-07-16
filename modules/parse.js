/** 
 * Generate HTML from CSS selectors
 
 A FEW EXAMPLES:
 
  #ID
  ---
  
  hAzzle.html('div#hello');  

  RESULT: 
  
  <div id="hello"> <div>

  #CLASS
  ------
  
  hAzzle.html('div.hello');  

  RESULT: 
  
  <div class="hello"> <div>

  #ID AND CLASS
  ------
  
  hAzzle.html('div#hello.test');  

  RESULT: 
  
  <div id="hello" class="test"> <div>

  DIV AND A-TAG
  -------------

 hAzzle.html('div a');
 
  RESULT:  
  
  <div>
    <a></a>
</div>


  HTML
  -------------

 hAzzle.html('div[innerHTML=FOO]')
  
  RESULT:
  
  <div> FOO </div>


  hAzzle.html('div span + a');
  

 IMAGES
  -------------

 hAzzle.html('img src="/test.png"')
  
  RESULT:
  
  <img src="/test.png"> FOO </img>


 SETTING ATTRIBUTES:
  -------------
 hAzzle.html('input[type=checkbox][checked]');

**/
var win = this,
    doc = win,

    chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,

    white = /^\s+$/,

    trimspaces = /^\s*|\s*$/g,

    matchExpr = {

        ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
        CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?![^[\]]+])/g,
        NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
        ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
        TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
        CLONE: /\:(\d+)(?=$|[:[])/,
        COMBINATOR: /^[>~+]$/
    },

    cache = {},

    tagTypes = ['ID', 'CLASS', 'NAME', 'ATTR'],

    expr = {

        attr: {
            'for': 'htmlFor',
            'class': 'className',
            'html': 'innerHTML'
        },

        filter: {

            'ID': function (match, node) {
                node.id = match[1];
            },
            'CLASS': function (match, node) {
                var cls = node.className.replace(white, '');
                node.className = cls ? cls + ' ' + match[1] : match[1];
            },
            'NAME': function (match, node) {
                node.name = match[1];
            },
            'ATTR': function (match, node) {

                var attr = match[1],
                    val = match[4] || true;

                if (val === true || attr === 'innerHTML' || expr.attr.hasOwnProperty(attr)) {

                    node[expr.attr[attr] || attr] = val;

                } else {

                    node.setAttribute(attr, val);
                }

            }
        }
    };


hAzzle.html = function (selector) {

    // Remove whitespace

    selector = selector.replace(trimspaces, '')

    // Return if the selector are cached

    if (selector in cache) {

        return cache[selector].cloneNode(true).childNodes;
    }

    var nodes = [],
        fragment = doc.createDocumentFragment(),
        children,
        prevChildren,
        curSelector,

        /** Keep track of how many duplicates / clones of an tag we
         * are creating.
         *
         * E.g hAzzle.html('div:49')
         *
         * Clones will be set to 49.
         */

        Clones = 1,
        Parts = 0,
        isSibling = false,
        cloneMatch,
        m;

    for (;
        (m = chunker.exec(selector)) !== null;) {

        ++Parts, nodes.push(m[1]);
    }

    // We're going in reverse

    while (Parts--) {

        curSelector = nodes[Parts];

        if (matchExpr.COMBINATOR.test(curSelector)) {

            isSibling = curSelector === '~' || curSelector === '+';
            continue;
        }

        Clones = (cloneMatch = curSelector.match(matchExpr.CLONE)) ? ~~cloneMatch[1] : 1;

        prevChildren = children;


        // Always make sure 'Clones' are a valid
        // number. If not, set to 1

        if (typeof Clones !== 'number') {

            Clones = 1;
        }

        children = create(curSelector, Clones);

        if (prevChildren) {

            if (isSibling) {
                children.appendChild(prevChildren);
                isSibling = false;
            } else {
                multiAppend(children, prevChildren);
            }
        }
    }

    fragment.appendChild(children);

    cache[selector] = fragment.cloneNode(true);

    return hAzzle(fragment.childNodes);
};

/* =========================== INTERNAL FUNCTIONS ========================== */

/** 
 * Create the HTML
 *
 * @param {String} part
 * @param {Number} n
 */

function create(part, n) {


    var tag = matchExpr.TAG.exec(part),
        node = doc.createElement(tag && tag[1] !== '*' ? tag[1] : 'div'),
        fragment = doc.createDocumentFragment(),
        c = tagTypes.length,
        match, regex, callback;

    while (c--) {

        regex = matchExpr[tagTypes[c]];
        callback = expr.filter[tagTypes[c]];

        if (regex.global) {

            while ((match = regex.exec(part)) !== null) {
                callback(match, node);
            }

            continue;

        }

        if ((match = regex.exec(part))) {
            callback(match, node);
        }

    }

    while (n--) {
        fragment.appendChild(node.cloneNode(true));
    }

    return fragment;
}


/** 
 * Multi append more then one element
 *
 * @param {Object} parents
 * @param {Object} children
 */


function multiAppend(parents, children) {

    parents = parents.childNodes;

    var i = parents.length,
        parent;

    while (i--) {

        parent = parents[i];

        if (parent.nodeName.toLowerCase() === 'table') {
            /* IE requires table to have tbody */
            parent.appendChild(parent = doc.createElement('tbody'));
        }

        parent.appendChild(children.cloneNode(true));
    }
}