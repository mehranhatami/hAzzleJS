

hAzzle.fn.extend({



    /**
     * Remove all childNodes from an element
     *
     * @return {Object}
     */

    empty: function () {

        return this.removeData().each(function () {

            this.textContent = "";
        });
    },
	
	
	 /**
     *  Remove an element from the DOM
     */

    remove: function () {
        return this.removeData().each(function () {
			
		// Locate all nodes that belong to this element
			
		  var elements = hAzzle(this).find('*');
		      elements  = elements.add(this);

		// Remove all attached event handlers
		hAzzle.each(elements, function() {
			hAzzle.event.remove(this);
		});

            if (this.parentNode)
                this.parentNode.removeChild(this)
        })
    },

    /**
     * Create a deep copy of the element and it's children
     *
     * TODO!!
     *
     *  - Use documentfrag
     *  - Clone data
     *  - Clone events
     */

    clone: function () {
        return this.map(function () {
            return this.cloneNode(true);
        });
    }
});