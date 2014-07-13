var expect = chai.expect;

describe('hAzzle()', function () {
  it('Check if it exists', function () {
    expect(typeof (hAzzle) === 'function').to.equal(true);
  });
});

describe('hAzzle.forOwn()', function () {
  it('check if forOwn works', function () {

    var obj1 = {
        prop1: 101,
        prop2: 102
      },
      obj2 = {},
      contextObj = {
        arg0: 'arg0'
      },
      contextObjIsThis = false;

    hAzzle.forOwn(obj1, function (value, key) {

      contextObjIsThis = (this === contextObj);

      obj2[key] = value;

    }, contextObj);

    expect(obj1).to.deep.equal(obj2);

    expect(contextObjIsThis).to.be.true;

  });
});