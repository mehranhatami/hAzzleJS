var cahce = [], timeout;

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

		// Discard any data on the element

        return this.removeData().each(function () {
			
		// Locate all nodes that belong to this element
			
		  var elements = hAzzle(this).find('*');
		      elements  = elements.add(this);

		// Remove all attached event handlers
		
		hAzzle.each(elements, function() {
			hAzzle.event.remove(this);
		});
        
		// Remove all parent nodes
        if (this.parentNode)
          if(this.tagName === 'IMG'){
          cache.push(this)
          this.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
          if (timeout) clearTimeout(timeout)
          timeout = setTimeout(function(){ cache = [] }, 60000)
        }		
        this.parentNode.removeChild(this)
       })
    }
});



