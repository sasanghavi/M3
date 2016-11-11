var request = require("request");

var base_url = "http://159.203.120.47:3000/"
//var base_url = "http://localhost:3000/"
describe("basic server", function() {
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    it("returns hello world", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body).toBe("hello world");
        done();
      });
    });
  });
});
