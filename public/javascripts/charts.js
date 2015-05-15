window.onload = function () {
  if(drug.formatted_dose) {
    $.each(drug.formatted_dose, function(roa, levels) {
      var dataPoints = [];

      var levelOne = [];
      var u = '';
      $.each(levels, function(level, amt) {
        var m = amt.match('(mg|g|ug)');
        if(m) u = m[1];

        amt = amt.replace(/mg/i,'').replace(/g/i,'').replace(/ug/i,'');
        levelOne.push({y: parseInt(amt), 'label': level});
      });

      levelTwo = [];
      $.each(levels, function(level, amt) {
      amt = amt.split('-');
        if(amt.length > 1) {
          levelTwo.push({y: parseInt(amt[1])-parseInt(amt[0]), 'label': level});
        }
      });

      var title = "Dosage chart for " + roa + " " + drug.pretty_name;
      if(roa == 'none') {
        title = "Dosage chart for " + drug.pretty_name;
      } 

      var chart = new CanvasJS.Chart(roa+'Chart', {
          'theme': "theme2",
          'title': { 
            'text': title
          },
          'animationEnabled': true,
          axisX: {
            title: 'Level'
          },
          axisY:{
            title: 'Dosage ('+u+')'
          },
          data: [
                {
                  'type': 'stackedColumn', 
                  'dataPoints': levelOne
                }, {
                  'type': 'stackedColumn', 
                  'dataPoints': levelTwo
                }
          ]
      });
      chart.render();
    });
  }
  
  if(drug.formatted_duration && drug.formatted_onset && drug.formatted_aftereffects) {
    var data = [];
    if(drug.formatted_duration.value && drug.formatted_onset.value && drug.formatted_aftereffects.value) {
      var onset = parseInt(drug.formatted_onset.value);
      if(drug.formatted_onset._unit == 'minutes') {
        onset = onset / 60;
      }
      onset = [{'y': onset, 'label': 'All ROAs'}];
      
      var duration = parseInt(drug.formatted_duration.value);
      if(drug.formatted_duration._unit == 'minutes') {
        duration = duration / 60;
      }
      duration = [{'y': duration, 'label': 'All ROAs'}];

      var after = parseInt(drug.formatted_aftereffects.value);
      if(drug.formatted_aftereffects._unit == 'minutes') {
        after = after / 60;
      }
      after = [{'y': after, 'label': 'All ROAs'}];

      data.push({     
        type: "stackedBar",
        showInLegend: true,
        name: "Onset",
        axisYType: "secondary",
        color: "#7E8F74",
        dataPoints: onset
      });
      data.push({     
          type: "stackedBar",
          showInLegend: true,
          name: "Duration",
          axisYType: "secondary",
          color: "#F0E6A7",
          dataPoints: duration
      }); 
      data.push({     
          type: "stackedBar",
          showInLegend: true,
          name: "After effects",
          axisYType: "secondary",
          color: "#ADD8E6",
          dataPoints: after
      });
    } else {
      var roas = []; 

      // TODO : can actually loop this
      // Onset
      var dp = {
        'onset': [],
        'duration': [],
        'aftereffects': []
      };

      $.each(drug.formatted_onset, function(roa, value) {
        if(roa == '_unit' || roa == 'value') return;
        if($.inArray(roa, roas) == -1) roas.push(roa);

        var val = parseInt(value);
        if(drug.formatted_onset._unit == 'minutes') {
          val = val / 60;
        }
        dp.onset.push({'y': val, 'label': roa}) 
      });
      
      // Duration
      $.each(drug.formatted_duration, function(roa, value) {
        if(roa == '_unit' || roa == 'value') return;
        if($.inArray(roa, roas) == -1) roas.push(roa);

        var val = parseInt(value);
        if(drug.formatted_duration._unit == 'minutes') {
          val = val / 60;
        }
        dp.duration.push({'y': val, 'label': roa}) 
      });

      // After effects
      $.each(drug.formatted_aftereffects, function(roa, value) {
        if(roa == '_unit' || roa == 'value') return;
        if($.inArray(roa, roas) == -1) roas.push(roa);

        var val = parseInt(value);
        if(drug.formatted_aftereffects._unit == 'minutes') {
          val = val / 60;
        }
        dp.aftereffects.push({'y': val, 'label': roa}) 
      });

      /*$.each(['onset','duration','aftereffects'], function(a, c) {
        var s = drug['formatted_'+c];
        if(s.value) {
          var val = parseInt(s.value);
          if(s._unit == 'minutes') {
            val = val / 60;
          }
          for(var i=0;i<roas.length;i++) {
            dp[c].push({'y': val, 'label':roas[i]});  
          }
        }
      });*/

      data.push({     
        type: "stackedBar",
        showInLegend: true,
        name: "Onset",
        axisYType: "secondary",
        color: "#7E8F74",
        dataPoints: dp.onset
      });
      data.push({     
          type: "stackedBar",
          showInLegend: true,
          name: "Duration",
          axisYType: "secondary",
          color: "#F0E6A7",
          dataPoints: dp.duration
      }); 
      data.push({     
          type: "stackedBar",
          showInLegend: true,
          name: "After effects",
          axisYType: "secondary",
          color: "#ADD8E6",
          dataPoints: dp.aftereffects
      });
    }
    var chart = new CanvasJS.Chart("durationChart", {
              title:{
                      text:drug.name + " duration"
              },
              animationEnabled: true,
              axisX:{
                      interval: 1,
                      labelFontSize: 10,
                      lineThickness: 0
              },
              axisY2:{
                      valueFormatString: "0 hours",
                      lineThickness: 0                                
              },
              toolTip: {
                      shared: true
              },
              legend:{
                      verticalAlign: "top",
                      horizontalAlign: "center"
              },

              data: data 
      });
      chart.render();
  }
  
var bt = $('.sidebar').position().top;

$(window).scroll(function() {
    var wst = $(window).scrollTop();

    (wst >= bt) ?
    $('.sidebar').css({position: 'fixed', top: 15+'px' }) :  
    $('.sidebar').css({position: 'absolute', top: bt+'px' })
});

  $('[data-toggle="tooltip"]').tooltip()
};
