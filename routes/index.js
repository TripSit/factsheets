var express = require('express');
var _ = require('underscore')._;
var request = require('request');
var router = express.Router();
var fs = require('fs');
var glossary = JSON.parse(fs.readFileSync('glossary.json', 'utf-8'));
var drugCache = {};
var combos = {};
  request.get('http://tripbot.tripsit.me/api/tripsit/getAllDrugs', {
    'json': true
  }, function(request, response, body) {
    drugCache = body.data[0];
  });

  request.get('http://tripsit.me/combo.json', {
    'json': true
  }, function(request, response, body) {
    combos = body;
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

      var safety = {
        'deadly': [],
        'unsafe': [],
        'safeinc': [],
        'safedec': []
      };
      _.each(combos['2c-x'], function(d,k) {
        if(d == 'Safe & Synergy') {
            safety.safeinc.push(k); 
        } else if(d == 'Safe & No Synergy') {
            safety.safedec.push(k);
        } else if(d == 'Deadly') {
            safety.deadly.push(k);
        } else if(d == 'Unsafe') {
            safety.unsafe.push(k);
        }
      }); 

      res.render('factsheet', { title: 'TripSit Factsheets - ' + body.data[0].name, 'drug': body.data[0], 'order': order, 'glossary': glossary, 'interactions': safety });
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
