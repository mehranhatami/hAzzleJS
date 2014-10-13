var expect = chai.expect;

describe('hAzzle()', function () {

  it('hAzzle(...)', function () {
    expect(hAzzle).to.be.a('function');
  });

  it('hAzzle.version', function () {
    expect(hAzzle.version).to.be.a('string');
    expect(hAzzle.version).to.equal('1.0.0a-alpha');
  });
  
  it('hAzzle.err', function () {
    var expMessage = null,
      expCode = null;

    expect(hAzzle.err).to.be.a('function');

    try {
      hAzzle.err(true, 'test-code', 'test-message');
    } catch (e) {
      expMessage = e.message;
      expCode = e.code;
    }

    expect(expMessage).to.be.a('string');
    expect(expCode).to.be.a('string');

    expect(expMessage).to.equal('[hAzzle-test-code] test-message');
    expect(expCode).to.equal('test-code');

  });

  it('hAzzle.installed', function () {
    expect(hAzzle.installed).to.be.a('object');

  });

  it('hAzzle.define', function () {
    expect(hAzzle.define).to.be.a('function');
  });

  it('hAzzle.require', function () {
    expect(hAzzle.require).to.be.a('function');
  });

  it('hAzzle.define() && hAzzle.require()', function () {
    var requiredModule;

    function testModule() {};

    hAzzle.define('hAzzleTestModule', function () {
      return testModule;
    });

    expect(hAzzle.installed['hAzzleTestModule']).to.be.true;

    requiredModule = hAzzle.require('hAzzleTestModule');

    expect(requiredModule).to.equal(testModule);

  });
});
