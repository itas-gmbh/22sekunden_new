function start() {
    jquery.ajax('https://22sekunden.at/wp-content/plugins/22sek-video/record/index.html', {
        		success: function (data) {
				jquery('#main').html(data);

        		},
        		error: function (data) {
            			console.log(data);
				alert("Verbindunsfehler - try again later");
        		}
    		});


}



