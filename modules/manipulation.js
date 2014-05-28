/*!
 * Manipulation
 */
//REVIEW Keny: This doesn't really seem to be your code, it had a lot of missing semicolons
//and undefined variables with a lot of bugs
var
win = this,
  doc = win.document,
  parentNode = 'parentNode',
  setAttribute = 'setAttribute',
  getAttribute = 'getAttribute',
  singleTag = /^\s*<([^\s>]+)/,
  specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
  uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
  wp = /\S+/g,

  // Inspiration from jQuery

  table = ['<table>', '</table>', 1],
  td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
  option = ['<select>', '</select>', 1],
  noscope = ['_', '', 0, 1],
  tagMap = { // tags that we have trouble *inserting*
    thead: table,
    tbody: table,
    tfoot: table,
    colgroup: table,
    caption: table,
    tr: ['<table><tbody>', '</tbody></table>', 2],
    th: td,
    td: td,
    col: ['<table><colgroup>', '</colgroup></table>', 2],
    fieldset: ['<form>', '</form>', 1],
    legend: ['<form><fieldset>', '</fieldset></form>', 2],
    option: option,
    optgroup: option,
    script: noscope,
    style: noscope,
    link: noscope,
    param: noscope,
    base: noscope
  },

  special = {
    'for': 'htmlFor',
    'class': 'className'
  },

  hooks = {

    'SELECT': function (elem) {

      var option,
        options = elem.options,
        index = elem.selectedIndex,
        one = elem.type === 'select-one' || index < 0,
        values = one ? null : [],
        value,
        max = one ? index + 1 : options.length,
        i = index < 0 ?
          max :
          one ? index : 0;

      for (; i < max; i++) {

        option = options[i];

        if ((option.selected || i === index) && !option.disabled &&
          (hAzzle.features.optDisabled ? !option.disabled : option.getAttribute('disabled') === null) &&
          (!option.parentNode.disabled || !hAzzle.nodeName(option.parentNode, 'optgroup'))) {

          // Get the specific value for the option
          value = hAzzle(option).val();

          // We don't need an array for one selects
          if (one) {
            return value;
          }

          // Multi-Selects return an array
          values.push(value);
        }
      }
      return values;
    },

    'OPTION': function (elem) {

      var val = elem[getAttribute](name, 2);

      return val !== null ? val : hAzzle.trim(hAzzle.getText(elem));
    }
  },

  // Boolean attributes and elements

  boolean_attr = {
    'multiple': true,
    'selected': true,
    'checked': true,
    'disabled': true,
    'readOnly': true,
    'required': true,
    'open': true
  },

  boolean_elements = {
    'input': true,
    'select': true,
    'option': true,
    'textarea': true,
    'button': true,
    'form': true,
    'details': true
  },

  iAh = function (el, direction, html) {
    if (el && el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
      el.insertAdjacentHTML(direction, hAzzle.trim(html));
    }
  };

function getBooleanAttrName(element, name) {
  // check dom last since we will most likely fail on name
  var booleanAttr = boolean_attr[name.toLowerCase()];
  // booleanAttr is here twice to minimize DOM access
  return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
}

function cSFH(html) {
  var scriptEl = doc.createElement('script'),
    matches = html.match(simpleScriptTagRe);
  scriptEl.src = matches[1];
  return scriptEl;
}

hAzzle.extend({

  /**
   * Get attribute from element
   * Set attribute to element collection
   *
   * @param {String} name
   * @param {String|Object} value
   *
   * @return {Object|String}
   */

  attr: function (name, value) {

    var elem = this[0],
      nType = elem && elem.nodeType;

    if (!elem) {

      return;
    }

    // don't get/set attributes on text, comment and attribute nodes
    if (!elem || nType === 3 || nType === 8 || nType === 2) {
      return;
    }

    if (typeof elem[getAttribute] === typeof undefined) {

      return this.prop(name, value);
    }

    if (typeof value === 'undefined') {

      // Checks if a 'hook' exist for this...:

      if (hooks[elem.nodeName]) {

        return hooks[elem.nodeName](elem);
      }

      elem = elem[getAttribute](name, 2);

      return elem === null ? undefined : elem;
    }

    if (value === null) {

      this.removeAttr(name);
    }

    // Value is set - no need for hooks on this one...

    if (elem.nodeName === 'SELECT') {

      var optionSet, option,
        options = elem.options,
        values = hAzzle.makeArray(value),
        i = options.length;

      while (i--) {
        option = options[i];
        if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
          optionSet = true;
        }
      }

      if (!optionSet) {
        elem.selectedIndex = -1;
      }
      return values;

    } else {

      elem[setAttribute](name, value + '');
      return value;
    }
  },

  /**
   * Remove a given attribute from an element
   *
   * @param {String} value
   * @return {hAzzle}
   */

  removeAttr: function (value) {

    var name, propName, i = 0,
      attrNames = value && value.match(wp);

    return this.each(function (el) {

      if (attrNames && el.nodeType === 1) {

        while ((name = attrNames[i++])) {

          propName = special[name] || name;

          if (getBooleanAttrName(el, name)) {

            el[propName] = false;

          } else {

            el.removeAttribute(name);
          }
        }
      }
    });
  },

  /**
   * Check if an element have an attribute
   *
   * @param{String} name
   * @return {Boolean}
   */

  hasAttr: function (name) {
    return name && typeof this.attr(name) !== 'undefined';
  },

  /**
   * Sets an HTML5 data attribute
   *
   * @param{String} dataAttribute
   * @param{String} dataValue
   *
   * @return {hAzzle}
   */

  dataAttr: function (dataAttribute, dataValue) {

    if (!dataAttribute || typeof dataAttribute !== 'string') {
      return false;
    }
    var key;

    //if dataAttribute is an object, we will use it to set a data attribute for every key
    if (typeof (dataAttribute) === 'object') {
      for (key in dataAttribute) {
        this.attr('data-' + key, dataAttribute[key]);
      }

      return this;
    }

    //if a value was passed, we'll set that value for the specified dataAttribute
    else if (dataValue) {
      return this.attr('data-' + dataAttribute, dataValue);
    }

    // lastly, try to just return the requested dataAttribute's value from the element
    else {
      var value = this.attr('data-' + dataAttribute);

      // specifically checking for undefined in case 'value' ends up evaluating to false

      if (typeof value === 'undefined') {
        return;
      }

      return value;
    }
  },

  toggleAttr: function (attr, toggle) {
    //TODO Kenny: self was not defined and I thought this is what the code uses as the this
    //Just make sure if it meant to be the current this or not. otherwise fix it
    var self = this,
      args = arguments.length;

    // Do nothing if no params provided: (ie fail safely)
    if (args === 0) {

      return self;

      // When toggle arg not provided, add attribute where not present, remove it where prosent:
    } else if (args === 1) {

      return self.each(function () {

        hAzzle(this)[hAzzle(this).attr(attr) ? 'removeAttr' : 'attr'](attr, attr);

      });

      // Otherwise when both attr & toggle arguments have been provided:
    } else {

      // When toggle is a function, apply it to each element:
      if (typeof toggle === 'function') {

        return this.each(function () {

          hAzzle(this)[toggle.call(this) ? 'attr' : 'removeAttr'](attr, attr);

        });

        // Or add attr if toggle is truthy, remove attr if toggle is falsey:
      } else {

        return this[toggle ? 'attr' : 'removeAttr'](attr, attr);

      }

    }
  },

  /**
   * Read or set properties of DOM elements
   *
   * @param {String/Object} name
   * @param {String/Null} value
   * @return {hAzzle}
   */

  prop: function (name, value) {
    var el = this[0];
    return typeof name === 'object' ? this.each(function (el) {
      var a;
      for (a in name) {
        property(el, a, name[a]);
      }
    }) : typeof value === 'undefined' ? el && el[special[name] || name] : property(this[0], name, value);
  },

  /**
   * Toggle properties
   */

  toggleProp: function (property) {
    return this.each(function () {
      return this.prop(property, !this.prop(property));
    });

  },

  /*
   * Remove properties from DOM elements
   *
   * @param {String} name
   * @return {hAzzle}
   */

  removeProp: function (name) {
    return this.each(function () {
      delete this[special[name] || name];
    });
  },

  /**
   * Get value for input/select elements
   * Set value for input/select elements
   *
   * @param {String} value
   * @return {Object|String}
   */

  val: function (value) {

    if (arguments.length) {

      return this.each(function (elem, index) {

        var val;

        if (elem.nodeType !== 1) {
          return;
        }

        if (typeof value === 'function') {
          val = value.call(elem, index, hAzzle(elem).val());

        } else {

          val = value;
        }

        if (val === null) {

          val = '';

        } else if (typeof val === 'number') {

          val += '';

        } else if (hAzzle.isArray(val)) {

          val = hAzzle.map(val, function (value) {

            return value === null ? '' : value + '';
          });
        }

        if (elem.type === 'radio' || elem.type === 'checkbox') {

          return (elem.checked = hAzzle.inArray(hAzzle(elem).val(), value) >= 0);
        }

        if (elem.type === 'select') {

          var optionSet, option,
            options = elem.options,
            values = hAzzle.makeArray(value),
            i = options.length;

          while (i--) {
            option = options[i];
            if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
              optionSet = true;
            }
          }

          // force browsers to behave consistently when non-matching value is set

          if (!optionSet) {

            elem.selectedIndex = -1;
          }

          return values;
        }

        elem.value = val;
      });

    } else {

      var el = this[0],
        ret;

      if (!hAzzle.features.checkOn) {

        return el.getAttribute('value') === null ? 'on' : el.value;
      }

      ret = hooks[el.tagName] ? hooks[el.tagName](el) : el.value;

      return typeof ret === 'string' ? ret.replace(/\r\n/g, '') : ret === null ? '' : ret;

    }
  },

  /**
   * Get html from element.
   * Set html to element.
   *
   * @param {String} html
   * @return {hAzzle|string}
   */

  html: function (html) {
    var append = function (el, i) {
      hAzzle.each(hAzzle.normalize(html, i), function (node) {
        el.appendChild(node);
      });
    },
      updateElement = function (el, i) {
        try {
          if (typeof html === 'string' && !specialTags.test(el.tagName)) {
            el.innerHTML = html.replace(uniqueTags, '<$1></$2>');
            return;
          }
        } catch (e) {}
        append(el, i);
      };
    return typeof html !== 'undefined' ? this.empty().each(updateElement) : this[0] ? this[0].innerHTML : '';
  },

  /**
   * Get text for the first element in the collection
   * Set text for every element in the collection
   
   *
   * hAzzle('div').text() => div text
   *
   * @param {String} value
   * @return {hAzzle|String}
   */

  text: function (value) {

    if (typeof value === 'function') {
      return this.each(function (i) {
        var self = hAzzle(this);
        self.text(value.call(this, i, self.text()));
      });
    }

    if (typeof value !== 'object' && typeof value !== 'undefined') {

      return this.empty().each(function (elem) {

        if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {

          // Firefox does not support insertAdjacentText 

          if (typeof value === 'string' && typeof HTMLElement !== 'undefined' && HTMLElement.prototype.insertAdjacentText) {

            elem.insertAdjacentText('beforeEnd', value);

          } else {

            elem.textContent = value;
          }
        }
      });
    }
    return hAzzle.getText(this);
  },

  /**
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  append: function (node) {
    return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
      this.each(function () {
        iAh(this, 'beforeend', node);
      }) : this.each(function (el, i) {
        if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
          hAzzle.each(hAzzle.normalize(node, i), function (i) {
            // We don't allow text nodes
            if (node.nodeType !== 3) {
              el.appendChild(i);
            }
          });
        }
      });
  },

  /**
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  prepend: function (node) {
    return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
      this.each(function () {
        iAh(this, 'afterbegin', node);
      }) : this.each(function (el, i) {
        if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
          var first = el.firstChild;
          hAzzle.each(hAzzle.normalize(node, i), function (i) {
            if (node.nodeType !== 3) {
              el.insertBefore(i, first);
            }
          });
        }
      });
  },

  /**
   * Append the current element to another
   *
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  appendTo: function (node) {
    insert.call(this, node, this, function (t, el) {
      t.appendChild(el);
    }, 1);
    return this;
  },

  /**
   * Prepend the current element to another.
   *
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  prependTo: function (node) {
    return insert.call(this, node, this, function (t, el) {
      t.insertBefore(el, t.firstChild);
    }, 1);
  },

  /**
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  before: function (node) {
    return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
      this.each(function () {
        iAh(this, 'beforebegin', node);
      }) : this.each(function (el, i) {
        hAzzle.each(hAzzle.normalize(node, i), function (i) {
          el[parentNode].insertBefore(i, el);
        });
      });
  },


  /**
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  after: function (node) {
    return typeof node === 'string' && !hAzzle.isXML(this[0]) ?
      this.each(function () {
        iAh(this, 'afterend', node);
      }) : this.each(function (el, i) {
        hAzzle.each(hAzzle.normalize(node, i), function (i) {
          el[parentNode].insertBefore(i, el.nextSibling);
        }, null, 1);
      });
  },


  /**
   * @param {hAzzle|string|Element|Array} target
   * @param {Object} scope
   * @return {hAzzle}
   */

  insertBefore: function (node) {
    insert.call(this, node, this, function (t, el) {
      t[parentNode].insertBefore(el, t);
    });
    return this;
  },


  /**
   * @param {hAzzle|string|Element|Array} node
   * @param {Object} scope
   * @return {hAzzle}
   */

  insertAfter: function (node) {
    insert.call(this, node, this, function (t, el) {

      var sibling = t.nextSibling;

      //TODO Kenny: check if the new code does the same job????
      /*sibling ?
        t[parentNode].insertBefore(el, sibling) :
        t[parentNode].appendChild(el);*/
      if (sibling) {
        t[parentNode].insertBefore(el, sibling);
      } else {
        t[parentNode].appendChild(el);
      }

    }, 1);
    return this;
  },

  /**
   * @param {hAzzle|string|Element|Array} node
   * @return {hAzzle}
   */

  replaceWith: function (node) {
    hAzzle(hAzzle.normalize(node)).insertAfter(this);
    return this.remove();
  }

});

// Create HTML

hAzzle.create = function (node) {

  if (node !== '' && typeof node === 'string') {

    // Script tag

    if (simpleScriptTagRe.test(node)) {

      return [cSFH(node)];

    }
    var tag = node.match(singleTag),
      el = doc.createElement('div'),
      els = [],
      p = tag ? tagMap[tag[1].toLowerCase()] : null,
      dep = p ? p[2] + 1 : 1,
      ns = p && p[3],
      pn = parentNode;

    el.innerHTML = p ? (p[0] + node + p[1]) : node;

    while (dep--) {

      if (el.firstChild) {

        el = el.firstChild;
      }
    }

    if (ns && el && el.nodeType !== 1) {

      el = el.nextSibling;
    }

    do {

      if (!tag || el.nodeType == 1) {

        els.push(el);
      }

    } while ((el = el.nextSibling));

    hAzzle.each(els, function (el) {
      //TODO Kenny: check if the change is valid
      //el[pn] && el[pn].removeChild(el);
      if (el[pn]) {
        el[pn].removeChild(el);
      }
    });

    return els;

  } else {

    return hAzzle.isNode(node) ? [node.cloneNode(true)] : [];
  }

};


// this insert method is intense
function insert(target, node, fn, rev) {
  //TODO Kenny: self again was not defined and I thought this is what the code uses as the this
  //Just make sure if it meant to be the current this or not. otherwise fix it
  var self = this,
    i = 0,
    r = [],
    nodes = typeof target === 'string' && target.charAt(0) !== '<' ? hAzzle(target) : target;

  // normalize each node in case it's still a string and we need to create nodes on the fly

  hAzzle.each(hAzzle.normalize(nodes), function (t, j) {
    hAzzle.each(node, function (el) {

      fn(t, r[i++] = j > 0 ? hAzzle.cloneNode(self, el) : el);

    }, null, rev);

  }, this, rev);

  node.length = i;

  hAzzle.each(r, function (e) {

    node[--i] = e;

  }, null, !rev);

  return self;
}

function property(elem, name, value) {

  var ret, hooks, notxml,
    nType = elem.nodeType,
    phooks = {
      tabIndex: {
        get: function (elem) {
          return elem.hasAttribute('tabindex') || /^(?:input|select|textarea|button)$/i.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
        }
      }
    };

  // Support: IE9+

  if (!hAzzle.features.optSelected) {
    phooks.selected = {
      get: function (elem) {
        var parent = elem.parentNode;
        if (parent && parent.parentNode) {
          //TODO Kenny: Really really wondered here what it is going to do????
          //IMPORTANT!!
          //parent.parentNode.selectedIndex;
          //Kenny: I have changed it to the next line, make sure if it is correct.
          if (parent.parentNode.hasOwnProperty('selectedIndex')) {
            return parent.parentNode.selectedIndex;
          }
        }
        return null;
      }
    };
  }

  // don't get/set properties on text, comment and attribute nodes
  if (!elem || nType === 3 || nType === 8 || nType === 2) {
    return;
  }

  notxml = nType !== 1 || (elem.ownerDocument || elem).documentElement.nodeName === 'HTML';

  if (notxml) {
    hooks = phooks[special[name] || name];
  }

  if (typeof value !== 'undefined') {

    return hooks && 'set' in hooks && typeof (ret = hooks.set(elem, value, name)) !== 'undefined' ? ret : (elem[name] = value);

  } else {

    return hooks && 'get' in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
  }
}