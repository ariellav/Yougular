describe('YoutubeController Test', function() {

	beforeEach(module('Yougular'));
	
	var MainController,
	scope;

	beforeEach(inject(function ($rootScope, $controller) {
		scope = $rootScope.$new();
		MainController = $controller('MainController', {
		$scope: scope
		});
	}));
	
	
	it('has the title name "Yougular"', function () {
		expect(scope.title).toEqual('Yougular');
	});
	it('creates a playlist array of 4', function () {
		expect(scope.playlist.length).toBe(4);
	});
	
	

});