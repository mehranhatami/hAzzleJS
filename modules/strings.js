    // Whitespace regexp for hAzzle.trim()
   var hTrwl = /^\s+|\s+$/g,
       hHyphenate = /[A-Z]/g,
       hCapitalize = /\b[a-z]/g,

       camelCache = [];

   hAzzle.extend({
       capitalize: function(str) {
           return str.replace(hCapitalize, function(match) {
               return match.toUpperCase();
           });
       },
       // Convert camelCase to  CSS-style
       // e.g. boxSizing -> box-sizing

       hyphenate: function(str) {
           return str.replace(hHyphenate, function(match) {
               return ('-' + match.charAt(0).toLowerCase());
           });
       },

       /**
        *  Convert dashed to camelCase
        *
        * @param {string} str
        * @return {string}
        */

       camelize: function(str) {
           if (!str) return;
           return camelCache[str] ? camelCache[str] :
               camelCache[str] = str.replace(/-\D/g, function(match) {
                   return match.charAt(1).toUpperCase();
               });
       },

       /**
        * Remove leading and trailing whitespaces of the specified string.
        *
        * @param{String} str
        * @return{String}
        */

       trim: function(str) {
           return String.prototype.trim ? (typeof str === 'string' ? str.trim() : str) :
               str.replace(hTrwl, '');
       },

   }, hAzzle);