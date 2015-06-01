// Expected env settings
var slack_token = process.env.SLACK_TOKEN;
var buildkite_api_token = process.env.BUILDKITE_API_TOKEN;
var buildkite_org_slug  = process.env.BUILDKITE_ORG_SLUG;

var https      = require('https');
var express    = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.post('/', function(req, res){

  console.log('Received POST', req.headers, req.body);

  if (req.params.token != slack_token) {
    console.log("Invalid Slack token");
    return res.status(401).send('Invalid token');
  }

  res.send('AOK');
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Express listening on port', this.address().port);
});

function post_to_buildkite(path, params) {
  var body = JSON.stringify(params);

  console.log("Posting to Buildkite", path, body);

  var req = https.request({
    hostname: 'api.buildkite.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      "Content-type":   "application/json",
      "Connection":     "close",
      "Content-length": body.length,
      "Authorization":  "Bearer " + buildkite_api_token,
    }
  }, function(res) {
    res.on("data", function(data) {
      console.log("Buildkite API response", res.statusCode, data.toString());
    });
  });

  req.write(body);
  req.end();
}
