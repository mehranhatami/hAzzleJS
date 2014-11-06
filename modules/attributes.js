// attributes.js
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.include([
    'has',
    'setters'
], function(_has, _setters) {

    var

        getElem = function(elem) {
            if (elem instanceof hAzzle) {
                return elem.elements;
            }
            return elem;

        },

        SVGAttributes = 'width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2',
        SVGAttribute = function(prop) {

            if (_has.ie || (_has.has('android') && !_has.has('chrome'))) {
                SVGAttributes += '|transform';
            }

            return new RegExp('^(' + SVGAttributes + ')$', 'i').test(prop);
        },

        // Toggle attributes        

        toggleAttr = function(elem, attr, force) {

            elem = getElem(elem);

            typeof force == 'boolean' || (force = null == _setters.attr(elem, attr) === false);

            var opposite = !force;

            force ? _setters.attr(elem, attr, '') : _setters.removeAttr(elem, attr);

            return elem[attr] === opposite ? elem[attr] = force : force;
        };

    //  Check if  element has an attribute

    this.hasAttr = function(name) {
        return name && typeof this.attr(name) !== 'undefined';
    };

    return {
        SVGAttribute: SVGAttribute,
        toggleAttr: toggleAttr
    };
});
