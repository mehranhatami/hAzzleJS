// uniqueid.js

function tamperFix(node, name) {
    var tmp = node.hiD.replace(name, '');
	// The counter should be a number
    if (typeof tmp !== 'number') {
        // set a new valid number
        node.hiD = name + hAzzle.UID++;
    }
    return node.hiD;
}

// A global UID counter for objects

hAzzle.UID = 1;

    /**
     * Set / Get Unique ID
     *
     * @param {Object|Boolean} node
     * @param {String} name
     * @return {Number|Object}
     */

hAzzle.getID = function(node, name, /* OPTIONAL */ exposed) {

        name = name || 'hAzzle_';

        // if boolean true / false value, we are returning
        // a new UID without attaching it to a object

        if (typeof node === 'boolean') {
            return hAzzle.UID++;
        } else if (typeof node === 'object') {

            // If 'exposed' are true, we are setting the UID as
            // an attribute value on the node,
			// This could be tampered with

            if (exposed) {

                // Try to get the id

                var uid = node.getAttribute(hAzzle.UID);

                if (!uid) {

                    uid = hAzzle.UID++;

                    // Set the new ID

                    node.setAttribute(name, uid);
                }

                return uid;
            }

            if (typeof node.hiD === 'undefined') {

                // Attach the UID directly on a Object

                node.hiD = name + hAzzle.UID++;
            }

            // tamperFix(node, name);

            return node.hiD;
        }

        // If no boolean or Object, return false;

        return false;
    };
