"use strict";

var admin_app = angular.module("admin_app", []);

var utility = {

    initEmptyTempPost: function () {
        return {
            Title: "",
            Type: "",
            MainImage_temp: null,
            IntroText: "",
            OutroText: "",
            Ingredients: [],
            Steps_temp: [],
            Tags: []
        };
    },

    initExistingTempPost: function (post) {

    },

    buildFinalPostData: function (post_temp) {
        function stringFilter(element) {
            return element.Text != "";
        };

        function getFormattedDateString() {
            const date = new Date();
            return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        };

        var result = {
            post: {
                Title: post_temp.Title.trim(),
                Date: getFormattedDateString(),
                Type: post_temp.Type.trim(),
                MainImageId: post_temp.MainImage_temp ? "exists" : "", //used to detect whether a main image was selected
                IntroText: post_temp.IntroText.trim(),
                OutroText: post_temp.OutroText.trim(),
                Ingredients: post_temp.Ingredients
                    .map(function (ingredient) { return { Text: ingredient.Text.trim() } })
                    .filter(stringFilter),
                Steps: post_temp.Steps_temp
                    .map(function (step) {
                        // set StepImageID to be image info temporarily
                        console.log(step.Image_temp);
                        return { Text: step.Text.trim(), StepImageID: step.Image_temp }
                    })
                    .filter(stringFilter),
                Tags: post_temp.Tags
                    .map(function (tag) { return { Text: tag.Text.trim() } })
                    .filter(stringFilter)
            },
            images: []
        };

        result.images.push(post_temp.MainImage_temp);
        for (var i = 0; i < result.post.Steps.length; i++) {
            var step = result.post.Steps[i];
            if (step.StepImageID) {
                result.images.push(step.StepImageID);

            } else {
                result.images.push(null);
            }
            step.StepImageID = "";
        }
        return result;

    },

    addImagesToPayload: function (images, payload) {
        payload.append('main_image', images[0]);
        for (var i = 1; i < images.length; i++) {
            var image = images[i];
            if (image) {
                payload.append('step_image%' + (i - 1), image);
            }

        }
        return payload;
    },

    isPostValid: function (post) {
        var message = "";
        var result = true;
        if (!(result = result && post.Title)) { message = "Missing Title"; }
        else if (!(result = result && post.Type)) { message = "Missing Type"; }
        else if (!(result = result && post.MainImageId)) { message = "Missing Main Image"; }
        else if (!(result = result && post.IntroText)) { message = "Missing IntroText"; }
        else if (!(result = result && post.OutroText)) { message = "Missing OutroText"; }
        else if (!(result = result && post.Ingredients.length)) { message = "Ingredients list empty"; }
        else if (!(result = result && post.Steps.length)) { message = "Steps list empty"; }
        else if (!(result = result && post.Tags.length)) { message = "Tags list empty"; }

        if (!result) window.alert(message);
        return result;
    },

    getPostById: function (posts, id) {
        for (var i = 0; i < posts.length; i++) {
            var currentPost = posts[i];
            if (currentPost.PostId === id) {
                return currentPost;
            }
        };
    }
}

admin_app.controller("main_controller", function ($scope, $http) {

    // all selectable posts
    $scope.posts = [];

    // selected post ID
    $scope.selected_post_id = null;

    // temporary post object to store the current post object
    $scope.post_temp = utility.initEmptyTempPost();

    // get all posts in order to list them in the sidebar
    $http.get("/api/BlogAPI/GetAllPosts").then(function(result) {
        $scope.posts = angular.fromJson(result.data);
    });

    $scope.selectPost = function (id) {
        var post = utility.getPostById($scope.posts, id);
        //test
        console.log("selectPost called with id: " + id);
        $scope.post_temp.Title = "Test";
    };

    $scope.addPost = function () {
        var post_data = utility.buildFinalPostData($scope.post_temp);
        if (!utility.isPostValid(post_data.post)) return;
        var payload = new FormData();
        payload = utility.addImagesToPayload(post_data.images, payload);
        payload.append('post_data', JSON.stringify(post_data.post));
        $http({
            url: "/api/BlogAPI/AddPost",
            method: 'POST',
            data: payload,
            //assign content-type as undefined, the browser
            //will assign the correct boundary for us
            headers: { 'Content-Type': undefined },
            //prevents serializing payload.  don't do it.
            transformRequest: angular.identity
        });
    };

    $scope.newPost = function () {
        $scope.post_temp = utility.initEmptyTempPost();
    };

    $scope.updatePost = function () {
        //TODO: missing impl
    };

    $scope.deletePost = function () {
        //TODO: missing impl
    };
    
    $scope.addNewTo = function (collection_name) {
        switch (collection_name) {
            case "Ingredients":
                $scope.post_temp.Ingredients.push({ Text: "" });
                break;
            case "Steps_temp":
                $scope.post_temp.Steps_temp.push({ Text: "", Image_temp: null });
                break;
            case "Tags":
                $scope.post_temp.Tags.push({ Text: "" });
            default:
        };
    };

    $scope.removeLastFrom = function (collection_name) {
        var collection = $scope.post_temp[collection_name];
        if (collection) collection.pop();
    }

    
});

admin_app.directive("imageModel", [function () {

    var previewImage = function (imageFile, previewId) {
        var reader = new FileReader();
        reader.onload = function (load_event) {
            var preview_elem = document.getElementById(previewId);
            preview_elem.src = load_event.target.result;   
        };
        reader.readAsDataURL(imageFile);
    };

    return {
        restrict: "A",
        scope: {
            image_name: "=imageModel",
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var file = changeEvent.target.files[0]

                if (!file) return;

                scope.$apply(function () {
                    scope.image_name = file;
                    // test
                    console.log(file);
                });

                if ("imagePreviewId" in attributes) {
                    previewImage(file, attributes.imagePreviewId);
                };
            });
        }
    }
}]);
