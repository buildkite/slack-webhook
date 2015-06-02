# Buildkite Slack Incoming Webhook

Command [Buildkite](https://buildkite.com/) from your Slack chat with this example [Slack Outgoing Webhook](https://api.slack.com/outgoing-webhooks).

![](http://i.imgur.com/xwPIHSE.gif)

## Usage

1. **Fork it**

1. **Create a new Outgoing Webhook** on Slack. Copy the token.

1. **Deploy it to Heroku** <br>[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
 
1. Head back to Slack and **set trigger words** to: `!buildkite,buildkite:`

1. **Copy the Heroku URL** into **URL(s)**

1. **Save your webhook**

1. **Set the name** to `Buildkite` and icon to [this](http://i.imgur.com/JDjeaCq.jpg)

1. **Test it** by typing `!buildkite` in your Slack

1. **Profit**

## Configuration

The following environment variables need to be set (this are set up automatically if you use the Heroku button above, otherwise use `heroku config:set XXX=xxx`):

* `BUILDKITE_API_TOKEN` - A Buildkite API token with `write_builds` permission
* `BUILDKITE_DEFAULT_ORG_SLUG` - The default org slug to use so you can refer to a project w/o the org
* `SLACK_TOKEN` - The token from Slack when you created the outgoing webhook

## Personalizing

Query or stop a build agent with the [Agents API](https://buildkite.com/docs/api)? List the last build for a project with the [Projects API](https://buildkite.com/docs/projects)? The sky’s the limit! And if it’s something everyone could use why not send a pull request.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
