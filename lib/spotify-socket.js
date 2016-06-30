var Socket = require('socket.io');
var Controls	= require('./spotify-control');
var ctrls;
var songRunning = false;
var userTimeout = [];

var spotifyInterface = function (server){
	
	this.io = Socket(server);
	this.buildCtrls = constructControls;

}

function defineListeners (io){

	// Wait for connection
	io.on('connect', function (socket){

		console.log("Socket is connected");
		console.dir(ctrls);

		getTracks(io);

	});

	io.sockets.on('connection', function (socket){

		socket.on('searchWith', function (query){

			query.id = '/#' + query.id;

			if (!io.sockets.connected[query.id]) {
				console.error("ID Not Connected");
				return;
			}

			ctrls.searchUsing(query)
			.then(function (results){

				console.dir(results);
				io.to(query.id).emit('searchResults', results.body);

			}, function (error){
				console.error(error);
			});

		});

		socket.on('addTrack', function (data){

			var thisUser = data.id;
			if (userTimeout.indexOf(thisUser) == -1) {

				userTimeout.push(thisUser);
				setTimeout(function (id){
					var indx = userTimeout.indexOf(id);
					userTimeout.splice(indx, 1);
				}, 10000, thisUser);

				ctrls.addToPlaylist(data.track)
				.then(function (data){
					console.dir(data);
					getTracks(io);
				}, function (error){
					console.error(error);
				});

			}

		});

	});

}

function constructControls (api){

	ctrls = new Controls(api);
	defineListeners(this.io);

}

function getTracks (io){

	try {

		ctrls.getPlaylist()
		.then(function (tracks){
			
			console.log("SOCKET: sending?");
			var snapshot = tracks.snapshot_id;

			if (!songRunning) {
				console.log(">>>>>>" + songRunning);
				songRunning = true;
				var currentSong = tracks.tracks.items[0].track;
				// Wait for current track to aprox. finish
				// before removing it from the playlist
				setTimeout(function (){
					ctrls.removeTrackAt(1, currentSong, snapshot)
					.then(function (msg){
						console.log(msg);
						songRunning = false;
						getTracks(io);
					}, function (err){
						console.error('could not remove track');
						console.error(err);
					});

				}, currentSong.duration_ms);

				console.log("waiting for " + currentSong.duration_ms)
			}

			io.emit('trackUpdate', tracks.tracks.items);

		}, function (err){
			console.error(err);
		});

	} catch (error) {
		console.error("ctrls not yet definied");
		console.error(error);
	}

}

module.exports = spotifyInterface;