/** 
 * Generate HTML
 
 A FEW EXAMPLES:
 
  #ID
  ---
  
  hAzzle.html('div#hello');  

  RESULT: 
  
  <div id="hello"> <div>

  #MULTIPLE ID
  ---
  
  hAzzle.html('div#one#two');  

  RESULT: 
  
  <div id="two"> <div>

  #CLASS
  ------
  
  hAzzle.html('div.hello');  

  RESULT: 
  
  <div class="hello"> <div>

  #MULTIPLE CLASSES
  ------
  
  hAzzle.html('div.one.two.three.four-five.six');  

  RESULT: 
  
  <div class="one two three four-five.six"> <div>
  
  #ID AND CLASS
  ------
  
  hAzzle.html('div#hello.test');  

  RESULT: 
  
  <div id="hello" class="test"> <div>
  
  #ATTRIBUTES
  -----------
  
  hAzzle.html('<div title="hello" data-test="1"></div>');  

  RESULT: 

  <div title="hello" data-test="1"></div>

  #ATTRIBUTES WITH SPACE
  ----------------------
  
  hAzzle.html('div[title=" hello world ",data-test=1]');  

  RESULT: 
  
  <div title="hello world" data-test="1"></div>

  #EMPTY ATTRIBUTES
  ----------------------
  
  hAzzle.html('div[title]');  

  RESULT: 
  
  <div title=""></div>

  #REPETITION
  ----------------------
  
  hAzzle.html('li*3');  

  RESULT: 
  
  <li></li>
  <li></li>
  <li></li>
  
 #OPERATORS ( > )
  ----------------------
  
  hAzzle.html('div > p > span');  

  RESULT: 
  
  <div>
    <p>
      <span></span>
   </p>
  </div>

 #OPERATORS ( + )
  ----------------------
  
  hAzzle.html('div + p');  

  RESULT: 
  
  <p></p>
  <div></div>


 #NUMBERING
  ----------------------
  
  hAzzle.html('li.n$#l$*5');  

  RESULT: 
  
  <li id="l5" class="n5"></li>
  <li id="l4" class="n4"></li>
  <li id="l3" class="n3"></li>
  <li id="l2" class="n2"></li>
  <li id="l1" class="n1"></li>

 #NUMBERING WITH PADDING
  ----------------------
  
  hAzzle.html('li.n$$#l$$$$*27');  

  RESULT: 
  
<li id="l0027" class="n27"></li>
<li id="l0026" class="n26"></li>
<li id="l0025" class="n25"></li>
<li id="l0024" class="n24"></li>
<li id="l0023" class="n23"></li>
<li id="l0022" class="n22"></li>
<li id="l0021" class="n21"></li>
<li id="l0020" class="n20"></li>
<li id="l0019" class="n19"></li>
<li id="l0018" class="n18"></li>
<li id="l0017" class="n17"></li>
<li id="l0016" class="n16"></li>
<li id="l0015" class="n15"></li>
<li id="l0014" class="n14"></li>
<li id="l0013" class="n13"></li>
<li id="l0012" class="n12"></li>
<li id="l0011" class="n11"></li>
<li id="l0010" class="n10"></li>
<li id="l0009" class="n09"></li>
<li id="l0008" class="n08"></li>
<li id="l0007" class="n07"></li>
<li id="l0006" class="n06"></li>
<li id="l0005" class="n05"></li>
<li id="l0004" class="n04"></li>
<li id="l0003" class="n03"></li>
<li id="l0002" class="n02"></li>
<li id="l0001" class="n01"></li>


  NUMBERING INHERITED FROM PARENT WHITH SINGLE ELEMENT
  -------------

 hAzzle.html('li*5 > p.n$');
 
  RESULT:  
  
  <li>
    <p class="n3"></p>
  </li>
  <li>
    <p class="n2"></p>
  </li>
   <li>
    <p class="n1"></p>
  </li>


 TEXT
 -------------

 hAzzle.html('div{hello}')
  
  RESULT:
  
  <div>hello</div>


 TEXT REPLACEMENT
 -------------

 hAzzle.html('div{hello $x$y}', { x: 'world', y: '!' }	)
  
  RESULT:
  
 <div>hello world!</div>

 SECTION
 -------------

 hAzzle.html('section > p + div.places > li*5')
  
  RESULT:
 
<section>
 <p>
   <div class="places">
     <li></li>
     <li></li>
     <li></li>
     <li></li>
     <li></li>
  </div>
</p>
</section>

 COMPLEX EXAMPLE
  -------------

 hAzzle.html('div{hello}#main>ul.list.bacon#bacon > li.hello$*4 > a[href=#$]{hello $x}', { x: 'world' })
  
  RESULT:
  
  <div id="main">
      hello
  <ul id="bacon" class="list bacon">
    <li class="hello1">
       <a href="#1">hello world</a>
    </li>
    <li class="hello2">
    <a href="#2">hello world</a>
    </li>
    <li class="hello3">
    <a href="#3">hello world</a>
    </li>
    <li class="hello4">
    <a href="#4">hello world</a>
    </li>
</ul>
</div>

==================================================

Other compinations are also possible, and you can
create single tags - e.g. div, span, b, img

Just be carefull. This is a powerfull tool!!
Suddenly you can end up width
50 million 'div' tags as I did :( :( :( :( :(

**/
var win = this,
    doc = win.document,
    slice = Array.prototype.slice,
    call = Function.prototype.call,
    trim = String.prototype.trim,

    // Various regEx

    matchExpr = {
        
		// Should we accept creation of script tags or not??
		// I put it here in case we decide not to
        scripttag: /\s*<script +src=['"]([^'"]+)['"]>/,
        white: /\$(\w+)/g,
        trimspaces: /^\s*|\s*$/g,
        repl: /['"]/g,
        id: /#([\w-$]+)/g,
        tagname: /^\w+/,
        classname: /\.[\w-$]+/g,
        operators: /[>+]/g,
        multiplier: /\*(\d+)$/,
        attributes: /\[([^\]]+)\]/g,
        values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
        numbers: /[$]+/g,
        text: /\{(.+)\}/
    },

    twist = function (arr, fn, scope) {
        var result = [],
            i = 0,
            l = arr.length;
        for (; i < l; i++)
            result.push(fn.call(scope, arr[i], i));
        return result;
    },

    // MEHRAN!
    // Todo! Add more operators

    operators = {

        '>': function (parents) {

            return hAzzle.reduce(parents, function (p, c) {
                return p.concat(slice.call(c.childNodes, 0).filter(function (el) {
                    return el.nodeType === 1 && !el._sibling;
                }));
            }, []);
        }
    },

    Adjacents = {

        '+': function (el) {
            return el._sibling = true;
        },
        '-': function (el) {
            return el._sibling = false;
        }
    };

// Limit for how many DOM elements that can be
// created at the same time (default: 100);

hAzzle.maxTags = 100;

/**
 * Create HTML
 *
 * @param {String} str
 * @param {Undefined/Object} data
 * @return {Object}
 */

hAzzle.html = function (str, data) {

    if (!str) {

        return;
    }

    // Remove whitespace

    str = str.replace(matchExpr.trimspaces, '');

    var nodes = [],
        parts = twist(str.split(matchExpr.operators), call, trim),
        fragment = doc.createDocumentFragment(),
        aa = [],
        i, parents = [fragment],
        matches, matched,
        op = (matchExpr.operators.exec(str) || [])[0],
        attrs = {};

    hAzzle.each(parts, function (part) {

        var count = 1,
            tag, id,
            classes, text, index, _index, element;

        if ((matches = part.match(matchExpr.attributes))) {

            matched = matches[matches.length - 1];

            while ((matches = matchExpr.values.exec(matched))) {

                attrs[matches[1]] = (matches[4] || '').replace(matchExpr.repl, '').trim();
            }

            part = part.replace(matchExpr.attributes, '');
        }

        // Multipliers
        if ((matches = part.match(matchExpr.multiplier))) {

            count = +matches[1];

            // We don't want to create millions of the same DOM element, 
            // so we set an limit (default:100)

            if (count > hAzzle.maxTags) {

                count = hAzzle.maxTags;
            }
        }

        // ID
        if ((matches = part.match(matchExpr.id))) {
            id = matches[matches.length - 1].substr(1);
        }

        // Tag

        if ((matches = part.match(matchExpr.tagname))) {

            tag = matches[0];

        } else {

            tag = 'div';
        }

        // Class

        if ((matches = part.match(matchExpr.classname))) {

            classes = twist(matches, function (c) {
                return c.substr(1);
            }).join(' ');
        }

        // Text

        if ((matches = part.match(matchExpr.text))) {
            text = matches[1];

            if (data) {

                text = text.replace(matchExpr.white, function (m, key) {
                    return data[key];
                });
            }
        }

        aa = slice.call(parents, 0);

        i = aa.length;

        while (i--) {

            for (index = 0; index < count; index++) {

                // Use parentIndex if this element has a count of 1

                _index = count > 1 ? index : i;

                element = createDOMElement(_index, tag, id, classes, text, attrs);

                // Adjacents selectors

                if (Adjacents[op]) {
                    Adjacents[op];
                }

                aa[i].appendChild(element);
            }
        }

        if (operators[op]) {
            // If the next operator is '>' replace `parents` with their childNodes for the next iteration.

            if (op === '>') {

                parents = operators[op](parents) || parents;
            }
        }

    });

    // Remove wrapper from fragment

    nodes = hAzzle.merge(nodes, fragment.childNodes);

    fragment.innerHTML = "";
    fragment.textContent = "";

    return hAzzle(nodes);

};

/**
 * Pads number `n` with `ln` zeroes.
 * @param {Number} n
 * @param {Number} ln
 * @return {String}
 */

function pad(n, ln) {

    n = n.toString();

    while (n.length < ln) {

        n = '0' + n;
    }

    return n;
}

/**
 * Replaces ocurrences of '$' with the equivalent padded
 * index (e.g  `$$ == 01`, `$$$$ == 0001` )
 *
 * @param {String} value
 * @param {number} num
 *
 *
 */


function numbered(value, num) {

   return value.replace(matchExpr.numbers, function (m) {
        return pad(num + 1, m.length);
    });
}

/**
 * Create a DOM element.
 *
 * @param {Number} index
 * @param {string|undefined} tag
 * @param {string|undefined} id
 * @param {string|undefined} className
 * @param {string|undefined} text
 * @param {Object} attrs
 *
 */

function createDOMElement(index, tag, id, className, text, attrs) {

    var key, element = doc.createElement(tag);

    if (id) {

        element.id = numbered(id, index);
    }

    if (className) {

        element.className = numbered(className, index);
    }

    if (text) {

        element.appendChild(doc.createTextNode(text));
    }

    if (attrs) {

        for (key in attrs) {

            if (!attrs.hasOwnProperty(key)) {

                continue;
            }

            element.setAttribute(key, numbered(attrs[key], index));
        }
    }

    return element;
}