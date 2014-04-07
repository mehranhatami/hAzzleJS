
    /**
     * WORK IN PROGRESS!!
     *
     * Working on a new "wrapper" function, and this is totally different from jQuery.
     * It does it's job, but the HTML markup is different.
     *
     * Need to work on the HTML module to get this work 100%
     *
     * In jQuery you can write:
     *
     *     $( "p" ).wrap( "<div></div>" );
     *
     *
     * In hAzzle, this will create a bunch of DIV tags.
     *
     * To get this working in hAzzle, we have to do it like this:
     *
     * $( "p" ).wrap( "div" );
     *
     * And we get the same result.
     *
     * We use hAzzle.HTML () to create our HTML markup
     *
     * My main idea is to simplify everthing.
     *
     */

hAzzle.fn.extend({

    wrap: function (html) {

        var func = hAzzle.isFunction(html)

        if (this[0] && !func) {

        // Create the HTML markup 

       var markup = hAzzle.HTML(html);
	       dom = hAzzle(hAzzle.HTML(markup)).get(0),
           clone = dom.parentNode || this.length > 1;
       }
        return this.each(function (index) {
            hAzzle(this).wrapAll(
                func ? html.call(this, index) :
                clone ? dom.cloneNode(true) : dom
            );
        });
    },

    wrapAll: function (html) {
        if (this[0]) {
            hAzzle(this[0]).before(html = hAzzle(html))
            var children
            // drill down to the inmost element
            while ((children = html.children()).length) html = children.first()
            hAzzle(html).append(this)
        }
        return this
    },

    wrapInner: function (html) {
        var func = hAzzle.isFunction(html)
        return this.each(function (index) {
            var self = hAzzle(this),
                contents = self.contents(),
                dom = func ? html.call(this, index) : html
                contents.length ? contents.wrapAll(dom) : self.append(dom)
        })
    },

    unwrap: function () {

        this.parent().each(function () {
            hAzzle(this).replaceWith(hAzzle(this).children())
        })
        return this
    }
	
	
});	