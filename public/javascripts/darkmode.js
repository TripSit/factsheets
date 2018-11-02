//the button toggles the css file. the app remembers the last chosen settings and reloads the app with the last file loaded instead of the default 

//toggles css files. saves value of either day or night to localstorage
function changeCss() {
	if($( "#switch" ).prop( "checked")) {
		localStorage.setItem("loadout", "dark")
		document.getElementById("theme").href = "/stylesheets/dark.css";
		try {
			drawCharts('dark');
		}
		catch(e){	
		}
	}
	else{
		localStorage.setItem("loadout", "light")
		document.getElementById("theme").href = "/stylesheets/light.css";
		try {
			drawCharts('light');
		}
		catch(e){
		}
	}
}



function loadStyle() {
	var stylePreference = localStorage.getItem("loadout");
	if(stylePreference) {
		if(stylePreference === "dark") {
            document.getElementById("theme").href = "/stylesheets/dark.css";
			$( "#switch" ).prop( "checked", true );
			try {
				drawCharts('dark');
			}
			catch(e){
			}
		}
		
		else {
			$("#switch").prop( "checked", false );
            document.getElementById("theme").href = "/stylesheets/light.css";
			try {
				drawCharts('light');
			}
			catch(e){
			}
		}
	//Incase there's no localStorage draws the light graph	
	} else {
        document.getElementById("theme").href = "/stylesheets/light.css";
		try {
			drawCharts('light');
		}
		catch(e){
		}
	}
};

$(window).on('load', function () {
	$("#coverScreen").hide();
	loadStyle();
});
