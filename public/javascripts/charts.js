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
  });
var bt = $('.sidebar').position().top;

$(window).scroll(function() {
    var wst = $(window).scrollTop();

    (wst >= bt) ?
    $('.sidebar').css({position: 'fixed', top: 15+'px' }) :  
    $('.sidebar').css({position: 'absolute', top: bt+'px' })
});
};
