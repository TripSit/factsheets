var express = require('express');
var _ = require('underscore')._;
var request = require('request');
var router = express.Router();
var fs = require('fs');
var glossary = JSON.parse(fs.readFileSync('glossary.json', 'utf-8'));
var drugCache = {};
  request.get('http://tripbot.tripsit.me/api/tripsit/getAllDrugs', {
    'json': true
  }, function(request, response, body) {
    drugCache = body.data[0];
  });


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
      _.each(_.keys(glossary), function(item) {
        body.data[0].properties.summary = body.data[0].properties.summary.replace(new RegExp(item, 'gi'), '<span style="color:#50007F;" data-toggle="tooltip", title="'+glossary[item]+'">'+item+'</span>');
      });
      _.each(_.keys(drugCache), function(item) {
        body.data[0].properties.summary = body.data[0].properties.summary.replace(new RegExp(' '+item+' ', 'gi'), ' <a href="/factsheet/'+item+'">'+item+'</a> ');
      });
      var order = _.union(['summary', 'dose', 'onset', 'duration', 'after-effects', 'effects'], _.keys(body.data[0].properties));
      res.render('factsheet', { title: 'TripSit Factsheets - ' + body.data[0].name, 'drug': body.data[0], 'order': order, 'glossary': glossary });
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
