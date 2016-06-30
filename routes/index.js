var express		= require('express');
var router		= express.Router();

var spotifyAuth	= require('../lib/spotify-auth');
var Interface	= require('../lib/spotify-socket');

var io;

router.setSocketListener = function (server) {
	io = new Interface(server);
}

/* GET home page. */
router.get('/', function(req, res, next) {

	if (!spotifyAuth.auth_complete) {

		if (spotifyAuth.testCallback(req)) {

			spotifyAuth.finishAuthorization(function (data){

				io.buildCtrls(spotifyAuth.api);
				spotifyAuth.auth_complete = true;

				res.redirect('/');

				return;
			}, function (err){

				console.error(err);

			});
		} else {
			
			res.redirect('/auth');
			
			return;
		}
	}

	res.render('index');

});

/* Start authorizing spotify */
router.get('/auth', function (req, res, next){

	if (spotifyAuth.auth_complete) {
		res.redirect('/');
		return;
	}

	var authURL = spotifyAuth.getAuthURL();
	console.log(authURL);


	res.redirect(301, authURL);

});

module.exports = router;
