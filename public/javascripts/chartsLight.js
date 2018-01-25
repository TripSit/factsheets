var drawchartsLight = function drawChartLight() {
  $('[data-toggle="tooltip"]').tooltip();
  $('.fixed-table-loading').hide();

  if(drug && drug.formatted_dose) {
    $.each(drug.formatted_dose, function(roa, levels) {
      var dataPoints = [];

      var u = '';
      var y = [];
      var errors = [];
      $.each(levels, function(level, amt) {
        var m = amt.match('(mg|g|ug|µg|ml)');
        if(m) u = m[1];
        amt = amt.replace(/mg/i,'').replace(/g/i,'').replace(/ug/i,'').replace(/ml/i,'');
        amt = amt.split('-');
        amt[0] = parseInt(amt[0]);

        var error = 0;
        if(amt.length > 1) {
          amt[1] = parseInt(amt[1]);
          var midPoint = amt[0] + ((amt[1] - parseInt(amt[0])) / 2)
          y.push(midPoint);
          errors.push(parseInt(amt[1]) - midPoint);
        } else {
          y.push(amt[0]);
        }
      });

      var trace1 = {
        x: Object.keys(levels),
        y: y,
        name: 'Control',
        error_y: {
          type: 'data',
          array: errors,
          visible: true
        },
        type: 'bar'
      };

      var title = 'Dosage chart for ' + roa + ' ' + drug.pretty_name;
      if(roa == 'none') {
        title = 'Dosage chart for ' + drug.pretty_name;
      } 
      var data = [trace1];
      var layout = {
        barmode: 'group', 
        title: title,
        yaxis: { title: 'Dose ('+u+')'},
        xaxis: { title: 'Experience Level' }
      };
      Plotly.newPlot(roa+'Chart', data, layout);
    });
  }
  
  if(drug && drug.formatted_duration || drug.formatted_onset || drug.formatted_aftereffects) {
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

      if(drug.formatted_onset) {
        $.each(drug.formatted_onset, function(roa, value) {
          if(roa == '_unit' || roa == 'value') return;
          if($.inArray(roa, roas) == -1) roas.push(roa);

          var val = parseInt(value);
          if(drug.formatted_onset._unit == 'minutes') {
            val = val / 60;
          }
          dp.onset.push({'y': val, 'label': roa}) 
        });
      }
      
      if(drug.formatted_duration) {
        $.each(drug.formatted_duration, function(roa, value) {
          if(roa == '_unit' || roa == 'value') return;
          if($.inArray(roa, roas) == -1) roas.push(roa);

          var val = parseInt(value);
          if(drug.formatted_duration._unit == 'minutes') {
            val = val / 60;
          }
          dp.duration.push({'y': val, 'label': roa}) 
        });
      }

      // After effects
      if(drug.formatted_aftereffects) {
        $.each(drug.formatted_aftereffects, function(roa, value) {
          if(roa == '_unit' || roa == 'value') return;
          if($.inArray(roa, roas) == -1) roas.push(roa);

          var val = parseInt(value);
          if(drug.formatted_aftereffects._unit == 'minutes') {
            val = val / 60;
          }
          dp.aftereffects.push({'y': val, 'label': roa}) 
        });
      }

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
              toolTip: {
                content: function(e) {
                  var e = e.entries[0];
                  var map = {'After effects':'aftereffects', 'Duration':'duration', 'Onset': 'onset'}; // eugh
                  
                  var item = e.dataSeries.name;
                  var roa = e.dataPoint.label;
                  var value = e.dataPoint.y;
                  var unit = drug['formatted_'+map[item]]._unit;

                  if(unit == 'minutes') {
                    value = value * 60;
                  }

                  return roa + ' ' + item + ': ' + value + ' ' + unit;
                },
                shared: false
              },
              axisX:{
                      interval: 1,
                      labelFontSize: 10,
                      lineThickness: 0
              },
              axisY2:{
                      valueFormatString: "0 hours",
                      lineThickness: 0                                
              },
              legend:{
                      verticalAlign: "top",
                      horizontalAlign: "center"
              },

              data: data 
      });
      chart.render();
  }
  

};
