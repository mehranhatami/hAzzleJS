/**
 *  TODO!!!
 *
 * Clone data and events
 *
 * This is easy, but I will never use this "clone" function, so I will probably never finish it:)
 * That's why I put it in a separate module!!
 *
 * If you want to finish this. Here is how it goes:
 *
 *  - In events module
 *
 *   - create data on the element.
 *   - Copy the data you need for the type, handler etc into the array.
 *   - Check if data allready saved, if so, add new data to data elem on element
 *
 *  When you remove event handler with "off", loop through the array and remove the handler from
 *  the array.
 *
 * Now, you have all info about all events for current element. All you have to do now is to
 * make a loop in this function and add all output onto the cloned elements.
 *
 * - Data
 *
 *  There is allready a function - hAzzle.getAllData(  elem ) - you can use to gather all data
 * saved on the element.
 *
 * Run that function first, then do a loop again and add new data to the cloned element.
 *
 *
 * - Animation
 *
 * There is already data on the element for running animation. I suggest stop all aniations before cloning!!
 *
 *
 * Extra features:
 *
 * - hot cloning.  Say you have an element with running animation. You click a button, and "whola" the element
 *   are cloned, and two animations are now runnon because you cloned it :)
 *
 */
// Support: IE >= 9
function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();

    // Fails to persist the checked state of a cloned checkbox or radio button.
    if (nodeName === "input" && rcheckableType.test(src.type)) {
        dest.checked = src.checked;

        // Fails to return the selected option to the default selected state when cloning options
    } else if (nodeName === "input" || nodeName === "textarea") {
        dest.defaultValue = src.defaultValue;
    }
}

function getAll(context, tag) {
    var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") :
        context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];

    return tag === undefined || tag && hAzzle.nodeName(context, tag) ?
        hAzzle.merge([context], ret) :
        ret;
}

hAzzle.fn.extend({

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

        var clone,
            srcElements, destElements;

        return this.map(function (elem) {

            // Copy the events from the original to the clone

            clone = elem.cloneNode(true);

            destElements = getAll(clone);
            srcElements = getAll(elem);

            for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
            }
            return clone;
        });
    }
});