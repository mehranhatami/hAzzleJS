// bezier.js

 // Bezier curve function generator. 
 // Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License
 
 function generateBezier(mX1, mY1, mX2, mY2) {
     var NEWTON_ITERATIONS = 4,
         NEWTON_MIN_SLOPE = 0.001,
         SUBDIVISION_PRECISION = 0.0000001,
         SUBDIVISION_MAX_ITERATIONS = 10,
         kSplineTableSize = 11,
         kSampleStepSize = 1.0 / (kSplineTableSize - 1.0),
         float32ArraySupported = 'Float32Array' in window;

     /* Must contain four arguments. */
     if (arguments.length !== 4) {
         return false;
     }

     /* Arguments must be numbers. */
     for (var i = 0; i < 4; ++i) {
         if (typeof arguments[i] !== 'number' || isNaN(arguments[i]) || !isFinite(arguments[i])) {
             return false;
         }
     }

     /* X values must be in the [0, 1] range. */
     mX1 = Math.min(mX1, 1);
     mX2 = Math.min(mX2, 1);
     mX1 = Math.max(mX1, 0);
     mX2 = Math.max(mX2, 0);

     var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

     function A(aA1, aA2) {
         return 1.0 - 3.0 * aA2 + 3.0 * aA1;
     }

     function B(aA1, aA2) {
         return 3.0 * aA2 - 6.0 * aA1;
     }

     function C(aA1) {
         return 3.0 * aA1;
     }

     function calcBezier(aT, aA1, aA2) {
         return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
     }

     function getSlope(aT, aA1, aA2) {
         return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
     }

     function newtonRaphsonIterate(aX, aGuessT) {
         for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
             var currentSlope = getSlope(aGuessT, mX1, mX2);

             if (currentSlope === 0.0) return aGuessT;

             var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
             aGuessT -= currentX / currentSlope;
         }

         return aGuessT;
     }

     function calcSampleValues() {
         for (var i = 0; i < kSplineTableSize; ++i) {
             mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
         }
     }

     function binarySubdivide(aX, aA, aB) {
         var currentX, currentT, i = 0;

         do {
             currentT = aA + (aB - aA) / 2.0;
             currentX = calcBezier(currentT, mX1, mX2) - aX;
             if (currentX > 0.0) {
                 aB = currentT;
             } else {
                 aA = currentT;
             }
         } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

         return currentT;
     }

     function getTForX(aX) {
         var intervalStart = 0.0,
             currentSample = 1,
             lastSample = kSplineTableSize - 1;

         for (; currentSample != lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
             intervalStart += kSampleStepSize;
         }

         --currentSample;

         var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]),
             guessForT = intervalStart + dist * kSampleStepSize,
             initialSlope = getSlope(guessForT, mX1, mX2);

         if (initialSlope >= NEWTON_MIN_SLOPE) {
             return newtonRaphsonIterate(aX, guessForT);
         } else if (initialSlope == 0.0) {
             return guessForT;
         } else {
             return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
         }
     }

     var _precomputed = false;

     function precompute() {
         _precomputed = true;
         if (mX1 != mY1 || mX2 != mY2) calcSampleValues();
     }

     var f = function(aX) {
         if (!_precomputed) precompute();
         if (mX1 === mY1 && mX2 === mY2) return aX;
         if (aX === 0) return 0;
         if (aX === 1) return 1;

         return calcBezier(getTForX(aX), mY1, mY2);
     };

     f.getControlPoints = function() {
         return [{
             x: mX1,
             y: mY1
         }, {
             x: mX2,
             y: mY2
         }];
     };

     var str = 'generateBezier(' + [mX1, mY1, mX2, mY2] + ')';
     f.toString = function() {
         return str;
     };

     return f;
 }

 // Expose
 hAzzle.generateBezier = generateBezier;

 // Holder for bezier easings
 hAzzle.bezier = {}

 hAzzle.each(
     [
         ['easeNoneLinear', [0.075, 0.82, 0.165, 1]],
         ['easeInLinear', [0.075, 0.82, 0.165, 1]],
         ['easeOutLinear', [0.075, 0.82, 0.165, 1]],
         ['easeInOutLinear', [0.075, 0.82, 0.165, 1]],
         ['ease', [0.25, 0.1, 0.25, 1.0]],
         ['easeIn', [0.42, 0.0, 1.00, 1.0]],
         ['easeOut', [0.00, 0.0, 0.58, 1.0]],
         ['easeInOut', [0.42, 0.0, 0.58, 1.0]],
         ['easeInSine', [0.47, 0, 0.745, 0.715]],
         ['easeOutSine', [0.39, 0.575, 0.565, 1]],
         ['easeInOutSine', [0.445, 0.05, 0.55, 0.95]],
         ['easeInQuad', [0.55, 0.085, 0.68, 0.53]],
         ['easeOutQuad', [0.25, 0.46, 0.45, 0.94]],
         ['easeInOutQuad', [0.455, 0.03, 0.515, 0.955]],
         ['easeInCubic', [0.55, 0.055, 0.675, 0.19]],
         ['easeOutCubic', [0.215, 0.61, 0.355, 1]],
         ['easeInOutCubic', [0.645, 0.045, 0.355, 1]],
         ['easeInQuart', [0.895, 0.03, 0.685, 0.22]],
         ['easeOutQuart', [0.165, 0.84, 0.44, 1]],
         ['easeInOutQuart', [0.77, 0, 0.175, 1]],
         ['easeInQuint', [0.755, 0.05, 0.855, 0.06]],
         ['easeOutQuint', [0.23, 1, 0.32, 1]],
         ['easeInOutQuint', [0.86, 0, 0.07, 1]],
         ['easeInExpo', [0.950, 0.050, 0.795, 0.035]],
         ['easeOutExpo', [0.190, 1.000, 0.220, 1.000]],
         ['easeInOutExpo', [1.000, 0.000, 0.000, 1.000]],
         ['easeInCirc', [0.6, 0.04, 0.98, 0.335]],
         ['easeOutCirc', [0.075, 0.82, 0.165, 1]],
         ['easeInOutCirc', [0.785, 0.135, 0.15, 0.86]]
     ], function(arr) {
         hAzzle.bezier[arr[0]] = generateBezier.apply(null, arr[1]);
     });