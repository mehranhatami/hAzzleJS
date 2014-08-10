hAzzle.extend({

    any: function(fn, context) {
        var self = this,
            l = self.length,
            i = 0;
        for (; i < l; i++) {

            if (fn.call(context, self[i], i, self)) {
                return true;
            }
        }
        return false;
    },

    /** 
     * Iterates over the array and returns a newArray with the items for which
     * fn(item, index, array) returned false
     */

    reject: function(fn, context) {
        var self = this,
            filtered = [],
            i = 0,
            length = self.length,
            cache;

        if (arguments.length > 1) {
            for (; i < length; i++) {
                cache = self[i];
                if (!fn.call(context, cache, i, self)) {

                    filtered.push(cache);
                }
            }
        } else {

            for (; i < length; i++) {

                cache = self[i];

                if (!fn(cache, i, self)) {

                    filtered.push(cache);
                }
            }
        }
        return hAzzle(filtered);
    },

    /**
     * Returns a new Array removing `false`, `null`, `undefined` & `[]` from the array.
     */
    clean: function() {
        var self = this,
            cleaned = [],
            index = 0,
            length = self.length,
            item;

        for (; index < length; index++) {
            item = self[index];
            if (typeof item != 'number' && !item) {
                continue;
            }
            if (hAzzle.isArray(item) && item.length === 0) {
                continue;
            }
            cleaned.push(item);
        }
        return hAzzle(cleaned);
    }
});