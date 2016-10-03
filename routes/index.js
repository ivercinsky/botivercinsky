/**
 * Created by ivan on 29/09/16.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
const {Wit, log} = require("node-wit");
const fetch = require('isomorphic-fetch');

var wit_client = new Wit({
    accessToken: 'W7NOF5LXBFSS7CZSG2R3KUGDEWAJGVIF'
});

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
// define the home page route
router.get('/', function(req, res) {
    res.locals = {
        title: 'Boooots!!!'
    };
    return res.render(
        'index',
        {
            partials:
            {
                part: 'part'
            }
        }
    );
});

router.get('/messenger/webhook', function (req,res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === "my_bot_rules") {
        /*console.log("Validating webhook");*/
        res.status(200).send(req.query['hub.challenge']);
    } else {
        //console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});


router.post('/messenger/test', function(req,res) {
    var messageText = req.body.texto;
    wit_client.message(messageText, {}, '','id132',3).then(function(data){
        console.log("WIT.AI RESPONDIO : " + JSON.stringify(data));
        res.status(200).send(data);
    }).catch(function(err){
        console.log(err);
        res.sendStatus(500);
    });
});

router.post('/messenger/webhook', function (req, res) {
   var data = req.body;

    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    //receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    wit_client.message(messagingEvent.message.text, {}).then(function(data){
                        console.log("WIT.AI RESPONDIO : " + data);
                        messagingEvent.message.text = data.outcomes[0].intent[0].value;
                        receivedMessage(messagingEvent);
                    }).catch(function(err){
                        console.log(err);
                    });
                } else if (messagingEvent.delivery) {
                    //receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    wit_client.message(messagingEvent.message.text, {}).then(function(data){
                        console.log("WIT.AI RESPONDIO : " + data);
                        messagingEvent.message.text = data.outcomes[0].intent[0].value;
                        receivedPostback(messagingEvent);
                    }).catch(function(err){
                        console.log(err);
                    });

                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
    res.sendStatus(404);
});

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;



    if (messageText) {

        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example. Otherwise, just echo
        // the text we received.

        switch (messageText) {
            case 'image':
                //sendImageMessage(senderID);
                break;

            case 'button':
                //sendButtonMessage(senderID);
                break;

            case 'generic':
                sendGenericMessage(senderID);
                break;

            case 'credito' :
                sendGenericCreditoMessage(senderID);
                break;

            case 'receipt':
                //sendReceiptMessage(senderID);
                break;

            default:
                sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function sendGenericCreditoMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type:"generic",
                    elements:[{
                        title:"Nuevo Crédito",
                        subtitle:"0% de Interes",
                        item_url: "https://www.oculus.com/en-us/rift/",
                        image_url: "http://messengerdemo.parseapp.com/img/rift.png",
                        buttons:[{
                            type:"postback",
                            title:"SI!",
                            payload:"PEDIR_DNI"
                        }]
                    }]
                }
            }
        }
    };
    callSendAPI(messageData);
}
function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "rift",
                        subtitle: "Next-generation virtual reality",
                        item_url: "https://www.oculus.com/en-us/rift/",
                        image_url: "http://messengerdemo.parseapp.com/img/rift.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for first bubble"
                        }]
                    }, {
                        title: "touch",
                        subtitle: "Your Hands, Now in VR",
                        item_url: "https://www.oculus.com/en-us/touch/",
                        image_url: "http://messengerdemo.parseapp.com/img/touch.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/touch/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for second bubble"
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;


    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);


    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    switch (payload) {
        case "PEDIR_DNI":
            sendTextMessage(senderID, "Genial!!.");
            sendTextMessage(senderID, "Necesitaría tu DNI.");
            break;
        default:
            sendTextMessage(senderID, "Postback called");
    }



}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: 'EAAJBADG4Y9kBAD1Rz4HrIeb3bgSkyFi8bUdakJAypW5ZCbfal3ZAeqER0MEWIz1qpWntUwYlb1O3QL2FYXTZA2P5hBw9Gui0zW6Q0mRjdxla3ZAcvDyMFj1TJOQhQKvcNJQV9OZBZBNZBXJsKkjQduCZCmJ9ULFhatlX7yr2UjfzxQZDZD' },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}
module.exports = router;
