var expect = chai.expect,
  global = this;

describe('Test engine test', function () {
  it('Check if test engine works', function () {
    expect(1).to.equal(1);
  });
});

describe('hAzzle()', function () {
  it('Check if it exists', function () {
    expect(typeof (hAzzle) === 'function').to.equal(true);
  });
});

describe('hAzzle.hasClass()', function () {
  it('check for a css class', function () {
    var hzlGlobal = hAzzle(global);
    expect(hzlGlobal.hasClass("testClass")).to.equal(false);
  });
});

describe('hAzzle.isNumeric()', function () {
  it('check for a a number', function () {
    expect(hAzzle.isNumeric("str")).to.equal(false);
    expect(hAzzle.isNumeric(20)).to.equal(true);
  });
});