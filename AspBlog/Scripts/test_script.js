"use strict";

var test_app = angular.module("test_app", []);

test_app.controller("test_controller", function ($scope, $http) {
    $scope.uploadFile = function () {
        var file = document.getElementById("upload_file_input").files[0];
        var payload = new FormData();

        payload.append('image', file);

        return $http({
            url: "/api/BlogAPI/Test",
            method: 'POST',
            data: payload,
            //assign content-type as undefined, the browser
            //will assign the correct boundary for us
            headers: { 'Content-Type': undefined },
            //prevents serializing payload.  don't do it.
            transformRequest: angular.identity
        });


    };

    $scope.addPost = function () {
        var payload = new FormData();
        var post_data = makeNewBlogPost();
        var files_array = document.getElementById("upload_file_input").files;
        if (files_array.length > 0) {
            payload.append('main_image', files_array[0]);
        }
        payload.append('post_data', JSON.stringify(post_data));
        $http({
            url: "/api/BlogAPI/Test",
            method: 'POST',
            data: payload,
            //assign content-type as undefined, the browser
            //will assign the correct boundary for us
            headers: { 'Content-Type': undefined },
            //prevents serializing payload.  don't do it.
            transformRequest: angular.identity
        });
    }
});




window.onload = function () {
    addButtonEventHandlers();
}

function addButtonEventHandlers() {
    $('#add_post_button').click(
        function (event) {
            event.preventDefault();

            

        });

    $('#list_posts_button').click(
        function (event) {
            event.preventDefault();
            getAllPosts();

        });

    $('#list_posts_by_tags_button').click(
        function (event) {
            event.preventDefault();
            getPostsByTags();
        });

    $('#list_tags_button').click(
        function (event) {
            event.preventDefault();
            getAllTags();
        });

    $('#test_random_button').click(
        function (event) {
            event.preventDefault();
            testRandom();
        })
}

function testRandom() {
    $.ajax({
        type: "GET",
        url: "/api/BlogAPI/GetLastNPosts?n=1",
        async: true,
        success: function (data) {
            var posts_array = JSON.parse(data);
            showPosts(posts_array);
            //console.log(data);
        }
    });
}

function getAllTags() {
    $.ajax({
        type: "GET",
        url: "/api/BlogAPI/GetAllTags",
        async: true,
        success: function (data) {
            var tags_array = JSON.parse(data);
            showTags(tags_array);
        }
    });
}

function makeNewBlogPost() {
    var title = $('#add_post_title_input').val().trim();
    var intro_text = $('#add_post_intro_input').val().trim();
    var ingredients = $('#add_post_ingredients_input').val().trim().split(",").map(function(tag) {return { Name: tag.trim(), Amount: "Test mængde"};});
    var steps = $('#add_post_steps_input').val().trim().split(",").map(function (step) { return { Text: step.trim() } });
    var tags = $('#add_post_tags_input').val().trim().split(",").map(function (tag) { return { TagName: tag.trim() } });
    return {
        Title: title,
        Date: getFormattedDateString(),
        IntroText: intro_text,
        OutroText: "",
        Ingredients: ingredients,
        Steps: steps,
        Tags: tags
    }
}


function getAllPosts() {
    $.ajax({
        type: "GET",
        url: "/api/BlogAPI/GetAllPosts",
        async: true,
        success: function (data) {
            var post_array = JSON.parse(data);
            showPosts(post_array);
        }
    });
}

function getPostsByTags() {
    var array = $('#list_posts_by_tags_input').val().trim().split(",").map(function (tag) { return tag.trim() });
    $.ajax({
        type: "GET",
        url: "/api/BlogAPI/GetPostsByTags?search_tags_json=" + JSON.stringify(array),
        async: true,
        success: function (data) {
            var post_array = JSON.parse(data);
            showPosts(post_array);
        }
    });
}

function postDataToServer(url, data) {
    $.ajax({
        type: "POST",
        url: url,
        async: true,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function (data) {}
    });
}

function showPosts(post_array) {
    document.getElementById("list_posts_div").innerHTML = "";
    for (var i = 0; i < post_array.length; i++) {
        var current = post_array[i];
        var div = document.createElement("div");
        div.style.border = "1px solid black"
        var p_title = document.createElement("p");
        p_title.innerHTML = current.Title;
        var p_intro = document.createElement("p");
        p_intro.innerHTML = current.IntroText;
        var tags = document.createElement("ul");
        for (var j = 0; j < current.Tags.length; j++){
            var ul_tag = document.createElement("ul");
            ul_tag.innerHTML = current.Tags[j].TagName
            tags.appendChild(ul_tag);
        }
        
        div.appendChild(p_title);
        div.appendChild(p_intro);
        div.appendChild(tags);
        var posts_elem = document.getElementById("list_posts_div");
        posts_elem.appendChild(div);
        
    }
}

function showTags(tags_array) {
    document.getElementById("list_tags_div").innerHTML = "";
    var tags = document.createElement("ul");
    for (var i = 0; i < tags_array.length; i++) {
        var current = tags_array[i];
        var ul_tag = document.createElement("ul");
        ul_tag.innerHTML = current.TagName
        tags.appendChild(ul_tag);
    }

    var tags_elem = document.getElementById("list_tags_div");
    tags_elem.appendChild(tags);
}

function getTestClientCreateBlogPost(title) {
    var new_blog_post = {
        Title: title,
        Date: getFormattedDateString(),
        IntroText: "",
        OutroText: "",
        Ingredients: [{ Name: "Fisk", Amount: "2 hele" }],
        Steps: [],
        Tags: [{ TagName: "Fisk" }]
    }
    return new_blog_post;

}

function getFormattedDateString() {
    var date = new Date();
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}