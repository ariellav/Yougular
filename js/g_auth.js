// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = '1093887878344-ohe4v6jj4jg8qivmu4iisrit0cqd2fhs';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

// Upon loading, the Google APIs JS client automatically invokes this callback.
	googleApiClientReady = function() {
	  gapi.auth.init(function() {
	    window.setTimeout(checkAuth, 1);
	  });
	};

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: true
  }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
	    $('.pre-auth').hide();
	    $('.post-auth').show();
	    loadAPIClientInterfaces();
  } else {
	    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
	    // client flow. The current function is called when that flow completes.
	    $('#login-link').click(function() {
	      gapi.auth.authorize({
	        client_id: OAUTH2_CLIENT_ID,
	        scope: OAUTH2_SCOPES,
	        immediate: false
	        }, handleAuthResult);
	    });
  }
}

// http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    handleAPILoaded();
  });
}

function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
}
