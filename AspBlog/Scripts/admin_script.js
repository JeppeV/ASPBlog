"use strict";

var admin_app = angular.module("admin_app", []);

var utility = {

    initEmptyTempPost: function () {
        return {
            PostId: 0,
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

    initExistingTempPost: function (post, $http) {

        function getFileFromBlob(imageID, blob) {
            var extension = imageID.split(".")[1];
            var filename = "temporaryFilename." + extension;
            var file = new File([blob], filename, {
                type: "image/" + extension,
            });
            return file;
        }

        var mainImageFile = {};

        //get main image
        $http.get("/Home/Image/?imageID=" + post.MainImageID,
            {
                responseType: "blob",
                headers: {
                    "Accept": "image/jpeg"
                }
            }).then(function (result) {
            var mainImageBlob = result.data; 
            
            mainImageFile = getFileFromBlob(post.MainImageID, mainImageBlob);
            
            console.log("Existing image:");
            console.log(mainImageFile);
            console.log("__________");
            utility.previewImageFile(mainImageFile, "main_image_preview");
                        
        });
        
        //generate steps
        var steps_temp = [];
        
        for (var i = 0; i < post.Steps.length; i++) {

            var stepImageFile = null;
            var stepImageID = post.Steps[i].StepImageID;
            if (stepImageID) {
                stepImageFile = {};
                $http.get("/Home/Image/?imageID=" + stepImageID, { responseType: "blob" }).then(function (index) {
                    return function (result) {
                        var stepImageBlob = result.data;
                        stepImageFile = getFileFromBlob(stepImageID, stepImageBlob);
                        var previewElementID = "step_image_preview_" + index;
                        utility.previewImageFile(stepImageFile, previewElementID);
                    };
                }(i));
            }

            steps_temp[i] = { Text: post.Steps[i].Text, Image_temp: stepImageFile };
        }
        

        return {
            PostId: post.PostId,
            Title: post.Title,
            Type: post.Type,
            MainImage_temp: mainImageFile,
            IntroText: post.IntroText,
            OutroText: post.OutroText,
            Ingredients: post.Ingredients,
            Steps_temp: steps_temp,
            Tags: post.Tags
        };
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
                PostId: post_temp.PostId,
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

    buildPostPayload: function (post_temp) {
        var post_data = utility.buildFinalPostData(post_temp);
        if (!utility.isPostValid(post_data.post)) return null;
        var payload = new FormData();
        payload = utility.addImagesToPayload(post_data.images, payload);
        payload.append('post_data', JSON.stringify(post_data.post));
        return payload;
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
    },

    previewImageFile: function (imageFile, previewImgElementID) {
        var reader = new FileReader();
        reader.onload = function (load_event) {
            var preview_elem = document.getElementById(previewImgElementID);
            preview_elem.src = load_event.target.result;
        };
        reader.readAsDataURL(imageFile);
    }
}

admin_app.controller("main_controller", function ($scope, $http) {

    // all selectable posts, shown in the sidebar menu
    $scope.posts = [];

    // selected post ID, to be selected in the sidebar menu
    $scope.selected_post_id = null;

    // temporary post object to store the current post object
    $scope.post_temp = utility.initEmptyTempPost();

    // get all posts in order to list them in the sidebar
    $http.get("/api/BlogAPI/GetAllPosts").then(function(result) {
        $scope.posts = angular.fromJson(result.data);
    });

    $scope.selectPost = function (id) {
        /*
        var selected_post = utility.getPostById($scope.posts, id);
        $scope.post_temp = utility.initExistingTempPost(selected_post, $http);
        $scope.selected_post_id = $scope.post_temp.PostId;
        */
    };
 

    $scope.addPost = function () {
        var payload = utility.buildPostPayload($scope.post_temp);
        if (payload === null) return;
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
        $scope.selected_post_id = null
    };


    $scope.updatePost = function () {
        /*
        var payload = utility.buildPostPayload($scope.post_temp);
        $http({
            url: "/api/BlogAPI/UpdatePost",
            method: 'POST',
            data: payload,
            //assign content-type as undefined, the browser
            //will assign the correct boundary for us
            headers: { 'Content-Type': undefined },
            //prevents serializing payload.  don't do it.
            transformRequest: angular.identity
        });
        */
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
                    console.log("New image:");
                    console.log(file);
                    console.log("__________");
                });

                if ("imagePreviewId" in attributes) {
                    utility.previewImageFile(file, attributes.imagePreviewId);
                };
            });
        }
    }
}]);
