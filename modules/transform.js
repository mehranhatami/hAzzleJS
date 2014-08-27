// transform.js

var transformRegex = {
    rAffine: /^\s*matrix\(\s*1\s*,\s*0\s*,\s*0\s*,\s*1\s*(?:,\s*0(?:px)?\s*){2}\)\s*$/,
    toarray: /([^,]*),([^,]*),([^,]*),([^,]*),([^,p]*)(?:px)?,([^)p]*)(?:px)?/
};

// Create the hAzzle.fxHook 

hAzzle.fxHooks.transform = 

  
  {
	  
	  set:
	  
  function(fx) {
    var elem = fx.elem,
        style = elem.style,
        start = fx.start,
        end = fx.end,
        pos = fx.pos,
        transform = '',
        precision = 1E5,
        i, startVal, endVal, unit;

    if (!start || 
	    typeof start === 'string') {

        // Replace '+=' in relative animations (-= is meaningless with transforms)
		
        end = end.split('+=').join(start);

        // Parse both transform to generate interpolation list of same length
		
        hAzzle.shallowCopy(fx, interpolationList(start, end));
        start = fx.start;
        end = fx.end;
    }

    i = start.length;

    // interpolate functions of the list one by one
    while (i--) {
        
		startVal = start[i];
        endVal = end[i];
        unit = +false;

        if (startVal[0] === 'translate') {
            unit = 'px';
        }

        if (startVal[0] === 'scale') {
            unit || (unit = '');
            transform = startVal[0] + '(' +
                Math.round((startVal[1][0] + (endVal[1][0] - startVal[1][0]) * pos) * precision) / precision + unit + ',' +
                Math.round((startVal[1][1] + (endVal[1][1] - startVal[1][1]) * pos) * precision) / precision + unit + ')' +
                transform;
        }

        if (startVal[0] === 'skewX' ||
            startVal[0] === 'skewY' ||
            startVal[0] === 'rotate') {

            transform = startVal[0] + '(' +
                Math.round((startVal[1] + (endVal[1] - startVal[1]) * pos) * precision) / precision + 'rad)' +
                transform;
        }
    }

    style[hAzzle.cssCore.transform] = transform;
}	
};

/* ============================ UTILITY METHODS =========================== */

// Turns a transform string into its 'matrix(A,B,C,D,X,Y)' form

function matrix(transform) {

    transform = transform.split(')');

    var trim = hAzzle.trim,
        i = -1,
        // last element of the array is an empty string, get rid of it
        l = transform.length - 1,
        split, prop, val, prev = [],
        curr = [],
        rslt = [1, 0, 0, 1, 0, 0];

    prev[0] = prev[3] = rslt[0] = rslt[3] = 1;
    prev[1] = prev[2] = prev[4] = prev[5] = 0;

    // Loop through the transform properties, parse and multiply them
    while (++i < l) {
        split = transform[i].split('(');
        prop = trim(split[0]);
        val = split[1];
        curr[0] = curr[3] = 1;
        curr[1] = curr[2] = curr[4] = curr[5] = 0;

        if (prop === 'translateX') {
            curr[4] = parseInt(val, 10);
        }

        if (prop === 'translateY') {
            curr[5] = parseInt(val, 10);
        }

        if (prop === 'translate') {
            val = val.split(',');
            curr[4] = parseInt(val[0], 10);
            curr[5] = parseInt(val[1] || 0, 10);
        }

        if (prop === 'rotate') {
            val = toRadian(val);
            curr[0] = Math.cos(val);
            curr[1] = Math.sin(val);
            curr[2] = -Math.sin(val);
            curr[3] = Math.cos(val);
        }

        if (prop === 'scaleY') {
            curr[3] = val;
        }

        if (prop === 'scale') {
            val = val.split(',');
            curr[0] = val[0];
            curr[3] = val.length > 1 ? val[1] : val[0];
        }

        if (prop === 'skewX') {
            curr[2] = Math.tan(toRadian(val));
        }

        if (prop === 'skewY') {
            curr[1] = Math.tan(toRadian(val));
        }

        if (prop === 'matrix') {
            val = val.split(',');
            curr[0] = val[0];
            curr[1] = val[1];
            curr[2] = val[2];
            curr[3] = val[3];
            curr[4] = parseInt(val[4], 10);
            curr[5] = parseInt(val[5], 10);
        }

        // Matrix product (array in column-major order)
        rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
        rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
        rslt[2] = prev[0] * curr[2] + prev[2] * curr[3];
        rslt[3] = prev[1] * curr[2] + prev[3] * curr[3];
        rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
        rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];

        prev = [rslt[0], rslt[1], rslt[2], rslt[3], rslt[4], rslt[5]];
    }
    return rslt;
}

// Turns a matrix into its rotate, scale and skew components
// Algorithm from http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp

function unmatrix(matrix) {
    var scaleX, scaleY, skew, A = matrix[0],
        B = matrix[1],
        C = matrix[2],
        D = matrix[3];

    // Make sure matrix is not singular
    if (A * D - B * C) {

        // Step 3

        scaleX = Math.sqrt(A * A + B * B);

        A /= scaleX;
        B /= scaleX;

        // Step 4

        skew = A * C + B * D;
        C -= A * skew;
        D -= B * skew;

        // Step 5

        scaleY = Math.sqrt(C * C + D * D);
        C /= scaleY;
        D /= scaleY;
        skew /= scaleY;

        // Step 6

        if (A * D < B * C) {
            A = -A;
            B = -B;
            skew = -skew;
            scaleX = -scaleX;
        }

    } else {

        // In this case the elem shouldn't be rendered, hence scale == 0

        scaleX = scaleY = skew = 0;
    }

    // The recomposition order is very important
    // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
    return [
        ['translate', [+matrix[4], +matrix[5]]],
        ['rotate', Math.atan2(B, A)],
        ['skewX', Math.atan(skew)],
        ['scale', [scaleX, scaleY]]
    ];
}

// Build the list of transform functions to interpolate
// Use the algorithm described at http://dev.w3.org/csswg/css3-2d-transforms/#animation

function interpolationList(start, end) {

    var list = {
            start: [],
            end: []
        },
        i = -1,
        l, currStart, currEnd, currType;

    // Get rid of affine transform matrix

    (start == 'none' || isA(start)) && (start = '');
    (end == 'none' || isA(end)) && (end = '');

    // If end starts with the current computed style, this is a relative animation
    // Store computed style as the origin, remove it from start and end

    if (start && end && !end.indexOf('matrix') && toArray(start).join() == toArray(end.split(')')[0]).join()) {
        list.origin = start;
        start = '';
        end = end.slice(end.indexOf(')') + 1);
    }

    if (!start && !end) {
        return;
    }

    // Start or end are affine, or list of transform functions are identical
    // => functions will be interpolated individually

    if (!start || !end || functionList(start) == functionList(end)) {

        start && (start = start.split(')')) && (l = start.length);
        end && (end = end.split(')')) && (l = end.length);

        while (++i < l - 1) {
            start[i] && (currStart = start[i].split('('));
            end[i] && (currEnd = end[i].split('('));
            currType = hAzzle.trim((currStart || currEnd)[0]);

            append(list.start, parseFunction(currType, currStart ? currStart[1] : 0));
            append(list.end, parseFunction(currType, currEnd ? currEnd[1] : 0));
        }

        // Otherwise, functions will be composed to a single matrix

    } else {

        list.start = unmatrix(matrix(start));
        list.end = unmatrix(matrix(end));
    }

    return list;
}

function parseFunction(type, value) {

    var

    // Default value is 1 for scale, 0 otherwise

        defaultValue = +(!type.indexOf('scale')),
        scaleX,

        // Remove X/Y from scaleX/Y & translateX/Y, not from skew

        cat = type.replace(/e[XY]/, 'e');

    if (type === 'translateY' ||
        type === 'scaleY') {

        value = [
            defaultValue,
            value ?
            parseFloat(value) :
            defaultValue
        ];
    }

    if (type === 'translateX' ||
        type === 'translate' ||
        type === 'scaleX'
    ) {

        scaleX = 1;
    }

    if (type === 'scale') {

        value = value ?
            (value = value.split(',')) && [
                parseFloat(value[0]),
                parseFloat(value.length > 1 ? value[1] : type == 'scale' ? scaleX || value[0] : defaultValue + '')
            ] : [defaultValue, defaultValue];
    }


    if (type === 'skewX' ||
        type === 'skewY' ||
        type === 'rotate'
    ) {
        value = value ? toRadian(value) : 0;
    }

    if (type === 'matrix') {
        return unmatrix(value ? toArray(value) : [1, 0, 0, 1, 0, 0]);
    }


    return [
        [cat, value]
    ];
}

function isA(matrix) {
    return transformRegex.rAffine.test(matrix);
}

function functionList(transform) {
    return transform.replace(/(?:\([^)]*\))|\s/g, '');
}

function append(arr1, arr2, value) {
    while (value = arr2.shift()) {
        arr1.push(value);
    }
}

// Cconverts an angle string in any unit to a radian Float
function toRadian(value) {
    return ~value.indexOf('deg') ?
        parseInt(value, 10) * (Math.PI * 2 / 360) :
        ~value.indexOf('grad') ?
        parseInt(value, 10) * (Math.PI / 200) :
        parseFloat(value);
}

// Converts 'matrix(A,B,C,D,X,Y)' to [A,B,C,D,X,Y]
function toArray(matrix) {
    // remove the unit of X and Y for Firefox
    matrix = transformRegex.toarray.exec(matrix);
    return [matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6]];
}
