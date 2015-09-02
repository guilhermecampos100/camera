var db;
var fs;
var contador = 0;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		this.onDeviceReady();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
		
		//db = window.sqlitePlugin.openDatabase({name: "my.db"});
		db =  window.openDatabase("MeuBanco", "1.0", "Cordova Demo", 200000);
		db.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (foto text)');
		});
    },

    takePicture: function() {
      navigator.camera.getPicture( function( imageURI ) {
        alert( imageURI );
		var largeImage = document.getElementById('smallImage');
		largeImage.style.display = 'block';
		largeImage.src = imageURI;

		db.transaction(function(tx) {
			tx.executeSql("INSERT INTO test_table (foto) VALUES (?)", [imageURI], function(tx, res) {
				console.log("insertId: " + res.insertId + " -- " + imageURI);
				console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");		
			});
		});
		
		
		getImageURI(imageURI);
		 
		function getImageURI(imageURI) {

		var gotFileEntry = function(fileEntry) {
			alert("got image file entry: " + fileEntry.fullPath);
			var gotFileSystem = function(fileSystem) {

				fileSystem.root.getDirectory("fotos", {
					create : true
				}, function(dataDir) {

					contador ++;
					var nomearquivo = "foto_" + contador + ".jpg";
					fileEntry.copyTo(fileSystem.root, nomearquivo , fsSuccess, fsFail);
					
					fileEntry.copyTo(dataDir, nomearquivo, fsSuccess, fsFail);
					

				}, dirFail);

			};
			// get file system to copy or move image file to
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem,
					fsFail);
		};
		// resolve file system for image
		window.resolveLocalFileSystemURL(imageURI, gotFileEntry, fsFail);

		// file system fail
		var fsSuccess = function(arquivo) {
			alert("parece que gravou " + arquivo.name + " - " + arquivo.fullPath);
		}
		
		var fsFail = function(error) {
			alert("failed with error code: " + error.code);

		};

		var dirFail = function(error) { alert("Directory error code: " + error.code); };
	}

		
      },
      function( message ) {
        alert("erro? " + message );
      },
      {
        quality: 40,
        destinationType: Camera.DestinationType.FILE_URI,
		allowEdit : true,
	    encodingType: Camera.EncodingType.JPEG,
	    targetWidth: 300,
	    targetHeight: 300
		
      });
    },
	
	lefotos: function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT,0, function(fileSystem) {
			var root = fileSystem.root;
			var nomearquivo;
			nomearquivo = "foto_1.jpg";
			root.getFile(nomearquivo, {create: false}, gfSuccess, gfFail); 
			nomearquivo = "foto_2.jpg";
			root.getFile(nomearquivo, {create: false}, gfSuccess, gfFail); 
			nomearquivo = "foto_3.jpg";
			root.getFile(nomearquivo, {create: false}, gfSuccess, gfFail); 			
		}, onError);
		
		function gfFail(error) {
			alert("Nao peguei o arquivo: " + error.code); 
			};
			
		function onError(error) { alert("Erro: " + error.code); };
		
		function gfSuccess(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new FileReader();
				reader.onload = function(evt) {
					var img;
					if (file.name.indexOf("foto_1.jpg") > -1) {
						img = document.querySelector('#firstImage');
					}
					if (file.name.indexOf("foto_2.jpg") > -1) {
						img = document.querySelector('#secondImage');
					}
					if (file.name.indexOf("foto_3.jpg") > -1) {
						img = document.querySelector('#thirdImage');
					}
					img.src = evt.target.result;

				};
				reader.onerror = function(evt) {
					alert('erro carregando o arquivo: ' + evt.target.error.code);
				};
				reader.readAsDataURL(file);
			}, onError);
		}
	},
	
	
	callAnothePage: function()
	 {
		window.location = "camera.html";
	 },
	 
	pegadados: function() {
		db.transaction(function(tx) {
		tx.executeSql("select foto from test_table",[],mostraconteudo,voltaerro);
		});
	},

	legps: function() {
		var onSuccess = function(position) {
			alert('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');
		};

		// onError Callback receives a PositionError object
		//
		function onError(error) {
			alert('code: '    + error.code    + '\n' +
				  'message: ' + error.message + '\n');
		}

		navigator.geolocation.getCurrentPosition(onSuccess, onError);
	}
	
};



	
	
 function voltaerro(err){
	alert("OPS Deu Erro no banco: "+err.message + "\nCode="+err.code);
}

 function mostraconteudo(tx,results){
	console.log("render entries");
	if (results.rows.length == 0) {
	alert("Ainda nao tem foto");
	} else {
		alert(results.rows.length + " fotos no bd");
		var s = "";
		var fotos = "";
		for(var i=0; i<results.rows.length; i++) {
			s += "<li>"+results.rows.item(i).foto + "</li>";
			fotos += "foto: <img src='" + results.rows.item(i).foto + "' width='100px'><br>";
		}
		var divteste = document.getElementById('divteste');
		var divfotos = document.getElementById('div1');
		divteste.innerHTML = s;
		divfotos.innerHTML = fotos;
		divfinal.innerHTML = 'DIV FINAL';
	}
}
	