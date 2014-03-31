  var slice = Array.prototype.slice,
      expr = {
          operators: /[>+]/g,
          multiplier: /\*(\d+)$/,
          id: /#[\w-$]+/g,
          tagname: /^\w+/,
          classname: /\.[\w-$]+/g,
          attributes: /\[([^\]]+)\]/g,
          values: /([\w-]+)(\s*=\s*(['"]?)([^,\]]+)(\3))?/g,
          numbering: /[$]+/g,
          text: /\{(.+)\}/
      },
      cached = [];

   // Converts a documentFragment element tree to an HTML string. When a documentFragment
   // is given to `.appendChild` it's *contents* are appended; we need to clone the
   // fragment so that it remains populated and can still be used afer a `toHTML` call.
  function toHTML() {
      var div = document.createElement('div');
      div.appendChild(this.cloneNode(true));
      return div.innerHTML;
  }

   // Pads number `n` with `ln` zeroes.
  function pad(n, ln) {
      n = n.toString();
      while (n.length < ln) n = '0' + n;
      return n;
  }

  /** Replaces ocurrences of '$' with the equivalent padded index.
   * `$$ == 01`, `$$$$ == 0001`
   */

  function numbered(value, n) {
      return value.replace(expr['numbering'], function (m) {
          return pad(n + 1, m.length);
      });
  }

  var call = Function.prototype.call,
      trim = String.prototype.trim;

  hAzzle.extend({

      /**
       * Create a DOM element.
       *
       * @param{Number} index
       * @param{String} tag
       * @param{String} id
       * @param{String} className
       * @param{String} text
       * @param{Object} attrs
       *
       * @return{Object}
       */

      createDOMElem: function (index, tag, id, className, text, attrs) {

          var element = document.createElement(tag);

          if (id) element.id = numbered(id, index);
          if (className) element.className = numbered(className, index);
          if (text) element.appendChild(document.createTextNode(text));

          if (attrs)

              for (var key in attrs) {
                  if (!attrs.hasOwnProperty(key)) continue;
                  element.setAttribute(key, numbered(attrs[key], index));
              }

          return element;
      },

      parseHTML: function (str, data) {

          var parts = cached[str] ? cached[str] : cached[str] = str.split(expr['operators']).map(call, trim),

              // Avoid DOM insertion too many times, so we cache
              tree = cached[data] ? cached[data] : cached[data] = document.createDocumentFragment(),
              match,
              parents = [tree];

          // Go over the abbreviations one level at a time, and process
          // corresponding element values

          hAzzle.each(parts, function (i, original) {

              var part = original,
                  op = (expr['operators'].exec(str) || [])[0],
                  count = 1,
                  tag, id, classes, text, attrs = {};

              // #### Attributes
              // Attributes are parsed first then removed so that it takes precedence
              // over IDs and classNames for the `#.` characters.

              if (match = part.match(expr['attributes'])) {

                  var matched = match[match.length - 1];

                  while (match = expr['values'].exec(matched)) {
                      attrs[match[1]] = (match[4] || '').replace(/['"]/g, '').trim();
                  }

                  part = part.replace(expr['attributes'], '');
              }

              // #### Multipliers
              if (match = part.match(expr['multiplier'])) {
                  var times = +match[1];
                  if (times > 0) count = times;
              }

              // #### IDs
              if (match = part.match(expr['id'])) {
                  id = match[match.length - 1].slice(1);
              }

              // #### Tag names
              if (match = part.match(expr['tagname'])) {
                  tag = match[0];
              } else {
                  tag = 'div';
              }

              // #### Class names
              if (match = part.match(expr['classname'])) {
                  classes = match.map(function (c) {
                      return c.slice(1);
                  }).join(' ');
              }

              // #### Text
              if (match = part.match(expr['text'])) {
                  text = match[1];
                  if (data) {
                      text = text.replace(/\$(\w+)/g, function (m, key) {
                          return data[key];
                      });
                  }
              }

              // Insert `count` copies of the element per parent. If the current operator
              // is `+` we mark the elements to remove it from `parents` in the next iteration.


              hAzzle.each(slice.call(parents, 0), function (parentIndex, parent) {

                  for (var index = 0; index < count; index++) {
                      // Use parentIndex if this element has a count of 1
                      var _index = count > 1 ? index : parentIndex;

                      var element = hAzzle.createDOMElem(_index, tag, id, classes, text, attrs);

                      if (op === '+') element._sibling = true;

                      parent.appendChild(element);
                  }
              });

              // If the next operator is '>' replace `parents` with their childNodes for the next iteration.
              if (op === '>') {
                  parents = parents.reduce(function (p, c, i, a) {
                      return p.concat(slice.call(c.childNodes, 0).filter(function (el) {
                          return el.nodeType === 1 && !el._sibling;
                      }));
                  }, []);
              }
          });

          // Augment the documentFragment with the `toHTML` method.

          tree.toHTML = toHTML;

          return tree;
      }


  });