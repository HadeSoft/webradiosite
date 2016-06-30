var HTTP			= require('http');
var SpotifyWebApi	= require('spotify-web-api-node');


/* Authorization Settings */
var auth = {
	'api'			: null,
	'auth_complete'	: false,
	'code'			: '',
	'id'			: '4f9161fe843c4a4da25c597a8bb1ff35',
	'scope'			: [
		'playlist-modify-private',
		'playlist-read-private',
		'playlist-read-collaborative',
		'playlist-modify-public',
		'streaming'
	],
	'secret'		: '0265a166a1cc457d8147d55113ae79f8',
	'state'			: '',
	'state_size'	: 10,
	'uri'			: 'http://cerberus-radio.herokuapp.com/'
};


/* Auth Global Functions */

/**
 *  Get authorization URL
 */
auth.getAuthURL = function (){

	// Create auth key
	auth.state	= generateString(auth.state_size);

	// Construct spotify api
	auth.api	= new SpotifyWebApi({
		clientId		: auth.id,
		clientSecret	: auth.secret,
		redirectUri		: auth.uri
	});

	return auth.api.createAuthorizeURL(auth.scope, auth.state);
}

/**
 * Validate return from spotify
 * 
 * @param {request} req (Express request to test)
 */
auth.testCallback = function (req){

	console.dir(req.query);

	//check for callback
	var checkCode = req.query['code'] || undefined;
	if (typeof checkCode === undefined)
		return false
	
	if (req.query.state === auth.state) {
		auth.code = checkCode;
		auth.auth_complete = true;
		return true;
	}

	console.error("Failed");
	return false;
}

/**
 * Use code to authorize application
 * 
 * @param {string} code (Auth code if not previously set)
 * @param {function} callback (Callback after authorization is finished)
 * @param {function} error (Callback if authorization throws an error)
 */
auth.finishAuthorization = function (callback, error, code){
	
	var authCode = code || auth.code;

	auth.api.authorizationCodeGrant(authCode)
	.then(function (data){

		auth.api.setAccessToken(data.body['access_token']);
		auth.api.setRefreshToken(data.body['refresh_token']);

		callback(data);

	}, function (err){
		error(err);
	});
}

module.exports = auth;

/**
 * Generate a string of set length, for state
 * 
 * @param {string} size (size of string)
 */
function generateString (size){

	var str = '';

	while (size > 0) {

		var ascIndx	= Math.floor(Math.random() * 26) + 97;
		var char	= String.fromCharCode(ascIndx);
		
		str += char;
		size--;

	}

	return str;

}