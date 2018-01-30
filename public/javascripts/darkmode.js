//the button toggles the css file. the app remembers the last chosen settings and reloads the app with the last file loaded instead of the default 

//toggles css files. saves value of either day or night to localstorage
function changeCss() {
	if($( "#switch" ).prop( "checked")) {
		localStorage.setItem("loadout", "dark")
		localStorage.setItem("bootstrap", "dark")

        $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/bootstrap-dark.min.css">')
        $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/dark.css">')

		drawCharts('dark');
	}
	else{
		localStorage.setItem("loadout", "light")
		localStorage.setItem("bootstrap", "light")

        $('link[rel=stylesheet][href*="dark.css"]').remove();
        $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/bootstrap-light.min.css">')
		drawCharts('light');
	}
}

//called when site launched or browser refreshed.
/*$( document ).ready( loadStyle );*/
function loadStyle() {
	var stylePreference = localStorage.getItem("loadout");
	if(stylePreference) {
		if(stylePreference === "dark") {

            $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/bootstrap-dark.min.css">')
            $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/dark.css">')

			drawCharts('dark');

			//Check the switch button is set correctly
			$( "#switch" ).prop( "checked", true );

			//Draws the dark graphs
		}
		else {
			//Check the switch button is set correctly
			$("#switch").prop( "checked", false );
			//Draws the light graphs
            $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/bootstrap-light.min.css">')
            $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/light.css">')
			drawCharts('light');
		}
	//Incase there's no localStorage draws the light graph	
	} else {
        $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/bootstrap-light.min.css">')
        $('head').append('<link rel="stylesheet" type="text/css" href="/stylesheets/light.css">')
		drawCharts('light');
	}
};

//loads a screen to cover the changing of themes and accidental blinding
$(window).on('load', function () {
	$("#coverScreen").hide();
    loadStyle();
});
