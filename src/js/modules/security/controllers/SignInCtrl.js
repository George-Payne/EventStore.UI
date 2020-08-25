define(['./_module'], function (app) {

    'use strict';

    return app.controller('SignInCtrl', [
		'$scope', '$rootScope', '$state', '$location', 'AuthService', 'MessageService', 'InfoService', 'ScavengeNotificationService',
		function ($scope, $rootScope, $state, $location, authService, msg, infoService, scavengeNotificationService) {

			$scope.log = {
				username: '',
				password: ''
			};


			$scope.signIn = function () {
				if ($scope.login.$invalid) {
					msg.warn('Please fix all validation errors');
					return;
				}

				authService.validate($scope.log.username, $scope.log.password)
				.then(function () {
					authService.setCredentials($scope.log.username, $scope.log.password);
					setSingleNodeOrCluster();
					redirectAfterLoggingIn();
				}, function (error) {
					if(error.statusCode === 401){
						msg.warn('Incorrect user credentials supplied.');
					} else{
						msg.failure('Failed to validate user: ' + error.message);
					}
				});
			};

			function setSingleNodeOrCluster(){
				scavengeNotificationService.start();
				infoService.getOptions().then(function onGetOptions(response){
					var options = response.data;
					for (var index in options) {
						if(options[index].name === 'ClusterSize' && options[index].value > 1){
							$rootScope.singleNode = false;
						}
					}
				});
            }

			function redirectAfterLoggingIn() {
				if($rootScope.previousUrl && $rootScope.previousUrl !== '/'){
					var urltoNavigateTo = $rootScope.previousUrl;
					$rootScope.previousUrl = null;
					$location.path(urltoNavigateTo);
				}else{
					$state.go('dashboard.list');
				}
			}

			function checkCookie () {
				authService.existsAndValid()
				.then(function () {
					redirectAfterLoggingIn();
				});
			}

			checkCookie();

		}
	]);


});
