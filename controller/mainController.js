(function() {
	
	var Yougular = angular.module('Yougular', [])
		.run(function () {
			  var tag = document.createElement('script');
			  tag.src = 'https://www.youtube.com/iframe_api';
			  var firstScriptTag = document.getElementsByTagName('script')[0];
			  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		})
		.config(function ($httpProvider) {
	  		delete $httpProvider.defaults.headers.common['X-Requested-With'];
		})
		.service('YoutubeService', ['$window', '$rootScope', function ($window, $rootScope) {
		
			var service = this;
			var results = [];
			var playlist = [];
			var current;
			
			var youtube = {
			    ready: false,
			    player: null,
			    playerId: null,
			    videoId: 'RC4jFX7Qvys',
			    videoTitle: 'Felix Jaehn - Shine (ft. Freddy Verano & Linying)',
			    playerHeight: '350',
			    playerWidth: '100%',
			    state: 'stopped'
			};
			
			// var playlist = [
			    // {id: 'RC4jFX7Qvys', title: 'Felix Jaehn - Shine (ft. Freddy Verano & Linying)'},
			    // {id: 'nVcpqj66SFI', title: 'Christine And The Queens - Saint Claude (Dim Sum Remix)'},
			    // {id: 'QcIy9NiNbmo', title: 'Taylor Swift - Bad Blood ft. Kendrick Lamar'},
			    // {id: 'nH7bjV0Q_44', title: 'Hozier - Work Song'}
				// ];
		  
		  	$window.onYouTubeIframeAPIReady = function() {
		  	    youtube.ready = true;
			    service.bindPlayer('placeholder');
			    service.loadPlayer();
			    $rootScope.$apply();
		  	};
		  
		    function onYoutubeReady (event) {
			    console.log('Youtube is ready');
		  	}
		
			function onYoutubeStateChange (event) {
			    if (event.data == YT.PlayerState.PLAYING) {
			      	youtube.state = 'playing';
				} else if (event.data == YT.PlayerState.PAUSED) {
			  		youtube.state = 'paused';
				} else if (event.data == YT.PlayerState.ENDED) {
			  		youtube.state = 'ended';
				    service.launchPlayer(playlist[0].id, playlist[0].title);
				}
				    $rootScope.$apply();
			}
			
			function listResults(data) {
			    results.length = 0;
			    for (var i = data.items.length - 1; i >= 0; i--) {
			      results.push({
			        id: data.items[i].id.videoId,
			        title: data.items[i].snippet.title,
			        description: data.items[i].snippet.description,
			        thumbnail: data.items[i].snippet.thumbnails.default.url,
			        author: data.items[i].snippet.channelTitle
			      });
			    }
			    $rootScope.$apply();
			    return results;
			  };
			  
			this.bindPlayer = function (elementId) {
			    youtube.playerId = elementId;
			};
		
			this.loadPlayer = function () {
			    if (youtube.ready && youtube.playerId) {
			      if (youtube.player) {
			        youtube.player.destroy();
			      }
			      youtube.player = service.createPlayer();
			    }
			};
		
			this.createPlayer = function () {
				return new YT.Player(youtube.playerId, {
					height: youtube.playerHeight,
					width: youtube.playerWidth,
					videoId: youtube.videoId,
					playerVars: {
					    rel: 0,
					    showinfo: 0
					},
			  		events: {
			    		'onReady': onYoutubeReady,
						'onStateChange': onYoutubeStateChange
					}
				});
			};
				  
			  this.launchPlayer = function (id, title) {
			    youtube.player.loadVideoById(id);
			    youtube.videoId = id;
			    youtube.videoTitle = title;
			    return youtube;
			  };
			  
			  this.search = function () {
			  	var q = $('#search-input').val();
				  	var request = gapi.client.youtube.search.list({
				      q: q,
			          type: 'video',
			          maxResults: '5',
			          part: 'id,snippet',
			          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle'
				  	});
				
				  	request.execute(function(response) {
					    listResults(response.result);
					});
			  };
			  
			  this.requestVideoPlaylist = function(playlistId) {
			  	  current = playlistId;
			  	  playlist.length = 0;
				  var requestOptions = {
				    playlistId: playlistId,
				    part: 'snippet',
				    maxResults: 10
				  };
				  var request = gapi.client.youtube.playlistItems.list(requestOptions);
				  request.execute(function(response) {
				  	if (response.result) {
				      var playlistItems = response.result.items;
				      $('#playlist-noresult').html('');
				      $.each(playlistItems, function(index, item) {
				        playlist.push(item.snippet);
				      });
				      $rootScope.$apply();
				    } else {
				      playlist.length = 0;
				      $('#playlist-noresult').html('No results for this playlist');
				    }
				  
				  });
				};
				  	  
			  this.addVideo = function (id, title) {
					var request = gapi.client.youtube.playlistItems.insert({
					    part: 'snippet',
					    'resource' : { 'snippet': {
			                  'playlistId': current, 
			                  'resourceId': {
			                      'kind': 'youtube#video',
			                      'videoId': id
			                   }
			                }
			             }
					  });
				  	request.execute(function(response) {
				  		if (response.code = 403)
				  			$('#search-error').html('Playlist is full');
				  			
					    console.log(response);
					    $rootScope.$apply();
					});
			  };
			
			  this.deleteVideo = function (id) {
			    // var request = gapi.client.youtube.videos.delete({
					     // id: id,
					     // 'onBehalfOfContentOwner': 'identifier'
					  // });
				  	// request.execute(function(response) {
					    // console.log(response);
					// });
					for (var i = playlist.length - 1; i >= 0; i--) {
				      if (playlist[i].id === id) {
				        playlist.splice(i, 1);
				        break;
				      }
				    }
			  };

			  this.getYoutube = function () { return youtube; };
			  this.getResults = function () { return results; };
			  this.getPlaylist = function () { return playlist; };
			  
	}]);
	
	//MainController
	
	Yougular.controller('MainController', function($scope, $http, YoutubeService){
		
		$scope.title= 'Yougular';
		
		init();
	
	    function init() {
	      	$scope.youtube = YoutubeService.getYoutube();
	      	$scope.results = YoutubeService.getResults();
	      	$scope.playlist = YoutubeService.getPlaylist();
	      	$scope.playlistShow = true;
	    }
    
		$scope.getPlaylist = function(num){
		  	var request = gapi.client.youtube.channels.list({
			    mine: true,
			    part: 'contentDetails'
			  });
		  	request.execute(function(response) {
		  		switch(num) {
				    case 0:
				        playlistId = response.result.items[0].contentDetails.relatedPlaylists.favorites;
				        break;
				    case 1:
				        playlistId = response.result.items[0].contentDetails.relatedPlaylists.likes;
				        break;
				    case 2:
				        playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
				        break;
				    case 3:
				        playlistId = response.result.items[0].contentDetails.relatedPlaylists.watchHistory;
				        break;
				    case 4:
				        playlistId = response.result.items[0].contentDetails.relatedPlaylists.watchLater;
				        break;
				    default:
				        console.log('error');
				}
			 
			    YoutubeService.requestVideoPlaylist(playlistId);
			});
		};
		
		$scope.search = function(){
			YoutubeService.search();
		};
		$scope.launch = function (id, title) {
	      	YoutubeService.launchPlayer(id, title);
	    };
	    $scope.add = function (id, title) {
	      	YoutubeService.addVideo(id, title);
	    };
	    $scope.delete = function (id) {
			YoutubeService.deleteVideo(id);
    	};
    	$scope.test = function () {
    		var request = gapi.client.youtubePartner.contentOwners.list(fetchMine=true);
    		request.execute(function(response) {
					    console.log(response + "");
			});
    	};
			
	});


}());
