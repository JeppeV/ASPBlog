'use strict';

var blog_app = angular.module("blog_app", ["ngRoute"]);

blog_app.controller('main_controller', function ($scope, $location, $http) {
    
    $scope.title = "Food Blog";
    $scope.header_entries_text = ["Home", "Recipes", "Contact"];
    $scope.types = [];
    $scope.tags = {
        all: [],
        unselected: [],
        selected: [],
        init: function (tags) {
            this.all = tags;
            // use slice to copy array
            this.unselected = this.all.slice();
        },
        select: function(index) {
            var tag = this.unselected[index];
            this.unselected.splice(index, 1);
            this.selected.push(tag);
            this.updateView();
        },
        unselect: function(index) {
            var tag = this.selected[index];
            this.selected.splice(index, 1);
            this.unselected.push(tag);
            this.updateView();
        },
        clearSelection: function () {
            // clear selected by setting length to 0
            this.selected.length = 0;
            // use slice to copy array
            this.unselected = this.all.slice();
        },
        updateView: function () {
            if (this.selected.length === 0) {
                $scope.changeView('Home');
                return;
            }
            var tagsString = "";
            for (var i = 0; i < this.selected.length-1; i++) {
                tagsString += this.selected[i] + ",";
            }
            tagsString += this.selected[this.selected.length - 1];
            $scope.showPostsByTags(tagsString);
        }
    }
    $http.get("/api/BlogAPI/GetAllTypes")
        .then(function (result) {
            $scope.types = angular.fromJson(result.data);
        });

    $http.get("/api/BlogAPI/GetAllTags")
       .then(function (result) {
           $scope.tags.init(angular.fromJson(result.data));
           
       });

    $scope.container_height = 0;
    $scope.setContainerHeight = function (height) {
        if (height < 500) {
            $scope.container_height = 500;
        } else {
            $scope.container_height = height;
        }
    };

    $scope.changeView = function (view_id) {
        $location.url("/" + view_id);
    };

    $scope.showPostsByTags = function (tag) {
        $scope.changeView("Home/Tags/" + tag);
    }

    
});



blog_app.controller('list_controller', function ($scope, $location, $routeParams, $http) {
    const list_post_container_height = 500;
    $scope.posts = [];
    if ($routeParams.tags) {
        var tagsArray = $routeParams.tags.split(',');
        $http.get("/api/BlogAPI/GetPostsByTags?search_tags_json=" + angular.toJson(tagsArray))
            .then(addPostsToList);
    } else if ($routeParams.type) {
        $scope.$parent.tags.clearSelection();
        $http.get("/api/BlogAPI/GetPostsByType?type_json=" + angular.toJson($routeParams.type))
            .then(addPostsToList);
    } else {
        $http.get("/api/BlogAPI/GetLastNPosts?n=5")
            .then(addPostsToList);
    }

    function addPostsToList(result) {
        $scope.posts = angular.fromJson(result.data);
        $scope.$parent.setContainerHeight(list_post_container_height * $scope.posts.length);
    };
    
    $scope.goToPost = function (postId) {
        $location.url("/Post/" + postId);
    };
});

blog_app.controller('post_controller', function ($scope, $routeParams, $http, $timeout) {
    $scope.post = {};
    $http.get("api/BlogAPI/GetPostById?id=" + $routeParams.postId)
        .then(function (result) {
            $scope.post = angular.fromJson(result.data);
            $timeout(function () {
                $scope.$parent.setContainerHeight(document.getElementById("post_container").offsetHeight);
            }, 0);

        });
    $scope.getTagsAsString = function (tags) {
        var result = "";
        for (var i = 0; i < tags.length - 1; i++) {
            result += tags[i].Text + ", ";
        }
        result += tags[tags.length - 1].Text;
        return result;
    }
});

blog_app.controller('contact_controller', function ($scope, $routeParams, $http, $timeout) {
    $scope.$parent.tags.clearSelection();
    $scope.contactInfo = {};
    $http.get("api/BlogAPI/GetContactInfo")
        .then(function (result) {
            $scope.contactInfo = angular.fromJson(result.data);
            $scope.$parent.setContainerHeight(600);

        });
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



blog_app.config(function ($routeProvider) {
    $routeProvider.caseInsensitiveMatch = true;
    $routeProvider
    .when("/", {
        templateUrl: "/AngularViews/List"
    })
    .when("/Home", {
        templateUrl: "/AngularViews/List"
    })
    .when("/Home/Tags/:tags", {
        templateUrl: "/AngularViews/List"
    })
    .when("/Home/Type/:type", {
        templateUrl: "/AngularViews/List"
    })
    .when("/Contact", {
        templateUrl: "/AngularViews/Contact"
    })
    .when("/Post/:postId", {
        templateUrl: "/AngularViews/Post"
    });

});