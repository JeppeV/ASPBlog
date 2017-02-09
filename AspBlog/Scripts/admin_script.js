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
    $scope.main_image = null;
    
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
    var date = new Date();
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}