// Classes

var csp = hAzzle.features.classList,
  sMa = hAzzle.features.sMa, // Multiple argumens

  //NOT USED
  //indexOf = Array.prototype.indexOf,

  rclass = /[\t\r\n\f]/g,
  whitespaceRegex = /\S+/g;

hAzzle.extend({

  /**
   * Add class(es) to element collection
   *
   * @param {String} value
   * @return {hAzzle}
   */

  addClass: function (value) {
    var cur,
      j,
      clazz,
      finalValue,
      classes;

    if (typeof value === 'function') {

      return this.each(function (el, index) {
        hAzzle(el).addClass(value.call(el, index, el.className));
      });
    }
    classes = (value || '').match(whitespaceRegex) || [];

    return this.each(function (el) {
      if (el.nodeType === 1) {
        if (csp) {
          if (sMa) {
            el.classList.add.apply(el.classList, classes);
          } else {
            try {
              value.replace(whitespaceRegex, function (name) {
                el.classList.add(name);
              });
            } catch (e) {}
          }
        } else {
          cur = el.nodeType === 1 && (el.className ? (' ' + el.className + ' ').replace(rclass, ' ') : ' ');

          if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
              if (cur.indexOf(' ' + clazz + ' ') < 0) {
                cur += clazz + ' ';
              }
            }

            // only assign if different to avoid unneeded rendering.
            finalValue = hAzzle.trim(cur);
            if (el.className !== finalValue) {
              el.className = finalValue;
            }
          }
        }
        return el;
      }
    });
  },

  /**
   * Remove class(es) from element
   *
   * @param {String} value
   */

  removeClass: function (value) {

    var cls,
      element,
      classes = (value || '').match(whitespaceRegex) || [];

    // Function

    return typeof value === 'function' ?
      this.each(function (j) {
        hAzzle(this).removeClass(value.call(this, j, this.className));
      }) : this.each(function () {
        element = this;
        if (element.nodeType === 1 && element.className) {

          if (!value) {
            element.className = '';
            return;
          }

          if (value === '*') {
            element.className = '';
          } else {
            if (hAzzle.isRegExp(value)) {
              value = [value];
            } else if (csp && hAzzle.inArray(value, '*') === -1) {
              if (sMa) {
                element.classList.remove.apply(element.classList, classes);
              } else {
                var i = 0;
                while ((cls = classes[i++])) {
                  element.classList.remove(cls);
                }
              }
              return;
            } else {
              value = value.trim().split(/\s+/);


              var name;

              classes = ' ' + element.className + ' ';

              while ((name = value.shift())) {
                if (name.indexOf('*') !== -1) {
                  name = new RegExp('\\s*\\b' + name.replace('*', '\\S*') + '\\b\\s*', 'g');
                }
                if (name instanceof RegExp) {
                  classes = classes.replace(name, ' ');
                } else {
                  while (classes.indexOf(' ' + name + ' ') !== -1) {
                    classes = classes.replace(' ' + name + ' ', ' ');
                  }
                }
              }
              element.className = classes.trim();
            }
            return element;
          }
        }
      });
  },

  /**
   * Checks if an element has the given class
   
   *
   * @param {String} selector(s)
   * @return {Boolean} true if the element contains all classes
   */

  hasClass: function (value) {

    var i = 0,
      className = ' ' + value + ' ',
      l = this.length;
    for (; i < l; i++) {
      if (csp) {
        if (this[i].nodeType === 1) {
          if (this[i].classList.contains(value)) {
            return true;
          }
        }
      } else {
        if (this[i].nodeType === 1 && (' ' + this[i].className + ' ').replace(rclass, ' ').indexOf(className) >= 0) {
          return true;
        }
      }
    }
    return false;
  },


  /**
   * Replace a class in a element collection
   *
   * @param {String} clA
   * @param {String} clB
   * @return {hAzzle}
   */

  replaceClass: function (clA, clB) {
    var current, found, i;
    return this.each(function () {
      current = this.className.split(' ');
      found = false;

      for (i = current.length; i--;) {
        if (current[i] === clA) {
          found = true;

          //TODO Kenny: what does it mean??????
          //current[i] === clB;
          current[i] = clB;
        }
      }
      if (!found) {
        return hAzzle(this).addClass(clB, this);
      }
      this.className = current.join(' ');
    });
  },

  /**
   * Toggle class(es) on element
   *
   * @param {String} value
   * @param {Boolean} state
   * @return {Boolean}
   */

  toggleClass: function (value, state) {

    var type = typeof value;

    if (typeof state === 'boolean' && type === 'string') {
      return state ? this.addClass(value) : this.removeClass(value);
    }

    if (hAzzle.isFunction(value)) {
      return this.each(function (i) {
        hAzzle(this).toggleClass(value.call(this, i, this.className, state), state);
      });
    }

    var classNames = value.match(whitespaceRegex) || [],
      cls,
      i = 0,
      self;

    return this.each(function (elem) {

      if (type === 'string') {

        // ClassList

        self = hAzzle(elem);

        while ((cls = classNames[i++])) {

          if (csp) {

            if (typeof state === 'boolean') {

              // IE10+ doesn't support the toggle boolean flag.

              if (state) {

                return elem.classList.add(cls);

              } else {

                return elem.classList.remove(cls);
              }
            }

            return elem.classList.toggle(cls);
          }

          // check each className given, space separated list

          if (self.hasClass(cls)) {

            self.removeClass(cls);

          } else {

            self.addClass(cls);
          }
        }

        // Toggle whole class name
      } else if (type === typeof undefined || type === 'boolean') {
        if (this.className) {
          // store className if set
          hAzzle.data(this, '__className__', this.className);
        }

        this.className = this.className || value === false ? '' : hAzzle.data(this, '__className__') || '';
      }
    });
  }

});