var express = require('express');
var _ = require('underscore')._;
var request = require('request');
var router = express.Router();
var fs = require('fs');
var glossary = JSON.parse(fs.readFileSync('glossary.json', 'utf-8'));
var drugCache = {};
var combos = {};
var pCats = { 
  "dox": {
    "pname": "DOx",
    "wiki": "https://wiki.tripsit.me/wiki/DOx"
  },
  "nbomes": {
    "pname": "NBOMes",
    "wiki": "https://wiki.tripsit.me/wiki/NBOMes"
  },
  "2c-x": {
    "pname": "2C-x",
    "wiki": "https://wiki.tripsit.me/wiki/2C-X"
  },
  "2c-t-x": {
    "pname": "2C-T-x",
    "wiki": "https://wiki.tripsit.me/wiki/2C-X"
  },
  "5-meo-xxt": {
    "pname": "5-MeO-xxT",
    "wiki": "https://wiki.tripsit.me/wiki/5-MeO-DMT"
  },
  "amphetamines": {
    "pname": "Amphetamines",
    "wiki": "https://wiki.tripsit.me/wiki/Amphetamine"
  },
  "benzodiazepines": {
    "pname": "Benzodiazepines",
    "wiki": "https://wiki.tripsit.me/wiki/Benzodiazepines"
  },
  "maois": {
    "pname": "MAOIs",
    "wiki": "https://wiki.tripsit.me/wiki/Antidepressants#MAOIs"
  },
  "ssris": {
    "pname": "SSRIs",
    "wiki": "https://wiki.tripsit.me/wiki/Antidepressants#SSRIs"
  },
  "opioids": {
    "pname": "Opioids",
    "wiki": "https://wiki.tripsit.me/wiki/Opioids"
  },
  "ghb/gbl": {
    "pname": "GHB/GBL",
    "wiki": "https://wiki.tripsit.me/wiki/GHB"
  }
}; 
var wikiCache = {};

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
  }, function(err, response, body) {
    if(err || !body || !body.data[0].properties) {
        return res.render('error', {
            message: 'no drig'
        });
    }
    var drug = body.data[0];
    _.each(_.keys(drugCache), function(item) {
      var pattern = new RegExp('\\b' + item + '\\b', 'gi');
      drug.properties.summary = drug.properties.summary.replace(pattern, '<a href="/factsheet/'+item+'">'+drugCache[item].pretty_name+'</a>');
    });
    _.each(_.keys(glossary), function(item) {
      drug.properties.summary = drug.properties.summary.replace(new RegExp('\\b('+item+')\\b', 'gi'), '[$1]');
    });
    var terms = /\[([^\]]+)\]/gi;
    var item = terms.exec(drug.properties.summary);
    while(item != null) {
        drug.properties.summary = drug.properties.summary.replace(item[0], '<span class="glossary" data-toggle="tooltip" title="'+glossary[item[1].toLowerCase()]+'">'+item[1]+'</span>');
        item = terms.exec(drug.properties.summary);
    }
    var order = _.union(['summary', 'categories', 'dose', 'onset', 'duration', 'after-effects', 'effects'], _.keys(drug.properties));

    var safetyKey = null,
        safety = null;
    if(_.has(combos, drug.name)) {
      safetyKey = drug.name;
    } else if(drug.name.match(/^do.$/i)) {
      safetyKey = 'dox';
    } else if(drug.name.match(/^2c-.$/i)) {
      safetyKey = '2c-x';
    } else if(drug.name.match(/^5-meo-..t$/i)) {
      safetyKey = '5-meo-xxt';
    } else if(_.include(drug.categories, 'benzodiazepine')) {
      safetyKey = 'benzodiazepines';
    } else if(_.include(drug.categories, 'opioid')) {
      safetyKey = 'opioids';
    }

    if(safetyKey) {
      safety = {
        'deadly': [],
        'unsafe': [],
        'safeinc': [],
        'ss': [],
        'safedec': []
      };

      _.each(combos[safetyKey], function(d,k) {
        k = {
          'pname': k,
          'name': k
        };
        if(_.has(drugCache, k.name)) {
          k.pname = drugCache[k.name].pretty_name;
        }
        if(_.has(pCats, k.name)) {
          k.pname = pCats[k.name].pname;
          k.wiki = pCats[k.name].wiki;
        }

        if(d == 'Safe & Synergy') {
            safety.safeinc.push(k); 
        } else if(d == 'Safe & No Synergy') {
            safety.safedec.push(k);
        } else if(d == 'Deadly') {
            safety.deadly.push(k);
        } else if(d == 'Unsafe') {
            safety.unsafe.push(k);
        } else if(d == 'Serotonin Syndrome') {
            safety.ss.push(k);
        }
      }); 
    }

    // This is a little bit grea-hea-heasy, but y'know.
    if((drug.formatted_duration || drug.formatted_onset || drug.formatted_aftereffects) &&
      (_.size(drug.formatted_duration) > 1 || _.size(drug.formatted_onset) > 1 || _.size(drug.formatted_aftereffects) > 1)) {
      var roas = [];
      _.each(['onset', 'duration', 'aftereffects'], function(a, c) {
        var s = drug['formatted_'+a];
        if(s) {
          roas = _.union(roas, _.without(_.keys(s), '_unit', 'value'));
        }
      });


      _.each(['onset', 'duration', 'aftereffects'], function(a, c) {
        var s = drug['formatted_'+a];
        _.each(roas, function(roa) {
          if(s && !_.has(s, roa)) {
            s[roa] = s.value;
          }
        });
      });
    }

    if(_.has(wikiCache, drug.name)) {
      var wiki = wikiCache[drug.name];
      res.render('factsheet', { title: 'TripSit Factsheets - ' + drug.pretty_name, 'drug': drug, 'order': order, 'glossary': glossary, 'interactions': safety, 'wiki': wiki });
    } else {
      var wiki = null;
      request.get('http://wiki.tripsit.me/api.php', {
        'qs': {
          'action': 'opensearch',
          'search': drug.name,
          'limit': 1,
          'namespace': 0,
          'format': 'json'
        },
        'json': true
      }, function(err, resp, body) {
        if(!err && body[1].length !== 0) {
          wiki = 'https://wiki.tripsit.me/wiki/'+body[1][0].replace(/\s/g, '_');
        }
        wikiCache[drug.name] = wiki;
        res.render('factsheet', { title: 'TripSit Factsheets - ' + drug.pretty_name, 'drug': drug, 'order': order, 'glossary': glossary, 'interactions': safety, 'wiki': wiki });
      });
    }
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
