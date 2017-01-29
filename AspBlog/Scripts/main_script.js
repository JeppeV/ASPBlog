'use strict';

var blog_app = angular.module("blog_app", ["ngRoute"]);
blog_app.controller('main_controller', function ($scope, $location) {
    $scope.title = "Food Blog";
    $scope.header_entries = ["Home", "Recipes", "Contact"];
    $scope.changeView = function (view_name) {
        $location.url("/" + view_name);
    }
    
});



blog_app.controller('home_controller', function ($scope, $location, $http) {
    $scope.posts = [];
    $http.get("/api/BlogAPI/GetLastNPosts?n=5")
        .then(function (result) {
            $scope.posts = angular.fromJson(result.data);
        });

    $scope.goToPost = function (postId) {
        $location.url("/Post/" + postId);
    };
});

blog_app.filter('text_length_filter', function () {
    return function (input) {
        if (!input) return "";
        var length = 700;
        var output = input.substring(0, length);
        if (input != output) output += "...";
        return output;
    };
});

blog_app.controller('post_controller', function ($scope, $routeParams, $http) {
    $scope.post = {};
    $http.get("api/BlogAPI/GetPostById?id=" + $routeParams.postId)
        .then(function (result) {
            $scope.post = angular.fromJson(result.data);
        });
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
    })
    .when("/Post/:postId", {
        templateUrl: "/AngularViews/Post"
    });

});