// prophooks.js
hAzzle.include([
    'util',
    'setters'
], function(_util, _setters) {

    _util.mixin(_setters.propHooks.get, {
        'tabIndex': function(elem) {
            return elem.hasAttribute('tabindex') ||
                /^(?:input|select|textarea|button)$/i.test(elem.nodeName) || elem.href ?
                elem.tabIndex :
                -1;
        }
    });

    // Support: IE<=11+
    // Must access selectedIndex to make default options select

    var select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option'));

    if (!opt.selected) {
        _setters.propHooks.get.selected = function(elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
            }
            return null;
        };
    }
    return {};
});
