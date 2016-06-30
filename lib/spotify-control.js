var Promise = require('promise');

function SpotifyControls (api){

	var _api		= api;
	var _playlist	= '4CZWkWlVECs31YeIk9VWbj';
	var _me;

	_api.getMe()
	.then(function (data){

		_me		= data.body;
		console.log("API READY");
		
	}, function (error){

		console.error(error);

	});

	this.getPlaylist = function (){
		return new Promise(function (resolve, reject){
			console.log("User: ");
			console.dir(_me);

			if (_me === undefined)
				reject("API NOT YET READY");

			_api.getPlaylist(_me.id, _playlist)
			.then(function (data){

				resolve(data.body);

			}, function (err){

				reject("Could not find radio playlist");

			});
		});
	}

	this.removeTrackAt = function (indx, track, snapshot){
		return new Promise(function (resolve, reject){

			_api.removeTracksFromPlaylistByPosition(_me.id, _playlist, [indx - 1], snapshot)
			.then(function (){
				resolve("track removed");
			}, function (err){
				reject(err);
			})

		});
	}

	this.searchUsing = function (queryObj){
		return new Promise(function (resolve, reject){

			var query = "";
			if (queryObj.song !== '')
				query += "track:" + queryObj.song;
			
			if (queryObj.artist !== '')
				query += "artist:" + queryObj.artist;
			

			_api.searchTracks(query)
			.then(function (data){
				resolve(data);
			}, function (err){
				reject(err);
			});

		});
	}

	this.addToPlaylist = function (track){
		return new Promise(function (resolve, reject){

			var uri = track.uri

			_api.addTracksToPlaylist(_me.id, _playlist, [uri])
			.then(function (data){
				resolve(data);
			}, function (err){
				reject(err);
			});

		});
	}

}

module.exports = SpotifyControls;