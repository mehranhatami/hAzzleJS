// classList shim for Internet Explorer 9.0 and
// other browsers who don't support this new API
if ("document" in self && ((!"classList" in document.createElement("_")) || !(document.createElementNS != undefined && "classList" in document.createElementNS("http://www.w3.org/2000/svg", "_")))) {

    (function (view) {

        "use strict";

        if (!('Element' in view)) return;

        var classListProp = "classList",
            protoProp = "prototype",
            elemCtrProto = view.Element[protoProp],
            objCtr = Object,

            // Vendors: please allow content code to instantiate DOMExceptions
            DOMEx = function (type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            },

            checkTokenAndGetIndex = function (classList, token) {
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
                return hAzzle.indexOf(classList, token);

            },
            ClassList = function (elem) {
                var trimmedClasses = hAzzle.trim(elem.getAttribute("class") || ""),
                    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                    i = 0,
                    len = classes.length;
                for (; i < len; i++) {
                    this.push(classes[i]);
                }
                this._updateClassName = function () {
                    elem.setAttribute("class", this.toString());
                };
            },
            classListProto = ClassList[protoProp] = [],
            classListGetter = function () {
                return new ClassList(this);
            };

        DOMEx[protoProp] = Error[protoProp];

        classListProto.item = function (i) {
            return this[i] || null;
        };
        classListProto.contains = function (token) {
            token += "";
            return checkTokenAndGetIndex(this, token) !== -1;
        };
        classListProto.add = function () {
            var tokens = arguments,
                i = 0,
                l = tokens.length,
                token,
                updated = false;

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

            var tokens = arguments,
                i = 0,
                l = tokens.length,
                token,
                updated = false,
                index;
            do {
                token = tokens[i] + "";
                index = checkTokenAndGetIndex(this, token);
                while (index !== -1) {
                    this.splice(index, 1);
                    updated = true;
                    index = checkTokenAndGetIndex(this, token);
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.toggle = function (token, force) {
            token += "";

            var result = this.contains(token),
                method = result ? force !== true && "remove" :
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

    }(self));
}