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
		.service('YoutubeService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
		
			var service = this;
			var results = [];
			
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
			
			var playlist = [
			    {id: 'RC4jFX7Qvys', title: 'Felix Jaehn - Shine (ft. Freddy Verano & Linying)'},
			    {id: 'nVcpqj66SFI', title: 'Christine And The Queens - Saint Claude (Dim Sum Remix)'},
			    {id: 'QcIy9NiNbmo', title: 'Taylor Swift - Bad Blood ft. Kendrick Lamar'},
			    {id: 'nH7bjV0Q_44', title: 'Hozier - Work Song'}
				];
		  
		  	$window.onYouTubeIframeAPIReady = function() {
		  	    youtube.ready = true;
			    service.bindPlayer('placeholder');
			    service.loadPlayer();
			    $rootScope.$apply();
		  	};
		  
		    function onYoutubeReady (event) {
			    $log.info('YouTube Player is ready');
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
			  
			this.bindPlayer = function (elementId) {
				$log.info('Binding to ' + elementId);
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
			    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
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
				
			  this.listResults = function (data) {
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
			    return results;
			  };
				  	  
			  this.addVideo = function (id, title) {
				playlist.push({
				      id: id,
				      title: title
				});
				console.log(playlist);
			  };
			
			  this.deleteVideo = function (id) {
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
	
	Yougular.controller('MainController', function($scope, $http, $log, YoutubeService){
		
		$scope.title= 'Yougular';
		
		init();
	
	    function init() {
	      	$scope.youtube = YoutubeService.getYoutube();
	      	$scope.results = YoutubeService.getResults();
	      	$scope.playlist = YoutubeService.getPlaylist();
	      	$scope.playlistShow = true;
	    }
    
		$scope.search = function(){
		  	var q = $('#search-input').val();
		  	var request = gapi.client.youtube.search.list({
		      q: q,
	          type: 'video',
	          maxResults: '5',
	          part: 'id,snippet',
	          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle'
		  	});
		
		  	request.execute(function(response) {
			    YoutubeService.listResults(response.result);
			    $scope.results = YoutubeService.getResults();
			});
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
			
	});


}());
