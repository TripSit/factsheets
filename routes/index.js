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
      drugs = _.sortBy(body.data[0], 'name');
      res.render('index', { title: 'TripSit Factsheets', 'drugs': drugs });
  });
});

router.get('/status', function(req, res) {
  request.get('http://tripbot.tripsit.me/api/tripsit/getAllDrugs', {
    'json': true
  }, function(request, response, body) {
      drugs = _.sortBy(body.data[0], 'name');

      var brokenDose = _.filter(drugs, function(drug) { return !_.has(drug, 'formatted_dose'); });

      var brokenOnset = _.filter(drugs, function(drug) { return !_.has(drug, 'formatted_onset'); });
      var brokenDuration = _.filter(drugs, function(drug) { return !_.has(drug, 'formatted_duration'); });
      var brokenAfter = _.filter(drugs, function(drug) { return !_.has(drug, 'formatted_aftereffects'); });

      res.render('status', { title: 'TripSit Factsheets', 'brokenDose': brokenDose, 'brokenOnset': brokenOnset, 'brokenDuration': brokenDuration, 'brokenAfter': brokenAfter });
  });
});

router.get('/category/:name', function(req, res) {
  request.get('http://tripbot.tripsit.me/api/tripsit/getAllDrugs', {
    'json': true
  }, function(request, response, body) {
    var drugs = _.filter(body.data[0], function(drug) {
      return _.include(drug.categories, req.params.name);
    });
    drugs = _.sortBy(drugs, 'name');

    res.render('category', { title: 'TripSit Factsheets', 'category': req.params.name, 'drugs': drugs });
  });
});

router.get('/factsheet/:name', function(req, res) {
  request.get('http://tripbot.tripsit.me/api/tripsit/getDrug?name=' + req.params.name, {
    'json': true
  }, function(request, response, body) {
    var drug = body.data[0];
    _.each(_.keys(glossary), function(item) {
      drug.properties.summary = drug.properties.summary.replace(new RegExp(item, 'gi'), '['+item+']');
    });
    var terms = /\[([^\]]+)\]/gi;
    var item = terms.exec(drug.properties.summary);
    while(item != null) {
        drug.properties.summary = drug.properties.summary.replace(item[0], '<span style="color:#50007F;" data-toggle="tooltip", title="'+glossary[item[1]]+'">'+item[1]+'</span>');
        item = terms.exec(drug.properties.summary);
    }
    _.each(_.keys(drugCache), function(item) {
      drug.properties.summary = drug.properties.summary.replace(new RegExp(' '+item+' ', 'gi'), ' <a href="/factsheet/'+item+'">'+item+'</a> ');
    });
    var order = _.union(['summary', 'categories', 'dose', 'onset', 'duration', 'after-effects', 'effects'], _.keys(drug.properties));

    var safety = {
      'deadly': [],
      'unsafe': [],
      'safeinc': [],
      'safedec': []
    };
    if(_.has(combos, drug.name)) {
      _.each(combos[drug.name], function(d,k) {
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
    }

    // This is a little bit grea-hea-heasy, but y'know.
    if((drug.formatted_duration && drug.formatted_onset && drug.formatted_aftereffects) &&
      (_.size(drug.formatted_duration) > 1 || _.size(drug.formatted_onset) > 1 || _.size(drug.formatted_aftereffects) > 1)) {



      var roas = [];
      _.each(['onset', 'duration', 'aftereffects'], function(a, c) {
        var s = drug['formatted_'+a];
      console.log(s);
        roas = _.union(roas, _.without(_.keys(s), '_unit', 'value'));
      });

      console.log(roas);

      _.each(['onset', 'duration', 'aftereffects'], function(a, c) {
        var s = drug['formatted_'+a];
        console.log('now processing ' + a);
        console.log(s);
        _.each(roas, function(roa) {
          if(!_.has(s, roa)) {
          console.log('adding ' + s.value + ' to ' + a + ' as ' + roa);
            s[roa] = s.value;
          }
        });
      });
    }


      res.render('factsheet', { title: 'TripSit Factsheets - ' + drug.pretty_name, 'drug': drug, 'order': order, 'glossary': glossary, 'interactions': safety });
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

function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
