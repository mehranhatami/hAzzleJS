hAzzle.extend({

    // A global GUID counter for objects

    UID: 1,

    /**
	 * Set / Get Unique ID
	 *
	 * @param {Object|Boolean} elem
	 * @param {String} name
	 * @return {Number|Object}
	 */ 

    getID: function(elem, name) {


        name = name || 'hAzzle_';

        if (typeof elem === 'boolean') {
            return hAzzle.UID++;

        } else { // Attach the UID directly on a Object
		
        // Always return 0 if el === window

        //     if (elem === window) {
        //                return 0;
        //         }

            if (typeof elem.hAzzleID === 'undefined') {
                elem.hAzzleID = name + hAzzle.UID++;
            }
            return elem.hAzzleID;
        }
    }

}, hAzzle);