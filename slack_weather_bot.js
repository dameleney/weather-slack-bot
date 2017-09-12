var Botkit = require('botkit');
var controller = Botkit.slackbot();
var http = require('http');

var bot = controller.spawn({

  token: "xoxb-239466680259-HnwPWFPjeA9QsHURG4hFRYnw"

})

bot.startRTM(function(err,bot,payload) {

  if (err) {

    throw new Error('Could not connect to Slack');

  }

});

/*
controller.hears(["Hello","Hi"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {

  bot.reply(message,'Hello, how are you today?');

});
*/


controller.hears(['weather in (.*)', '(.*) weather'], 'direct_message,direct_mention,mention', function(bot,message) {
    var city = message.match[1].replace(/\s/g,'');
    console.log("city: "+city);
    if(undefined === city || '' === city || null === city)
    {
        bot.reply(message,"Are't you forgot the city name? I am really sorry, currently I can't guess your city.");
    }
    else{
        var options = {
            protocol : 'http:',
            host : 'api.openweathermap.org',
            path : '/data/2.5/weather?q='+city+'&appid=9f4b92b4618f4c821058f1ad15bc6828',
            port : 80,
            method : 'GET'
          }

        var request = http.request(options, function(response){
            var body = "";
            response.on('data', function(data) {
                body += data;
                weather = JSON.parse(body);
                console.log("weather :" + weather.weather[0].main);
                bot.reply(message, "Its " + weather.weather[0].main + " in " + city);
                var reaction = "";
                switch(weather.weather[0].main)
                {
                        case "Clear":
                                reaction = "mostly_sunny";
                                bot.reply(message,":"+reaction+":");
                                bot.reply(message,"Its good idea to wear sunglasses before going out");
                                break;
                        case "Clouds":
                        case "Cloud":
                                reaction = "cloud";
                                bot.reply(message,":"+reaction+":");
                                break;
                        case "Smoke":
                                reaction = "smoking";
                                bot.reply(message,":"+reaction+":");
                                break;
                        case "Rain":
                                reaction = "rain_cloud";
                                bot.reply(message,":"+reaction+":");
                                bot.reply(message,"Please carry umbrella if you are in " + city);
                                break;
                        case "Thunderstorm":
                                reaction = "thunder_cloud_and_rain";
                                bot.reply(message,":"+reaction+":");
                                bot.reply(message,"Please don't go out if you are in " + city);
                                break;
                }
                bot.api.reactions.add({
                    timestamp: message.ts,
                    channel: message.channel,
                    name: reaction,
                }, function(err, res) {
                    if (err) {
                        bot.botkit.log('Failed to add emoji reaction :(', err);
                    }
                });
            });
            response.on('end', function() {
              /*res.send(JSON.parse(body));*/
            });
          });
          request.on('error', function(e) {
            console.log('Problem with request: ' + e.message);
            bot.reply(message, "sorry, couldn't find weather info for city " + city);
          });
          request.end();
  }
})