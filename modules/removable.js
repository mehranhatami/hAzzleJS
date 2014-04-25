; (function ($) {

    /**
     * Remove all child nodes of the set of matched elements from the DOM.
     *
     * @return {Object}
     */

 $.fn.empty = function () {
       
	   // Remove all data to prevent memory leaks
	   
        return this.removeData().each(function (_, elem) {
			
         if ( $.nodeType(1, this)) {

			$.Events.remove(elem);
			 
		 // Remove any remaining nodes
        
		 this.textContent = "";
		 }
        });
    },
	
	 /**
     *  Remove an element from the DOM
     */
 $.fn.remove = function () {

		// Discard any data on the element

        return this.removeData().each(function (_, elem) {
			
		// Locate all nodes that belong to this element
		// and add them to the "elems stack"
			
		  var elements = $(elem).find('*');
		      elements  = elements.add(elem);
		
			$.Events.remove(elem);
        
		 var parent = elem.parentNode;
		 
        if (parent) {

		// Remove all children

	     this.parentNode.removeChild(elem);
		}
        
       })
	   return false;
    }

})(hAzzle);