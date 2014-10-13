(function () {
  var expect = chai.expect,
    _types = hAzzle.require('Types'),
    typeChecks = {
      'File': null,
      'Blob': null,
      'RegExp': null,
      'Arguments': null,
      'Function': null,
      'Date': null,
      'Array': null,
      'Empty': null,
      'Window': null,
      'Object': null,
      'EmptyObject': null,
      'Node': null,
      'Element': null,
      'String': null,
      'ArrayLike': null,
      'Number': null,
      'Boolean': null,
      'NaN': null,
      'Defined': null,
      'Undefined': null
    };

  function testTypeCheckFunction(typeName) {
    it('hAzzle.is' + typeName + '(obj)', function () {
      expect(_types['is' + typeName]).to.be.a('function');
      //check if it works
    });
  }

  describe('hAzzle -> Types', function () {
    var i = 0,
      keys = Object.keys(typeChecks),
      len = keys.length;

    it('Types -> type(...)', function () {
      expect(_types.type).to.be.a('function');
    });

    for (; i < len; i += 1) {
      testTypeCheckFunction(keys[i]);
    }

  });
}());
