; (function ($) {

// Contains: Empty() and Remove()

   var timeout;

  $.extend($.fn, {

    /**
     * Remove all child nodes of the set of matched elements from the DOM.
     *
     * @return {Object}
     */

    empty: function () {
       
	   // Remove all data to prevent memory leaks
	   
        return this.removeData().each(function (_, elem) {

         if ( $.nodeType(1, elem)) {
			 
		 // Remove all event handlers
		
			$.Events.remove(elem);
			
		 // Remove any remaining nodes
        
		 elem.textContent = "";
		 }
        });
    },
	
	 /**
     *  Remove an element from the DOM
     */

    remove: function () {

		// Discard any data on the element

        return this.removeData().each(function (_, elem) {
			
		// Locate all nodes that belong to this element
		// and add them to the "elems stack"
			
		  var elements = $(elem).find('*');
		      elements  = elements.add(elem);

	    // Remove all event handlers
		
		$.each(elements, function() {
			$.Events.remove(elem);
		});
        
		 var parent = elem.parentNode;
		 
        if (parent) {
          
		  // Slowly fadeOut and remove all images		
          
		  if(elem.tagName === 'IMG'){

          // Push to cache stack 

		  cache.push(elem)
          
		  // Set image to blank
		  
		  elem.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
          if (timeout) clearTimeout(timeout)
          timeout = setTimeout(function(){ cache = [] }, 60000)
        }		

		// Remove all children

	     elem.parentNode.removeChild(elem);
		}
        
       })
	   return false;
    }
});



})(hAzzle);