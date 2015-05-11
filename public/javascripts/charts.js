window.onload = function () {
    var name = $('#drug').text()
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
      if(results.formatted_duration) {
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

                data: [
                {     
                        type: "stackedBar",
                        showInLegend: true,
                        name: "Onset",
                        axisYType: "secondary",
                        color: "#7E8F74",
                        dataPoints: [
                                {y: parseInt(results.formatted_onset['Insufflated']) / 60, label: "Insufflated"},
                                {y: parseInt(results.formatted_onset['Oral']) / 60, label: "Oral" },
                                {y: parseInt(results.formatted_onset['Plugged']) / 60, label: "Plugged" }
                        ]
                },
                {     
                        type: "stackedBar",
                        showInLegend: true,
                        name: "Duration",
                        axisYType: "secondary",
                        color: "#F0E6A7",
                        dataPoints: [
                                {y: parseInt(results.formatted_duration['Insufflated']), label: "Insufflated" },
                                {y: parseInt(results.formatted_duration['Oral']), label: "Oral" },
                                {y: parseInt(results.formatted_duration['Plugged']), label: "Plugged"   },                    
                        ]
                },                
                {     
                        type: "stackedBar",
                        showInLegend: true,
                        name: "After effects",
                        axisYType: "secondary",
                        color: "#ADD8E6",
                        dataPoints: [
                                {y: parseInt(results.formatted_aftereffects.value), label: "Insufflated" },
                                {y: parseInt(results.formatted_aftereffects.value), label: "Oral" },
                                {y: parseInt(results.formatted_aftereffects.value), label: "Plugged" },                    
                        ]
                }
            ]
                });
        chart.render();
    }

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
