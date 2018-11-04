//the button toggles the css file. the app remembers the last chosen settings and reloads the app with the last file loaded instead of the default 
var theme = document.getElementsByClassName("theme")
//toggles css files. saves value of either day or night to localstorage
function changeCss() {
	if($( "#switch" ).prop( "checked")) {
		localStorage.setItem("loadout", "dark")
		theme[0].href = "/css/dark.css";		
		theme[1].href = "/css/dark.css";
		try {
			drawCharts('dark');
		}
		catch(e){	
		}
	}
	else{
		localStorage.setItem("loadout", "light")
		theme[0].href = "/css/light.css";		
		theme[1].href = "/css/light.css";
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
            theme[0].href = "/css/dark.css";		
			theme[1].href = "/css/dark.css";
			$( "#switch" ).prop( "checked", true );
			try {
				drawCharts('dark');
			}
			catch(e){
			}
		}
		
		else {
			$("#switch").prop( "checked", false );
            theme[0].href = "/css/light.css";		
			theme[1].href = "/css/light.css";
			try {
				drawCharts('light');
			}
			catch(e){
			}
		}
	//Incase there's no localStorage draws the light graph	
	} else {
        theme[0].href = "/css/light.css";		
		theme[1].href = "/css/light.css";
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
