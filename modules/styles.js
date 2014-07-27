
var directions = ["Top", "Right", "Bottom", "Left"],
    reDash = /\-./g,
	docElem = hAzzle.docElem,
    computeStyle = hAzzle.computeStyle = function(elem) {
        var view = elem.ownerDocument.defaultView;
        return !!document.defaultView.getComputedStyle ? (view.opener ? view.getComputedStyle(elem, null) :
            window.getComputedStyle(elem, null)) : elem.style;
    },

    // Expose the cssStyles object to the global scope

    cssStyles = hAzzle.cssStyles = {

        get: {},
        set: {}
    },

    computed = computeStyle(docElem),

    props = hAzzle.makeArray(computed);

  hAzzle.each(props, function(propName) {

    var prefix = propName[0] === "-" ?
        propName.substring(1, propName.indexOf("-", 1) - 1) : null,
        unprefixedName = prefix ? propName.substring(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, function(str) {
            return str[1].toUpperCase();
        });
    // most of browsers starts vendor specific props in lowercase

    if (!(stylePropName in computed)) {

        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    cssStyles.get[unprefixedName] = function(style) {

        return style[stylePropName];
    };

    cssStyles.set[unprefixedName] = function(style, value) {

        value = typeof value === "number" ? value + "px" : value.toString();
        style["cssText" in style ? stylePropName : propName] = value;
    };
});

// Exclude the following css properties from adding px
hAzzle.each('float fill-opacity font-weight line-height opacity orphans widows z-index zoom '.split(' '), function(propName) {

    var stylePropName = propName.replace(reDash, function(str) {
        return str[1].toUpperCase();
    });

    if (propName === "float") {
        stylePropName = "cssFloat" in computed ? "cssFloat" : "styleFloat";
        // normalize float css property
        cssStyles.get[propName] = function(style) {
            return style[stylePropName];
        };
    }

    cssStyles.set[propName] = function(style, value) {
        style["cssText" in style ? stylePropName : propName] = value.toString();
    };
});



// Normalize property shortcuts
hAzzle.forOwn({
    font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
    padding: hAzzle.map(directions, function(dir) {
        return "padding" + dir;
    }),
    margin: hAzzle.map(directions, function(dir) {
        return "margin" + dir;
    }),
    "border-width": directions.map(function(dir) {
        return "border" + dir + "Width";
    }),
    "border-style": directions.map(function(dir) {
        return "border" + dir + "Style";
    })
}, function(key, props) {

    cssStyles.get[key] = function(style) {
        var result = [],
            hasEmptyStyleValue = function(prop, index) {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
    };
    cssStyles.set[key] = function(style, value) {
        if (value && "cssText" in style) {
            // normalize setting complex property across browsers
            style.cssText += ";" + key + ":" + value;
        } else {
            props.forEach(function(name) {
                return style[name] = typeof value === "number" ? value + "px" : value.toString();
            });
        }
    };
});