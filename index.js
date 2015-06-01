// Expected env settings
var slack_token = process.env.SLACK_TOKEN;
var buildkite_api_token = process.env.BUILDKITE_API_TOKEN;
var buildkite_default_org_slug  = process.env.BUILDKITE_DEFAULT_ORG_SLUG;

var https      = require('https');
var express    = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded());

app.post('/', function(req, res){
  console.log('Received POST', req.headers, req.body);

  if (req.body.token != slack_token) {
    console.log("Invalid Slack token");
    return res.status(401).send('Invalid token');
  }

  var textWithoutTriggerWord = req.body.text.replace(new RegExp("^" + escapeRegExp(req.body.trigger_word)), '').trim();

  if (textWithoutTriggerWord.match(/^build/)) {
    build_command(textWithoutTriggerWord, req, res);
  } else if (textWithoutTriggerWord.match(/^mycommand/)) {
    // Add your own commands here
  } else {
    usage_help(res);
  }
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Express listening on port', this.address().port);
});

function usage_help(res) {
  res.send(JSON.stringify({
    text: "Available commands:\n" +
      "```\n" +
       "build <project> \"<message>\" <branch default:master> <commit default:HEAD>\n" +
       "Example: build spacex/rockets \"Building from Slack\"\n" +
      "```"
      // Add your own command help here
  });
}

function build_command(text, req, res) {
  var buildCommandMatch = text.match(/^build (.*?) ["“](.*?)["”](?: ([^ ]+))?(?: ([^ ]+))?/);
  if (!buildCommandMatch) return usage_help(res);

  var orgProjMatch = buildCommandMatch[1].match(/(.*)\/(.*)/);
  if (orgProjMatch) {
    var org = orgProjMatch[1];
    var project = orgProjMatch[2];
  } else {
    var org = buildkite_default_org_slug;
    var project = buildCommandMatch[1];
  }

  var message = buildCommandMatch[2];
  var branch = buildCommandMatch[3] || "master";
  var commit = buildCommandMatch[4] || "HEAD";

  console.log("Build command", buildCommandMatch, org, project, message);

  post_to_buildkite('/v1/organizations/' + org + '/projects/' + project + '/builds', {
    branch: branch,
    commit: commit,
    message: message
  }, function(responseCode, responseBody) {
    console.log("Build API response", responseCode, responseBody)
    if (responseCode >= 300) {
      return res.send(JSON.stringify({text: "Buildkite API failed: " + responseCode + " " + responseBody}));
    } else {
      var responseJson = JSON.parse(responseBody);
      return res.send(JSON.stringify({text: "Here you go @" + req.body.user_name + ": " + responseJson.web_url}));
    }
  });
}

function post_to_buildkite(path, params, callback) {
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
    var body = "";
    res.on("data", function(data) {
      body += data.toString();
    });
    res.on("end", function() {
      console.log("Buildkite API response", res.statusCode, body);
      callback(res.statusCode, body);
    });
  });

  req.write(body);
  req.end();
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}