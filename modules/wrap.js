/*!
 * Wrap
 */
; (function ($) {

    $.extend($.fn, {

        /**
         * Wrap html string with a `div` or wrap special tags with their containers.
         *
         * @param {String} html
         * @return {Object}
         */

        wrap: function (html) {

            return this.each(function (i) {
                $(this).wrapAll($.isFunction(html) ? html.call(this, i) : html);
            });
        },

        /**
         *  Wrap an HTML structure around the content of each element in the set of matched elements.
         *
         * @param {String} html
         * @return {Object}
         *
         */

        wrapAll: function (html) {

            if (this[0]) {
                $(this[0]).before(html = $(html));
                var children;
                // drill down to the inmost element
                while ((children = html.children()).length) html = children.first();
                $(html).append(this);
            }
            return this;
        },

        /**
         *  Wrap an HTML structure around the content of each element in the set of matched elements.
         *
         * @param {String} html
         * @return {Object}
         *
         */

        unwrap: function () {
           return this.parent().each(function() {
			if ( !$.nodeName( this, "body" ) ) {
				$( this ).replaceWith( this.childNodes );
			}
		});
        }
    });

})(hAzzle);