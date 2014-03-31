// CSS

var cssNumber = 'fill-opacity font-weight line-height opacity orphans widows z-index zoom'.split(' ');

hAzzle.fn.extend({

    css: function (name, value) {

        if (hAzzle.isDefined(value)) {
            return this.each(function () {

                if (typeof value == 'number' && cssNumber.indexOf(name) === -1) {
                    value += 'px';
                }

                var action = (value === null || value === '') ? 'remove' : 'set';

                this.style[action + 'Property'](name, '' + value);
            });
        }
        return this[0].style.getPropertyValue(name) || window.getComputedStyle(this[0], null).getPropertyValue(name);

    }
});