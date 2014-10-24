// outerhtml.js
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('html', function() {

    var _manipulation = hAzzle.require('Manipulation'),
        _str = hAzzle.require('Strings'),
        _types = hAzzle.require('Types');

    this.outerHTML = function(value) {

        if (!this.length) {
            return null;
        } else if (value === undefined) {

            var element = (this.length) ? this.elements[0] : this.elements,
                result;

            // Return browser outerHTML (Most newer browsers support it)
            if (element.outerHTML) {
                result = element.outerHTML;
            } else {
                result = hAzzle(_manipulation.createHTML('div')).append(hAzzle(element).clone()).html();
            }

            // Trim the result
            if (typeof result === 'string') {
                result = _str.trim(result);
            }

            return result;

        }
        // Deal with function
        else if (_types.isFunction(value)) {

            this.each(function(elem, index) {
                var $this = hAzzle(elem);
                $this.outerHTML(value.call(elem, index, $this.outerHTML()));
            });

        }
        // Replaces the content
        else {

            var $this = hAzzle(this.elements),
                replacingElements = [],
                $value = hAzzle(value),
                $cloneValue, i = 0,
                x = 0;

            for (; x < $this.length; x++) {

                // Clone the value for each element being replaced
                $cloneValue = $value.clone(true);

                $this.eq(x).replaceWith($cloneValue);

                // Add the replacing content to the collection
                for (; i < $cloneValue.length; i++) {
                    replacingElements.push($cloneValue[i]);
                }
            }

            // Return the replacing content if any
            return (replacingElements.length) ? hAzzle(replacingElements) : null;

        }
    };

    return {};
});