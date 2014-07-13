var expect = chai.expect,
  global = this;

describe('hAzzle.hasClass()', function () {
  it('check for a css class', function () {
    var hzlGlobal = hAzzle(global);
    expect(hzlGlobal.hasClass("testClass")).to.be.false;
  });
});