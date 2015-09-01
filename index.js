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
					fileEntry.moveTo(dataDir, nomearquivo, fsSuccess, fsFail);

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
			alert("parece que gravou");
		}
		
		var fsFail = function(error) {
			alert("failed with error code: " + error.code);

		};

		var dirFail = function(error) { alert("Directory error code: " + error.code); };
	}


		// window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, onError);
		
		// function onFSSuccess(fileSystem) {
			// alert('sucesso');
			// fs = fileSystem;
			// fileSystem.root.getDirectory("fotos", {create: true, exclusive: false}, grava, fail);
		// }
		
		// function grava(dirEntry) {
			// contador ++;
			// var nomearquivo = "foto_" + contador + ".jpg";
			// alert("Directory Name: " + dirEntry.name);
			// dirEntry.getFile(nomearquivo, {create: true, exclusive: true}, pegueiArquivo);
		// }
	
		// function pegueiArquivo(arquivo) {
			// alert('cheguei apos a criacao do arquivo');
			// alert(arquivo.name);
		// }
	
		// function fail(error) {
			// alert("Nao abri o diretorio: " + error.code);
		// }
		  
		  
		// function onError(message)  {
			 // alert("erro: " + message );
		// }
		
      },
      function( message ) {
        alert("erro? " + message );
      },
      {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI
      });
    },
	
	lefotos: function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT,0, function(fileSystem) {
			var root = fileSystem.root;
			var nomearquivo;
			root.getDirectory("fotos", {
					create : true
				}, function(dataDir) {
					nomearquivo = "foto_1.jpg";
					dataDir.getFile(nomearquivo, gfSuccess, gfFail);

				}, dirFail);
			
			var reader = root.createReader();
		}, onError);
		
		var dirFail = function(error) { alert("Directory error code: " + error.code); };
		var gfFail = function(error) { alert("Nao peguei o arquivo: " + error.code); };
		var onError = function(error) { alert("Erro: " + error.code); };
		
		var dfSuccess = function(arquivo) {
			arquivo.file(function(file) {
				var reader = new FileReader();
				reader.onload = function(evt) {
					var img = document.querySelector('#firtImagge');
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
			fotos += "foto: <img src='" + results.rows.item(i).foto + "'><br>";
		}
		var divteste = document.getElementById('divteste');
		var divfotos = document.getElementById('div1');
		divteste.innerHTML = s;
		divfotos.innerHTML = fotos;
		divfinal.innerHTML = 'DIV FINAL';
	}
}
	