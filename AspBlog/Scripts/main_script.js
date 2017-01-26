'use strict';

var blog_app = angular.module("blog_app", ["ngRoute"]);
blog_app.controller('main_controller', function ($scope, $location) {
    $scope.model = {
        title: "Food Blog",
        header_entries: ["Home", "Recipes", "Contact"],

        changeView: function (view_name) {
            $location.url("/" + view_name);
        }
    };
});

blog_app.config(function ($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "/AngularViews/Home"
    })
    .when("/Home", {
        templateUrl: "/AngularViews/Home"
    })
    .when("/Contact", {
        templateUrl: "/AngularViews/Contact"
    });

});