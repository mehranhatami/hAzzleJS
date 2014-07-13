var expect = chai.expect;


describe('hAzzle.isNumeric()', function () {
  it('check for a a number', function () {

    expect(hAzzle.isNumeric("str")).to.be.false;
    expect(hAzzle.isNumeric(20)).to.be.true;

  });
});