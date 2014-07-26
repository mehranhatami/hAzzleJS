// Unique ID
hAzzle.extend({

    // A global GUID counter for objects

    UID: 1,

    /**
     * Set / Get Unique ID
     *
     * @param {Object|Boolean} node
     * @param {String} name
     * @return {Number|Object}
     */

    getID: function(node, name, /* OPTIONAL */ exposed) {

        name = name || 'hAzzle_';

        // if boolean true / false value, we are returning
        // a new UID without attaching it to a object

        if (typeof node === 'boolean') {

            return hAzzle.UID++;

            // If we are dealing with a Object, we are happy :)

        } else if (typeof node === 'object') {

            // If 'exposed' are true, we are setting the UID as
            // an attribute value on the Object

            if (exposed) {

                // Try to get the id

                var uid = node.getAttribute(this.UID);

                if (!uid) {

                    uid = hAzzle.UID++;

                    // Set the new ID

                    node.setAttribute(name, uid);
                }

                return uid;
            }

            if (typeof node.hAzzleID === 'undefined') {

                // Attach the UID directly on a Object

                node.hAzzleID = name + this.UID++;
            }
            return node.hAzzleID;
        }

        // If no boolean or Object, return false;

        return false;
    }

}, hAzzle);