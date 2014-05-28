/*global describe, it */
'use strict';

(function () {
  describe('Give it some context', function () {
    describe('maybe a bit more context here', function () {
      it('Check if it exists', function () {
        expect(typeof (hAzzle) === 'function').toBeTruthy();
      });
    });
  });

  describe('hAzzle.hasClass()', function () {
    it('check for a css class', function () {
      var hzlGlobal = hAzzle(document.body);
      expect(hzlGlobal.hasClass('testClass')).toBeFalsy();
    });
  });

  describe('hAzzle.isNumeric()', function () {
    it('check if isNumeric works correctly', function () {
      expect(hAzzle.isNumeric("str")).toBeFalsy();
      expect(hAzzle.isNumeric("20")).toBeTruthy();
      expect(hAzzle.isNumeric(200)).toBeTruthy();
    });
  });
})();