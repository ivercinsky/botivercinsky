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
        title: 'Boooots!!!',
    };
    return res.render(
        'index',
        {
            partials:
            {
                part: 'part',
            }
        }
    );
});



module.exports = router;
