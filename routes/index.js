var express = require('express');
var _ = require('underscore')._;
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  request.get('http://tripbot.tripsit.me/api/tripsit/getAllDrugs', {
    'json': true
  }, function(request, response, body) {
      res.render('index', { title: 'TripSit Factsheets', 'drugs': body.data[0] });
  });
});

router.get('/factsheet/:name', function(req, res) {
  request.get('http://tripbot.tripsit.me/api/tripsit/getDrug?name=' + req.params.name, {
    'json': true
  }, function(request, response, body) {
      var order = _.union(['summary', 'dose', 'onset', 'duration'], _.keys(body.data[0]));
      res.render('factsheet', { title: 'TripSit Factsheets - ' + body.data[0].name, 'drug': body.data[0], 'order': order });
  });
});

router.get('/raw/:name', function(req, res) {
  request.get('http://tripbot.tripsit.me/api/tripsit/getDrug?name=' + req.params.name, {
    'json': true
  }, function(request, response, body) {
      res.json(body.data[0]);
  });
});

module.exports = router;
