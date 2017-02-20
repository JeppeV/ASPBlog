"use strict";

var admin_app = angular.module("admin_app", []);

admin_app.controller("main_controller", function ($scope, $http) {
    $scope.addPost = function () {
        var payload = new FormData();
        var post_data = null;
        var files_array = document.getElementById("upload_file_input").files;
        if (files_array.length > 0) {
            payload.append('main_image', files_array[0]);
        }
        payload.append('post_data', JSON.stringify(post_data));
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
    
    // temporary post object to store the current post object
    $scope.post_temp = {
        Title: "",
        Type: "",
        MainImage_temp: null,
        IntroText: "",
        OutroText: "",
        Ingredients: [
            { Name: "" }
        ],
        Steps_temp: [
            { Text: "", Image_temp: null }
        ],
        Tags: [
            { TagName: "" }
        ]
    }

    $scope.addNewTo = function (collection_name) {
        switch (collection_name) {
            case "Ingredients":
                $scope.post_temp.Ingredients.push({ Name: "" });
                break;
            case "Steps":
                $scope.post_temp.Steps_temp.push({ Text: "", Image_temp: null });
                break;
            case "Tags":
                $scope.post_temp.Tags.push({ TagName: "" });
            default:
        };
    };

    $scope.removeLastFrom = function (collection_name) {
        var collection = $scope.post_temp[collection_name];
        if (!collection) return;
        collection.pop();
    }
        
    $scope.test = function () {
        console.log($scope.post_temp);
    }    
});

admin_app.directive("imageModel", [function () {

    var previewImage = function (imageFile, previewId) {
        var reader = new FileReader();
        reader.onload = function (load_event) {
            var preview_elem = document.getElementById(previewId);
            preview_elem.src = load_event.target.result;   
            //detect orientation of image
            var w = preview_elem.naturalWidth || preview_elem.width;
            var h = preview_elem.naturalHeight || preview_elem.height;
            preview_elem.style.maxHeight = h > w ? "600px" : "400px";
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
                    console.log(file);
                });

                if ("imagePreviewId" in attributes) {
                    previewImage(file, attributes.imagePreviewId);
                };
            });
        }
    }
}]);

function getFormattedDateString() {
    const date = new Date();
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}

function buildFinalPostData(post_temp) {
    return {
        Title: post_temp.Title.trim(),
        Date: getFormattedDateString(),
        Type: post_temp.Type.trim(),
        MainImageId: post_temp.MainImage_temp ? "exists" : null, //used to detect whether a main image was selected
        IntroText: post_temp.IntroText.trim(),
        OutroText: post_temp.OutroText.trim(),
        Ingredients: post_temp.Ingredients.map(function (ingredient) { return { Name: ingredient.Name.trim() } }),
        Steps: post_temp.Steps_temp.map(function (step) { return { Text: step.Text.trim()} }),
        Tags: post_temp.Tags.map(function (tag) { return { TagName: tag.TagName.trim() } })
    };

};

function addImagesToPayload(post_temp, payload) {
    payload.append('main_image', post_temp.MainImage_temp);
    var steps = post_temp.Steps_temp;
    for (var i = 0; i < steps.length; i++) {
        if(step.Image_temp !== null) {
            payload.append('step_image$' + i, step.Image_temp);
        }
    }
    return payload;
};

function isPostValid(post_temp) {
    
}