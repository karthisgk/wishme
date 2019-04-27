'use strict';

const app = angular.module('app',['ui.bootstrap']);

app.service('appService',  function ($http) {
	return new AppService($http);
});
