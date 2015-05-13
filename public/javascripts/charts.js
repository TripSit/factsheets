window.onload = function () {
    var name = $('#drugname').text()
  $.getJSON('/raw/'+name, function(results) {
      if(results.formatted_dose) {
        $.each(results.formatted_dose, function(roa, levels) {
          var dataPoints = [];
          var a = 1;
          $.each(levels, function(level, amt) {
            amt = amt.replace(/mg/i,'').replace(/g/i,'').replace(/ug/i,'');
            dataPoints.push({y: a, x: parseInt(amt)});
            a++;
          });
          console.log(dataPoints);
          var chart = new CanvasJS.Chart(roa+'Chart', {
              theme: "theme2",
              title:{
                text: "Dosage response curve for " + roa + " " + name
              },
              animationEnabled: true,
              axisX: {
                title: 'Dosage'
              },
              axisY:{
                title: 'Level'
              },
              data: [
                  {        
                    type: "spline",
                    //lineThickness: 3,        
                    dataPoints: dataPoints
                  }
              ]
          });
          chart.render();
        });
      }
        var data = [];
      if(results.formatted_duration.value && results.formatted_onset.value && results.formatted_aftereffects.value) {
        var onset = parseInt(results.formatted_onset.value);
        if(results.formatted_onset._unit == 'minutes') {
          onset = onset / 60;
        }
        onset = [{'y': onset, 'label': 'All ROAs'}];
        
        var duration = parseInt(results.formatted_duration.value);
        if(results.formatted_duration._unit == 'minutes') {
          duration = duration / 60;
        }
        duration = [{'y': duration, 'label': 'All ROAs'}];

        var after = parseInt(results.formatted_aftereffects.value);
        if(results.formatted_aftereffects._unit == 'minutes') {
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

        $.each(results.formatted_onset, function(roa, value) {
          if(roa == '_unit' || roa == 'value') return;
          if($.inArray(roa, roas) == -1) roas.push(roa);

          var val = parseInt(value);
          if(results.formatted_onset._unit == 'minutes') {
            val = val / 60;
          }
          dp.onset.push({'y': val, 'label': roa}) 
        });
        
        // Duration
        $.each(results.formatted_duration, function(roa, value) {
          if(roa == '_unit' || roa == 'value') return;
          if($.inArray(roa, roas) == -1) roas.push(roa);

          var val = parseInt(value);
          if(results.formatted_duration._unit == 'minutes') {
            val = val / 60;
          }
          dp.duration.push({'y': val, 'label': roa}) 
        });

        // After effects
        $.each(results.formatted_aftereffects, function(roa, value) {
          if(roa == '_unit' || roa == 'value') return;
          if($.inArray(roa, roas) == -1) roas.push(roa);

          var val = parseInt(value);
          if(results.formatted_aftereffects._unit == 'minutes') {
            val = val / 60;
          }
          dp.aftereffects.push({'y': val, 'label': roa}) 
        });

        $.each(['onset','duration','aftereffects'], function(a, c) {
          var s = results['formatted_'+c];
          if(s.value) {
            var val = parseInt(s.value);
            if(s._unit == 'minutes') {
              val = val / 60;
            }
            for(var i=0;i<roas.length;i++) {
              dp[c].push({'y': val, 'label':roas[i]});  
            }
          }
        });
        console.log(dp);

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
                        text:name + " duration"
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


  });

var bt = $('.sidebar').position().top;

$(window).scroll(function() {
    var wst = $(window).scrollTop();

    (wst >= bt) ?
    $('.sidebar').css({position: 'fixed', top: 15+'px' }) :  
    $('.sidebar').css({position: 'absolute', top: bt+'px' })
});

  $('[data-toggle="tooltip"]').tooltip()
};
