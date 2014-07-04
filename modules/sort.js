/**
 * sortOrder
 */
 
 // Need this for CSS4 selectors

var sO = hAzzle.Jiesa.sortOrder = function( a, b ) {
		// Flag for duplicate removal
		if ( a === b ) {
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ) {

				// Choose the first element that is related to our document
				if ( a === document || hAzzle.contains(document, a) ) {
					return -1;
				}
				if ( b === document || hAzzle.contains(document, b) ) {
					return 1;
				}

				// Maintain original order
				return 0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	};

hAzzle.Jiesa.combine = function (a, b, aRest, bRest, map) {
    var i, j, r;
    r = [];
    i = 0;
    j = 0;

    while (i < a.length && j < b.length) {
      switch (map[sO(a[i], b[j])]) {
        case -1:
          i++;
          break;
        case -2:
          j++;
          break;
        case 1:
          r.push(a[i++]);
          break;
        case 2:
          r.push(b[j++]);
          break;
        case 0:
          r.push(a[i++]);
          j++;
      }
    }
    if (aRest) {
      while (i < a.length) {
        r.push(a[i++]);
      }
    }
    if (bRest) {
      while (j < b.length) {
        r.push(b[j++]);
      }
    }
    return r;
  };