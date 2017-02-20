'use strict';

var blog_app = angular.module("blog_app", ["ngRoute"]);
blog_app.controller('main_controller', function ($scope, $location) {
    
    $scope.title = "Food Blog";
    $scope.header_entries = ["Home", "Recipes", "Contact"];
    $scope.changeView = function (view_name) {
        $location.url("/" + view_name);
    };

    $scope.container_height = 0;
    $scope.access = {
        setContainerHeight: function (height) {
            $scope.container_height = height;
        }
        
    };
    
});



blog_app.controller('home_controller', function ($scope, $location, $http) {
    var home_post_container_height = 500;
    $scope.posts = [];
    $http.get("/api/BlogAPI/GetLastNPosts?n=5")
        .then(function (result) {
            $scope.posts = restoreLineBreaks(angular.fromJson(result.data));
            $scope.$parent.access.setContainerHeight(home_post_container_height * $scope.posts.length);
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

blog_app.controller('post_controller', function ($scope, $routeParams, $http, $timeout) {
    $scope.post = {};
    $http.get("api/BlogAPI/GetPostById?id=" + $routeParams.postId)
        .then(function (result) {
            $scope.post = angular.fromJson(result.data);
            console.log($scope.post.Ingredients);
            $timeout(function () {
                $scope.$parent.access.setContainerHeight(document.getElementById("post_container").offsetHeight);
            }, 0);
            
        });
});

function restoreLineBreaks(posts) {
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        post.IntroText = post.IntroText.trim();
    }
    return posts;
}



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