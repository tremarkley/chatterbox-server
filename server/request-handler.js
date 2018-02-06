var URL = require('url');
const querystring = require('querystring');
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var results = [{objectId: 1, roomname: 'lobby', username: 'Jono', text: 'Do my bidding!', createdAt: Date.now() - 20}, {objectId: 2, roomname: 'lobby', username: 'Joe', text: 'Do my testing!', createdAt: Date.now()}];
var nextId = 3;
var endpoints = {'/classes/messages': true, '/classes/room': true};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};


var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var statusCode = 404;
  if (endpoints[URL.parse(request.url).pathname] !== undefined) {
    if (request.method === 'POST') {
      var currentTime = Date.now();
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', () => {
        try {
          let requestObj = querystring.parse(body);
          console.log('request Obj: ', JSON.stringify(requestObj), 'body: ', JSON.stringify(body));
          requestObj.objectId = nextId;
          requestObj.createdAt = currentTime;
          nextId += 1;
          //let requestObj = JSON.parse(body);
          results.push(requestObj);
          var headers = defaultCorsHeaders;
          statusCode = 201;
          headers['Content-Type'] = 'application/json';
          response.writeHead(statusCode, headers);
          response.end(JSON.stringify({results: 'Successful POST'}));
        } catch (e) {
          console.log('Parse Failed: ' + e);
          var headers = defaultCorsHeaders;
          statusCode = 403;
          headers['Content-Type'] = 'application/json';
          response.writeHead(statusCode, headers);
          response.end(JSON.stringify({results: 'Parse failed: ' + e}));
        }
      });
    } else {
      // The outgoing status.
      statusCode = 200;
      //debugger
      var returnedResults = results;
      let requestObj = request.url;
      let re = /order=-\w+/g;
      let result = requestObj.match(re)[0];
      if (result !== undefined && result !== null) {
        console.log('result ' + result);
        console.log('is string: ' + typeof result === 'string');
        let orderBy = result.split('=')[1]; //-createdAt
        console.log('orderBy ' + orderBy);
        let isAscending = false;
        if (orderBy[0] === '-') {
          isAscending = true;
          orderBy = orderBy.slice(1);
        }
        var sortedResults = results.slice();
        sortedResults.sort(function(a, b) {
          if (isAscending) {
            return a.orderBy - b.orderBy;
          } else {
            return b.orderBy - a.orderBy;
          }
        });
        console.log('sorted results: ' + JSON.stringify(sortedResults));
        returnedResults = sortedResults;
      }
      // See the note below about CORS headers.
      var headers = defaultCorsHeaders; 
      // Tell the client we are sending them plain text.
      //
      // You will need to change this if you are sending something
      // other than plain text, like JSON or HTML.
      headers['Content-Type'] = 'application/json';
      // .writeHead() writes to the request line and headers of the response,
      // which includes the status and all headers.
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify({results: returnedResults}));
      //response.end(JSON.stringify({test: "test"}));
    }
  } else {
    statusCode = 404;
    // See the note below about CORS headers.
    var headers = defaultCorsHeaders; 
    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = 'application/json';
    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results: "Endpoint not found"}));
  }

  // // See the note below about CORS headers.
  // var headers = defaultCorsHeaders;

  // // Tell the client we are sending them plain text.
  // //
  // // You will need to change this if you are sending something
  // // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'JSON';

  // // .writeHead() writes to the request line and headers of the response,
  // // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // // Make sure to always call response.end() - Node may not send
  // // anything back to the client until you do. The string you pass to
  // // response.end() will be the body of the response - i.e. what shows
  // // up in the browser.
  // //
  // // Calling .end "flushes" the response's internal buffer, forcing
  // // node to actually send all the data over to the client.
  // if (request.method === 'POST') {
  //   response.end(JSON.stringify({results: 'Successful POST'}));
  // } else {
  //   response.end(JSON.stringify({results: results}));
  // }
  
};


exports.requestHandler = requestHandler;

