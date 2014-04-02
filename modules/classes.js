var expr = {
    specialSplit: /\s*,\s*|\s+/
},
    classList_support = !! document.createElement('p').classList;

/**
  ClassList is a faster option then the jQuery and Zepto way, but Internet Explorer 9 and some other browsers don't support classList, so we use a shim to get it work.
 */


if (classList_support) {

    (function (view) {

        "use strict";

        if (!('Element' in view)) return;

        var
        classListProp = "classList",
            protoProp = "prototype",
            elemCtrProto = view.Element[protoProp],
            objCtr = Object,
            strTrim = String[protoProp].trim,
            arrIndexOf = function (item) {
                var
                i = 0,
                    len = this.length;
                for (var _this = this, i = _this.length; i--;) {
                    if (i in _this && _this[i] === item) {
                        return i;
                    }
                }
                return -1;
            }
            // Vendors: please allow content code to instantiate DOMExceptions
            , DOMEx = function (type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            }, checkTokenAndGetIndex = function (classList, token) {
                if (token === "") {
                    throw new DOMEx(
                        "SYNTAX_ERR", "An invalid or illegal string was specified"
                    );
                }
                if (/\s/.test(token)) {
                    throw new DOMEx(
                        "INVALID_CHARACTER_ERR", "String contains an invalid character"
                    );
                }
                return arrIndexOf.call(classList, token);
            }, ClassList = function (elem) {
                var
                trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
                    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];

                for (var i = classes.length; i--;) {
                    this.push(classes[i]);
                }
                this._updateClassName = function () {
                    elem.setAttribute("class", this.toString());
                };
            }, classListProto = ClassList[protoProp] = [],
            classListGetter = function () {
                return new ClassList(this);
            };
        // Most DOMException implementations don't allow calling DOMException's toString()
        // on non-DOMExceptions. Error's toString() is sufficient here.
        DOMEx[protoProp] = Error[protoProp];
        classListProto.item = function (i) {
            return this[i] || null;
        };
        classListProto.contains = function (token) {
            token += "";
            return checkTokenAndGetIndex(this, token) !== -1;
        };
        classListProto.add = function () {
            var
            tokens = arguments,
                i = 0,
                l = tokens.length,
                token, updated = false;
            do {
                token = tokens[i] + "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    updated = true;
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.remove = function () {
            var
            tokens = arguments,
                i = 0,
                l = tokens.length,
                token, updated = false;
            do {
                token = tokens[i] + "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    updated = true;
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.toggle = function (token, force) {
            token += "";

            var
            result = this.contains(token),
                method = result ?
                    force !== true && "remove" :
                    force !== false && "add";

            if (method) {
                this[method](token);
            }

            return !result;
        };
        classListProto.toString = function () {
            return this.join(" ");
        };

        if (objCtr.defineProperty) {
            var classListPropDesc = {
                get: classListGetter,
                enumerable: true,
                configurable: true
            };
            try {
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            } catch (ex) { // IE 8 doesn't support enumerable:true
                if (ex.number === -0x7FF5EC54) {
                    classListPropDesc.enumerable = false;
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                }
            }
        } else if (objCtr[protoProp].__defineGetter__) {
            elemCtrProto.__defineGetter__(classListProp, classListGetter);
        }

    }(document));

}



hAzzle.extend({


    /**
     * Internal remove class function. Uses Classlist for better performance if supported by browser
     *
     * @param {string} class
     * @param {string} el
     */

    removeClass: function (classes, el) {
        hAzzle.each(classes.split(expr['specialSplit']), function () {
            el.classList.remove(this);
        });
    },

    /**
     * Internal addClass function. Uses Classlist for better performance if supported by browser
     *
     * @param {string} class
     * @param {string} el
     */

    addClass: function (classes, el) {
        if (!classes) return;
        hAzzle.each(classes.split(expr['specialSplit']), function () {
            el.classList.add(this);
        });
    }
});


hAzzle.fn.extend({

    /**
     * Add classes to element collection
     * Multiple classnames can be with spaces or comma or both
     * @param {String} classes
     */

    addClass: function (value) {
        if (hAzzle.isFunction(value)) {
            return this.each(function (j) {
                hAzzle(this).addClass(value.call(this, j, this.className));
            });
        }
        return this.each(function () {
            hAzzle.addClass(value, this);
        });
    },

    /**
     * Remove classes from element collection
     *
     * @param {String} className
     */

    removeClass: function (value) {
        if (hAzzle.isFunction(value)) {
            return this.each(function (j) {
                hAzzle(this).removeClass(value.call(this, j, this.className));
            });
        }
        return this.each(function () {
            // If value is undefined, we do a quick manouver and just earese all clases for that element
            // without any heavy classList operations
            hAzzle.isUndefined(value) ? this.className = "" : hAzzle.removeClass(value, this);
        });
    },

    /**
     * Checks if an element has the given class
     *
     * @param {String} className
     * @return {Boolean}
     */

    hasClass: function (value) {
        return this[0].classList.contains(value);
    },

    /**
     * Replace a class in a element collection
     *
     * @param {String} className
     */

    replaceClass: function (clA, clB) {
        var current, found;
        return this.each(function () {
            current = this.className.split(' '),
            found = false;

            for (var i = current.length; i--;) {
                if (current[i] == clA) {
                    found = true;
                    current[i] = clB;
                }
            }
            if (!found) {
                return hAzzle.addClass(clB, this);
            }
            this.className = current.join(' ');
        });
    },

    /**
     * Add class 'clas' to 'element', and remove after 'duration' milliseconds
     * @param {String} clas
     * @param {Number} duration
     */

    tempClass: function (clas, duration) {
        var _this;
        return this.each(function () {
            _this = this;
            hAzzle.addClass(clas, _this);

            setTimeout((function () {
                hAzzle.removeClass(clas, _this);
            }), duration);
        });
    },

    /**
     * Retrive all classes that belong to one element
     */

    allClass: function () {
        return this[0].classList;
    },

    /**
     * Toggle classes
     *
     * @param {String} className
     * @param {Boolean} state
     * @return {Boolean}
     */

    toggleClass: function (value, stateVal) {
        var type = typeof value;

        if (typeof stateVal === "boolean" && type === "string") {
            return stateVal ? this.addClass(value) : this.removeClass(value);
        }

        if (hAzzle.isFunction(value)) {
            return this.each(function (i) {
                hAzzle(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
            });
        }

        return this.each(function () {
            this.classList.toggle(value);
        });
    }
});