 hAzzle.fn.extend({

     /**
      * Wrap html string with a `div` or wrap special tags with their containers.
      *
      * @param {String} html
      * @return {Object}
      */

     wrap: function (html) {

         var isFunction = hAzzle.isFunction(html);

         return this.each(function (i) {
             hAzzle(this).wrapAll(isFunction(html) ? html.call(this, i) : html);
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

             hAzzle(this[0]).before(html = hAzzle(html, this[0].ownerDocument).eq(0).clone(true));

             var children;
             // drill down to the inmost element
             while ((children = html.children()).length) html = children.first();

             hAzzle(html).append(this);
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
         this.parent().each(function () {
             if (!hAzzle.nodeName(this, "body")) {
                 hAzzle(this).replaceWith(hAzzle(this).children()).remove();
             }
         });
         return this;
     }
 });