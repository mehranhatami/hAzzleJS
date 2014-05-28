/*global describe, it */
'use strict';

(function () {
  describe('hAzzle selector engine', function () {
    it('Check if it finds main html tag', function () {
      expect(hAzzle("html").length).toBe(1);
    });
    it('Check if it finds html, head, body tags', function () {
      expect(hAzzle("html, head, body").length).toBe(3);
    });
  });
})();