 var data = {};

 /**
  * Store data on an element
  */

 function set(element, key, value) {
     var id = hAzzle.getUID(element),
         obj = data[id] || (data[id] = {});
     obj[key] = value;
 }

 /**
  * Get data from an element
  */

 function get(element, key) {
     var obj = data[hAzzle.getUID(element)];
     if (key === null) {
         return obj;
     }
     return obj && obj[key];
 }

 /**
  * Check if an element contains any data
  */

 function has(element, key) {
     var obj = data[hAzzle.getUID(element)];
     if (key === null) {
         return false;
     }
     if (obj && obj[key]) return true;
 }

 /**
  * Remove data from an element
  */

 function remove(element, key) {
     var obj = data[hAzzle.getUID(element)];

     if (!key) {

         /* FIX ME !!
  
     If no key, need to find all data on the element, and reomve data without knowing the key 
    */

         return false;
     }
     delete obj[key];

 }

 hAzzle.extend({

     /**
      * Check if an element contains data
      *
      * @param{String/Object} elem
      * @param{String} key
      */
     hasData: function (elem, key) {

         if (elem instanceof hAzzle) {
             if (has(elem, key)) return true;
         } else if (has(hAzzle(elem)[0], key)) return true;
         return false;
     },

     /**
      * Remove data from an element
      */
     removeData: function (elem, key) {
         if (elem instanceof hAzzle) {
             if (remove(elem, key)) return true;
         } else if (remove(hAzzle(elem)[0], key)) return true;
         return false;
     },
	 
	 data: function (elem, key, value) {
         return hAzzle.isDefined(value) ? set(elem, key, value) : get(elem, key);
     }
 });

 hAzzle.fn.extend({

     /**
      * Remove attributes from element collection
      *
      * @param {String} key
      *
      * @return {Object}
      */

     removeData: function (key) {
         this.each(function () {
             remove(this, key);
         });
         return this;
     },

     /**
      * Store random data on the hAzzle Object
      *
      * @param {String} obj
      * @param {String|Object} value
      *
      * @return {Object|String}
      *
      *
      * IN THE FUTURE:
      * =============
      *
      * Add option for saving and restoring data with objects
      *
      */

     data: function (key, value) {
         return hAzzle.isDefined(value) ? (this.each(function () {
             // Sets multiple values
             set(this, key, value);
         }), this) : this.elems.length === 1 ? get(this.elems[0], key) : this.elems.map(function (value) {
             // Get data from an single element in the "elems" stack
             return get(value, key);
         });
     }

 });