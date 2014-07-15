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

describe('hAzzle([...]).each()', function () {
  it('check if each function works', function () {

    var contextObjIsValue = true,
      hAzzleObj1 = null,
      array1 = [10, 20, 30, 40, 50, 60],
      array2 = [],
      keys = [],
      hAzzleObj2 = hAzzle(array1).each(function (value, index, hObj) {
        hAzzleObj1 = hObj;
        array2.push(value)
        keys.push(String(index));

        if (this.valueOf() !== value) {
          contextObjIsValue = false;
        }
      });

    expect(array1).to.deep.equal(array2);

    expect(Object.keys(array1)).to.deep.equal(keys);

    expect(hAzzleObj1).to.be.equal(hAzzleObj2);

    expect(hAzzleObj1.__proto__).to.be.equal(hAzzle.Core);

    expect(contextObjIsValue).to.be.true;

  });
});

describe('hAzzle([...]).map()', function () {
  it('check if each function works', function () {

    var thisArg = null,
      array1 = [10, 20, 30, 40, 50, 60],
      array2 = [20, 40, 60, 80, 100, 120],
      keys = [],
      array3 = hAzzle(array1).map(function (value, index) {
        keys.push(String(index));
        thisArg = this;
        return value * 2;
      });

    expect(array3).to.deep.equal(array2);

    expect(Object.keys(array1)).to.deep.equal(keys);

    expect(thisArg.__proto__).to.be.equal(hAzzle.Core);

  });
});