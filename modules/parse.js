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
  
  hAzzle.html('div.one.two.three.four-five_six');  

  RESULT: 
  
  <div class="one two three four-five_six"> <div>
  
  #ID AND CLASS
  ------
  
  hAzzle.html('div#hello.test');  

  RESULT: 
  
  <div id="hello" class="test"> <div>
  
  #ATTRIBUTES
  -----------
  
  hAzzle.html('<div title="hello" data-test="1"></div>');  

  RESULT: 
  
  <div id="hello" class="test"> <div>

  #ATTRIBUTES WITH SPACE
  ----------------------
  
  hAzzle.html('div[title=" hello  world ",data-test=1]');  

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
  
 #OPERATORS
  ----------------------
  
  hAzzle.html('li*5 > p.n$');  

  RESULT: 
  
  <div>
    <p>
      <span></span>
   </p>
  </div>
  
  NUMBERING INHERITED FROM PARENT WHEN SINGLE ELEMENT
  -------------

 hAzzle.html('div a');
 
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

 hAzzle.html('div{hello}>p*2'	)
  
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

**/
var slice = Array.prototype.slice,
    call = Function.prototype.call,
    trim = String.prototype.trim,

    // Various regEx

    matchExpr = {
        trimspaces: /^\s*|\s*$/g,
        repl: /['"]/g,
        operators: /[>+]/g,
        multiplier: /\*(\d+)$/,
        id: /#([\w-$]+)/g,
        tagname: /^\w+/,
        classname: /\.[\w-$]+/g,
        attributes: /\[([^\]]+)\]/g,
        values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
        numbering: /[$]+/g,
        text: /\{(.+)\}/
    },

    /**
     * Faster Reduce then native Prototype
     *
     * @param {Array} array
     * @param {Function} fn
     * @param {Object} initial value
     */

    reduce = function (arr, fn, val) {
        var rval = val,
            i = 0,
            l = arr.length;

        for (; i < l; i++) {

            rval = fn(rval, arr[i], i, arr);
        }

        return rval;
    },

    twist = function (arr, fn, scope) {
        var result = [],
            i = 0,
            l = arr.length;
        for (; i < l; i++)
            result.push(fn.call(scope, arr[i], i));
        return result;
    };

hAzzle.html = function (str, data) {

    // Remove whitespace

    str = str.replace(matchExpr.trimspaces, '');

    var nodes = [],
        parts = twist(str.split(matchExpr.operators), call, trim),
        fragment = document.createDocumentFragment(),
        aa = [],
        i, parents = [fragment],
        matches, matched,
        op = (matchExpr.operators.exec(str) || [])[0],
        attrs = {};

    hAzzle.each(parts, function (part) {

        var count = 1,
            tag,
            id,
            classes,
            text,
            index, _index, element;

        if ((matches = part.match(matchExpr.attributes))) {

            matched = matches[matches.length - 1];

            while ((matches = matchExpr.values.exec(matched))) {

                attrs[matches[1]] = (matches[4] || '').replace(matchExpr.repl, '').trim();
            }

            part = part.replace(matchExpr.attributes, '');
        }

        // Multipliers
        if ((matches = part.match(matchExpr.multiplier))) {
            var times = +matches[1];
            if (times > 0) count = times;
        }

        // ID
        if ((matches = part.match(matchExpr.id))) {
            id = matches[matches.length - 1].substr(1);
        }

        // Tag names
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
                text = text.replace(/\$(\w+)/g, function (m, key) {
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

                if (op === '+') {

                    element._sibling = true;

                }

                aa[i].appendChild(element);
            }
        }

        // If the next operator is '>' replace `parents` with their childNodes for the next iteration.

        if (op === '>') {

            parents = reduce(parents, function (p, c) {

                return p.concat(slice.call(c.childNodes, 0).filter(function (el) {
                    return el.nodeType === 1 && !el._sibling;
                }));
            }, []);
        }

    });

    // Remove wrapper from fragment

    nodes = hAzzle.merge(nodes, fragment.childNodes);
    return hAzzle(nodes);
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

// Replaces ocurrences of '$' with the equivalent padded 
// index (e.g  `$$ == 01`, `$$$$ == 0001` )

function numbered(value, n) {

    return value.replace(matchExpr.numbering, function (m) {
        return pad(n + 1, m.length);
    });
}

// Create a DOM element.
function createDOMElement(index, tag, id, className, text, attrs) {

    var key, element = document.createElement(tag);

    if (id) {

        element.id = numbered(id, index);
    }

    if (className) {

        element.className = numbered(className, index);
    }

    if (text) {

        element.appendChild(document.createTextNode(text));
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