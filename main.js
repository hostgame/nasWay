var dappAddress = "n1fgZZ6FFNibS4HKUVyp1VtaZSCTKVBPTQc";
var NebPay = require("nebpay");
var nebPay = new NebPay();
var loadedPosts = 0;
var isAdmin = false;

function initUi(){
	$(".plus,.minus,.delete").unbind('click');

    $(".plus").click(function(e){ 
    	e.preventDefault();
    	ratePost($(this).attr("data-post-id"), "plus");
    });

    $(".minus").click(function(e){ 
    	e.preventDefault();
    	ratePost($(this).attr("data-post-id"), "minus");
    });

    if(isAdmin){
    	$(".delete").removeClass("hide");
	    $(".delete").click(function(e){ 
	    	e.preventDefault();
	    	removePost($(this).attr("data-post-id"));
	    });
    }
}

function renderFeed(feed){
	feed.forEach(function(entity){
		// console.log(e);
		var post = entity.post;
		post.rating = post.rating / 1000000000000;
		var html = '<div class="post"> <div class="rating"> <a href="#" data-post-id="'+entity.id+'" class="plus">+</a> <span>'+post.rating+'</span> <a href="#" data-post-id="'+entity.id+'" class="minus">-</a><a href="#" data-post-id="'+entity.id+'" class="delete hide">x</a> </div> <div class="content"> <a href="#post-'+entity.id+'"><img src="'+post.image+'"/></a> </div><div class="cf"></div> </div>';
		$("#feed").append(html);
		loadedPosts++;
	});
	initUi();
}

function renderPost(entity){
	var post = entity.post;
	post.rating = post.rating / 1000000000000;
	var html = '<div class="post"> <div class="rating"> <a href="#" data-post-id="'+entity.id+'" class="plus">+</a> <span>'+post.rating+'</span> <a href="#" data-post-id="'+entity.id+'" class="minus">-</a><a href="#" data-post-id="'+entity.id+'" class="delete hide">x</a> </div> <div class="content"> <a href="#post-'+entity.id+'"><img src="'+post.image+'"/></a> </div><div class="cf"></div> </div>';
	$("#feed").html(html);
	$("#load-feed").remove();
	initUi();
}

function loadFeed(offset = 0) {
    nebPay.simulateCall(dappAddress, "0", "get_feed", JSON.stringify([offset]), {
        listener: function(resp) {
        	var result = JSON.parse(resp.result);
        	// console.log(result.feed[0].post);
        	if(result.success){
	        	renderFeed(result.feed);
        	}else{
        		alert(result.message);
        	}
        }
    });
}

function loadPost(post_id) {
    nebPay.simulateCall(dappAddress, "0", "get_post", JSON.stringify([post_id]), {
        listener: function(resp) {
        	var result = JSON.parse(resp.result);
        	if(result.success){
	        	renderPost(result.entity);
        	}else{
        		alert(result.message);
        	}
        }
    });
}

function addPost(url) {
    nebPay.simulateCall(dappAddress, "0", "add", JSON.stringify([url]), {
        listener: function(resp) {
        	var result = JSON.parse(resp.result);
			if(result.success){
			    nebPay.call(dappAddress, "0", "add", JSON.stringify([url]), {
			        listener: function(resp) {
			        	window.location.reload(false);
			        }
			    });
			}else{
				alert(result.message);
			}
        }
    });
}

function ratePost(post_id, direction) {
    nebPay.simulateCall(dappAddress, "0.0000001", direction, JSON.stringify([post_id]), {
        listener: function(resp) {
        	var result = JSON.parse(resp.result);
			if(result.success){
			    nebPay.call(dappAddress, "0.000001", direction, JSON.stringify([post_id]), {
			        listener: function(resp) {
			        	window.location.reload(false);
			        }
			    });
			}else{
				alert(result.message);
			}
        }
    });
}

function removePost(post_id) {
    nebPay.simulateCall(dappAddress, "0", "remove", JSON.stringify([post_id]), {
        listener: function(resp) {
        	var result = JSON.parse(resp.result);
			if(result.success){
			    nebPay.call(dappAddress, "0", "remove", JSON.stringify([post_id]), {
			        listener: function(resp) {
			        	window.location.reload(false);
			        }
			    });
			}else{
				alert(result.message);
			}
        }
    });
}

$(window).on('hashchange', function (e) {
    if(location.hash.slice(0,6) === '#post-'){
    	var post_id = location.hash.substr(6);
    	loadPost(post_id);
    }
}).trigger('hashchange');

window.postMessage({
   "target": "contentscript",
   "data":{},
   "method": "getAccount",
}, "*");

window.addEventListener('message', function(e) {
	try{
		var user_account = e.data.data.account;
	    nebPay.simulateCall(dappAddress, "0", "get_admins", "", {
	        listener: function(resp) {
	        	var result = JSON.parse(resp.result);
				if(result.includes(user_account)){
					isAdmin = true;
					initUi();
				}
	        }
	    });	
	}catch (e) {
	}
});

$(document).ready(function() {
    $("#add-action").click(function(e){
    	e.preventDefault();
    	addPost(prompt("Url of image"));
    });

    $("#load-feed").click(function(e){
    	e.preventDefault();
    	loadFeed(loadedPosts);
    });

    if(location.hash.slice(0,6) === '#post-'){
    	var post_id = location.hash.substr(6);
    	loadPost(post_id);
    }else{
	    loadFeed();	
    }

    initUi();
    // $(".minus").click(function(e){console.log($(this).attr("data-post-id"))});
});