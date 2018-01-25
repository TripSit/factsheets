//the button toggles the css file. the app remembers the last chosen settings and reloads the app with the last file loaded instead of the default 


//toggles css files. saves value of either day or night to localstorage
function changeCss() {
	if(document.getElementById("style").href.includes("/stylesheets/light.css")) {
		 document.getElementById("style").href = "/stylesheets/dark.css";
		localStorage.setItem("loadout", "dark")
		document.getElementById("bootstrap-theme").href = "/stylesheets/bootstrap-dark.min.css";
		localStorage.setItem("bootstrap", "dark")
		drawChartsDark();
	}
	else{
		document.getElementById("style").href = "/stylesheets/light.css";
		localStorage.setItem("loadout", "light")
		document.getElementById("bootstrap-theme").href = "/stylesheets/bootstrap-light.min.css";
		localStorage.setItem("bootstrap", "light")
		drawchartsLight();
	}
}

//called when site launched or browser refreshed.
$( document ).ready( loadStyle );
function loadStyle() {
	var stylePreference = localStorage.getItem("loadout");
	if(stylePreference) {
		if(stylePreference === "dark") {
			
			document.getElementById("style").href = "/stylesheets/dark.css";
			document.getElementById("bootstrap-theme").href = "/stylesheets/bootstrap-dark.min.css";
			//Check the switch button is set correctly
			$( "#switch" ).prop( "checked", true );
			//Draws the dark graphs
			drawChartsDark();
		}
		else {
		    document.getElementById("style").href = "/stylesheets/light.css";
			document.getElementById("bootstrap-theme").href = "/stylesheets/bootstrap-light.min.css";
			//Check the switch button is set correctly
			$("#switch").prop( "checked", false );
			//Draws the light graphs
			drawchartsLight();
		}
	//Incase there's no localStorage draws the light graph	
	}else {
		drawchartsLight();
	}
};

//loads a screen to cover the changing of themes and accidental blinding
$(window).on('load', function () {
	$("#coverScreen").hide();
});