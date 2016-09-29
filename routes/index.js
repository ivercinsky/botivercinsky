/**
 * Created by ivan on 29/09/16.
 */
var express = require('express');
var router = express.Router();

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

routes.get('/messenger/webhook', function (req,res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === "my_bot_rules") {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});



module.exports = router;
