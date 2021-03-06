var handler = require('../request-handler');
var expect = require('chai').expect;
var stubs = require('./Stubs');
const querystring = require('querystring');

// Conditional async testing, akin to Jasmine's waitsFor()
// Will wait for test to be truthy before executing callback
var waitForThen = function (test, cb) {
  setTimeout(function() {
    test() ? cb.apply(this) : waitForThen(test, cb);
  }, 5);
};

describe('Node Server Request Listener Function', function() {
  it('Should answer GET requests for /classes/messages with a 200 status code', function() {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an object', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('object');
    expect(res._ended).to.equal(true);
  });

  it('Should send an object containing a `results` array', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.have.property('results');
    expect(parsedBody.results).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  xit('Should accept posts to /classes/room', function() {
    var stubMsg = {
      username: 'Jono',
      message: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/room', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    // Testing for a newline isn't a valid test
    // TODO: Replace with with a valid test
    console.log('POST DATA SERVERSPEC: ' + JSON.stringify(res._data));
    expect(res._data).to.equal(JSON.stringify({ results: 'Successful POST' }));
    expect(res._ended).to.equal(true);
  });

  xit('Should respond with messages that were previously posted', function() {
    var stubMsg = {
      username: 'Jono',
      message: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data).results;
    
    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });


  it('Should 404 when asked for a nonexistent file', function() {
    var req = new stubs.request('/arglebargle', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Wait for response to return and then check status code
    waitForThen(
      function() { return res._ended; },
      function() {
        expect(res._responseCode).to.equal(404);
      });
  });

  it('Should return results in ascending order by date when order=-createdAt is specified', function() {

    req = new stubs.request('/classes/messages?order=-createdAt', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);
    var messages = JSON.parse(res._data).results
    console.log('MESSAGES ' + messages);
    expect(messages[0].username).to.equal('George');
    expect(messages[1].username).to.equal('Jono');
    expect(messages[2].username).to.equal('Joe');
  })

  it('Should return results in descending order by name when order=username is specified', function() {

    req = new stubs.request('/classes/messages?order=username', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);
    var messages = JSON.parse(res._data).results
    console.log('MESSAGES ' + JSON.stringify(messages));
    expect(messages[0].username).to.equal('George');
    expect(messages[1].username).to.equal('Joe');
    expect(messages[2].username).to.equal('Jono');
  })

  it('Should return results in descending order by name when order=username is specified', function() {

    req = new stubs.request('/classes/messages?order=-username', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);
    var messages = JSON.parse(res._data).results
    console.log('MESSAGES ' + JSON.stringify(messages));
    expect(messages[2].username).to.equal('George');
    expect(messages[1].username).to.equal('Joe');
    expect(messages[0].username).to.equal('Jono');
  })

});
