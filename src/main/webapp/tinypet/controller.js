/*********************
Controller
*********************/

//Pop's id
const ERROR_ID = 0;
const MESSAGE_ID = 1;
const LOGIN_ID = 2;
const REGISTER_ID = 3;
const UPDATE_PROFILE_ID = 4;
const DELETE_PROFILE_ID = 5;
const ADD_POST_ID = 6;
const UPDATE_POST_ID = 7;
const DELETE_POST_ID = 8;

//Timeline's id
const TIMELINE_PUBLIC_ID = 0;
const TIMELINE_PRIVATE_ID = 1;
const TIMELINE_LIKED_ID = 2;


//API's URLs 
const API_PREFIX = "/_ah/api/myApi/v1/";


const API_POST = API_PREFIX + "post/";
const API_POST_CREATE = API_POST + "create";
const API_POST_UPDATE = API_POST + "update";
const API_POST_DELETE = API_POST + "delete/";

const API_PROFILE = API_PREFIX + "profile/";
const API_PROFILE_CREATE = API_PROFILE + "create";
const API_PROFILE_UPDATE = API_PROFILE + "update";
const API_PROFILE_DELETE = API_PROFILE + "delete";
const API_PROFILE_GET = API_PROFILE + "get/";
const API_PROFILE_GET_USER_PROFILE = API_PROFILE + "get_user_profile";


const API_TIMELINE = API_PREFIX + "timeline/";
const API_TIMELINE_PUBLIC = API_TIMELINE + "public";
const API_TIMELINE_PRIVATE = API_TIMELINE + "private";
const API_TIMELINE_PROFILE = API_TIMELINE + "profile/";
const API_TIMELINE_LIKED = API_TIMELINE + "liked";

const API_LIKE = API_PREFIX + "like/";
const API_LIKE_CREATE = API_LIKE + "create/";
const API_LIKE_DELETE = API_LIKE + "delete/";

const API_FOLLOW = API_PREFIX + "follow/";
const API_FOLLOW_CREATE = API_FOLLOW + "create/";
const API_FOLLOW_DELETE = API_FOLLOW + "delete/";
const API_FOLLOW_GET_FOLLOWS = API_FOLLOW + "get_follows/";
const API_FOLLOW_GET_FOLLOWERS = API_FOLLOW + "get_followers/";

const API_SEARCH = API_PREFIX + "search/";
const API_SEARCH_PROFILE_NAME = API_SEARCH + "profile/";
const API_SEARCH_NAME = API_SEARCH + "name/";

const POST_IMAGE = "/upload-image";



function convertEntityToPost(entity){
	var post = new Object();
	post.key = entity.key.name;
	post.description = entity.properties.description;
	post.imageUrl = entity.properties.imageUrl;
	post.numberLikes = entity.properties.numberLikes != null ? entity.properties.numberLikes : 0;
	post.date = entity.properties.date;
	post.isLiked = entity.properties.isLiked != null ? entity.properties.isLiked : false;
	var poster = new Object();
	poster.imageUrl = entity.properties.poster.properties.imageUrl;
	poster.name = entity.properties.poster.properties.name;
	poster.profileName = entity.properties.poster.properties.profileName;
	poster.key = entity.properties.poster.properties.key;
	post.poster = poster;
	return post;
}

function convertEntityToProfile(entity){
	var profile = new Object();
	profile.profileName = entity.properties.profileName;
	profile.name = entity.properties.name;
	profile.email = entity.properties.email;
	profile.imageUrl = entity.properties.imageUrl;
	profile.description = entity.properties.description;
	profile.key = entity.key.name;
	profile.isFollowed = entity.properties.isFollowed != null ? entity.properties.isFollowed : false;
	var stats = new Object();
	stats.numberPosts = entity.properties.numberPosts;
	stats.numberFollows = entity.properties.numberFollows;
	stats.numberFollowers = entity.properties.numberFollowers;
	profile.stats = stats;
	return profile;
}

function createEmptyProfilesPosts(){
	var posts = new Object();
	posts.posts = {};
	posts.isNotLastPost = true;
	posts.cursor = "";
	return posts;
}

function isConfirmationEntity(entity){
	return entity.kind == "response" && entity.properties.type == "confirmation";
}

function isImage(filename) {
	var parts = filename.split('.');
	var ext = parts[parts.length - 1];
  	switch (ext.toLowerCase()) {
    	case 'jpg':
    	case 'gif':
    	case 'bmp':
    	case 'png':
    	case 'jpeg':
      		return true;
  	}
  	return false;
}

	
var controller = {
	/*****************
	Attributes
	*****************/
	auth : {
		googleAuth : null,
		token : null,
		lastChangeIsConnected : false
	},
	user : {
		profile : null,
		isConnected : false
	},
	timeline : {
		publicPosts : {},
		privatePosts : {},
		likedPosts : {},
		publicCursor : null,
		privateCursor : null,
		mostRecentPost : null,
		isNotLastPublicPost : true,
		isNotLastPrivatePost : true,
		isNotLastLikedPost : true,
		activeTimeline : TIMELINE_PUBLIC_ID
	},
	search : {
		search : {},
		content : null,
		timeout : null,
		isActive : false
	},
	profiles : {
		activeProfile : null,
		profiles : {},
		posts : {}
	},
	pop : {
		id : -1,
		popActive : false,
		text : null,
		dragover : false
	},
	postExtend : {
		post : null,
		extendPostActive : false
	},
	request : {
		isSendLike : false,
		isSendFollow : false,
		isSendAddPost : false,
		isSendUpdateProfile : false,
		isUploadImage : false
	},
	/*****************
	Methods
	*****************/
	refresh : function(){
		m.route.set(m.route.get());
	},
	//Getters
	getProfileActive : function(){
		var profile = this.profiles.profiles[this.profiles.activeProfile];
		return profile;
	},
	getProfilePostsActive : function(){
		var posts = [];
		if(controller.profiles.posts[controller.profiles.activeProfile] != null){
			postsObj = controller.profiles.posts[controller.profiles.activeProfile].posts;
			for(p in postsObj){
				if(postsObj[p] != null){
					posts.push(postsObj[p]);
				}
			}
		}
		return  posts.sort((a,b)=> a.key.localeCompare(b.key));
	},
	getIsNotLastPostProfileActive : function(){
		if(controller.profiles.posts[controller.profiles.activeProfile] != null){
			return controller.profiles.posts[controller.profiles.activeProfile].isNotLastPost;
		}
		else{
			return false;
		}
	},
	getPopActive : function(){
		if(this.pop.popActive){
			switch(this.pop.id){
				case ERROR_ID:
					return m(PopError);
				case LOGIN_ID:
					return m(PopLogin);
				case REGISTER_ID:
					return m(PopRegister);
				case MESSAGE_ID:
					return m(PopMessage);
				case UPDATE_PROFILE_ID:
					return m(PopUpdateProfile);
				case DELETE_PROFILE_ID:
					return m(PopDeleteProfile);
				case ADD_POST_ID:
					return m(PopAddPost);
				case UPDATE_POST_ID:
					return m(PopUpdatePost);
				case DELETE_POST_ID:
					return m(PopDeletePost);
				default:
					return "";
			}
		}
		else{
			return "";
		}
	},
	getIsNotLastPostActiveTimeline : function(){
		switch(controller.timeline.activeTimeline){
			case TIMELINE_PUBLIC_ID:
				return controller.timeline.isNotLastPublicPost;
			case TIMELINE_PRIVATE_ID:
				return controller.timeline.isNotLastPrivatePost;
			case TIMELINE_LIKED_ID:
				return controller.timeline.isNotLastLikedPost;
			default:
				return false;
		}
	},
	getActiveTimeline : function(){
		if(controller.isEmptyActiveTimeline()){
			controller.callGetTimeline();
		}
		switch(controller.timeline.activeTimeline){
			case TIMELINE_PUBLIC_ID:
				return controller.timeline.publicPosts;
			case TIMELINE_PRIVATE_ID:
				return controller.timeline.privatePosts;
			case TIMELINE_LIKED_ID:
				return controller.timeline.likedPosts;
			default:
				return {};
		}
	},
	getSearchProfiles : function(){
		var array = [];
		if(controller.search.content != null && controller.search.search[controller.search.content] != null){
			var profiles = controller.search.search[controller.search.content].profiles;
			for(p in profiles){
				array.push(profiles[p]);
			}
		}
		return array;
	},
	//Setters
	setActiveTimeline : function(id){
		controller.timeline.activeTimeline = id;
		controller.refresh();
	},
	setUser : function(user){
		if(user != null){
			this.user.id = user.id;
			this.user.name = user.name;
			this.user.imageUrl = user.imageUrl;
			this.user.posts = user.posts;
			this.user.stats = user.stats;
			return true;
		}
		else{
			return false;
		}
	},
	setUserProfileName : function(profileName){
		this.user.profileName = profileName;
		if(profileName != null){
			this.loadUserProfile(profileName);
		}
	},
	setProfile : function(profileName){
		var profile = this.profiles.profiles[profileName];
		if(profile == null){
			controller.callGetProfile(profileName);
			controller.callGetProfilePosts(profileName);
		}
		else if(this.profiles.posts[profileName] == null){
			controller.callGetProfilePosts(profileName);
		}
		this.profiles.activeProfile = profileName;
	},
	setGoogleAuth : function(googleAuth){
		this.auth.googleAuth = googleAuth;
		this.lastChangeIsConnected = !this.auth.googleAuth.isSignedIn.get();
		this.changeInGoogleAuth();
	},
	setCursorToNull : function(){
		this.timeline.publicCursor = null;
		this.timeline.privateCursor = null;
		this.timeline.likedCursor = null;
		this.timeline.isNotLastPublicPost = true;
		this.timeline.isNotLastPrivatePost = true;
		this.timeline.isNotLastLikedPost = true;
		for(p in this.profiles.profiles){
			this.profiles.profiles[p].cursor = null;
			this.profiles.profiles[p].isNotLastPost = true;
		}
	},
	setLikePost : function(keyPost){
		var post;
		if(this.timeline.publicPosts[keyPost] != null){
			post = this.timeline.publicPosts[keyPost];
			post.isLiked = true;
			++post.numberLikes;
		}	
		if(this.timeline.privatePosts[keyPost] != null){
			post = this.timeline.privatePosts[keyPost];
			post.isLiked = true;
			++post.numberLikes;
		}	
		for(p in this.profiles.posts){
			if(this.profiles.posts[p].posts[keyPost] != null){
				post = this.profiles.posts[p].posts[keyPost];
				post.isLiked = true;
				++post.numberLikes;
			}
		}
		this.timeline.likedPosts[keyPost] = post;
	},
	setUnlikePost : function(keyPost){
		if(this.timeline.publicPosts[keyPost] != null){
			var post = this.timeline.publicPosts[keyPost];
			post.isLiked = false;
			--post.numberLikes;
		}	
		if(this.timeline.privatePosts[keyPost] != null){
			var post = this.timeline.privatePosts[keyPost];
			post.isLiked = false;
			--post.numberLikes;
		}	
		if(this.timeline.likedPosts[keyPost] != null){
			this.timeline.likedPosts[keyPost] = null;
		}	
		for(p in this.profiles.posts){
			if(this.profiles.posts[p].posts[keyPost] != null){
				var post = this.profiles.posts[p].posts[keyPost];
				post.isLiked = false;
				--post.numberLikes;
			}
		}
	},
	setFollowProfile : function(profileName){
		var profile = this.profiles.profiles[profileName];
		if(profile != null){
			++profile.stats.numberFollowers;
			profile.isFollowed = true;
		}
		++controller.profiles.profiles[controller.user.profile.profileName].stats.numberFollows;	
	},
	setUnfollowProfile : function(profileName){
		var profile = this.profiles.profiles[profileName];
		if(profile != null){
			--profile.stats.numberFollowers;
			profile.isFollowed = false;
		}
		--controller.profiles.profiles[controller.user.profile.profileName].stats.numberFollows;	
	},
	setPost : function(post){
		var keyPost = post.key;
		if(this.timeline.publicPosts[keyPost] != null){
			this.timeline.publicPosts[keyPost].description = post.description;
			this.timeline.publicPosts[keyPost].imageUrl = post.imageUrl;
		}
		if(this.timeline.privatePosts[keyPost] != null){
			this.timeline.privatePosts[keyPost].description = post.description;
			this.timeline.privatePosts[keyPost].imageUrl = post.imageUrl;
		}
		if(this.timeline.likedPosts[keyPost] != null){
			this.timeline.likedPosts[keyPost].description = post.description;
			this.timeline.likedPosts[keyPost].imageUrl = post.imageUrl;
		}
		for(p in this.profiles.posts){
			if(this.profiles.posts[p].posts[keyPost] != null){
				this.profiles.posts[p].posts[keyPost].description = post.description;
				this.profiles.posts[p].posts[keyPost].imageUrl = post.imageUrl;
			}
		}
	},
	setPop : function(popId){
		this.pop.id = popId;
		this.pop.popActive = true;
	},
	setUpdateProfileEmpty : function(){
		var updateProfile = new Object();
		updateProfile.name = this.user.profile.name;
		updateProfile.description =  this.user.profile.description;
		updateProfile.imageUrl =  this.user.profile.imageUrl;
		this.pop.updateProfile = updateProfile;
	},
	setAddPostEmpty : function(){
		var post = new Object();
		post.imageUrl = "";
		post.description =  "";
		this.pop.addPost = post;
	},
	setUpdatePostEmpty : function(postOriginal){
		var post = new Object();
		post.imageUrl = postOriginal.imageUrl;
		post.description =  postOriginal.description;
		post.keyString = postOriginal.key;
		this.pop.updatePost = post;
	},
	setSearchTimeout : function(){
		if(controller.search.timeout != null){
			clearTimeout(controller.search.timeout);
		}
		if(controller.search.content != null && controller.search.content != ""){
			controller.search.timeout = setTimeout(function(){controller.searchExpr(controller.search.content);}, 500); 
		}
	},
	setSearchContent : function(content){
		controller.search.content = content;
		controller.setSearchTimeout();
	},
	setSearchActive : function(state){
		controller.search.isActive = state;
	},
	//API	
	callGetProfileName : function(){
		var url = API_PROFILE_GET_USER_PROFILE;
		if(controller.auth.googleAuth != null && controller.auth.googleAuth.isSignedIn.get()){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "GET",
	            url: url
	        })
	        .then(function(result) {
	        	if(result != null){
					var userName = result.properties.profileName;
				}
				else{
					var userName = null;
				}
				if(userName != controller.user.profileName){
					controller.user.profileName = userName;
					var profile = convertEntityToProfile(result);
					controller.user.profile = profile;
					controller.connectUser();
					controller.closePop();
				}
				else if(userName != null){
					controller.connectUser();
					controller.closePop();
				}
        	})
			.catch(function(e){
				//Do nothing
			})	
	},
	callGetProfile : function(profileName){
		var url = "/_ah/api/myApi/v1/profile/get/" + profileName;
		if(controller.auth.googleAuth != null && controller.auth.googleAuth.isSignedIn.get()){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "GET",
	            url: url
	        })
	        .then(function(result) {
	        	var profile = convertEntityToProfile(result);
				controller.profiles.profiles[profileName] = profile;
        	})
			.catch(function(e){
				//if user is inexistant
				if(e.code == 404){
					controller.popMessage("This user is inexistant. Maybe his profile has been deleted.");
					m.route.set("");
				}
			})		
	},
	callGetProfilePosts : function(profileName){
		var posts = controller.profiles.posts[profileName];
		if(posts == null){
			controller.profiles.posts[profileName] = createEmptyProfilesPosts();
			posts = controller.profiles.posts[profileName];
		}
		if(!posts.isNotLastPost){return;};
		var url = API_TIMELINE_PROFILE + profileName;
		url += "?next=" + (posts.cursor != null ? posts.cursor : "");
		if(controller.auth.googleAuth != null && controller.auth.googleAuth.isSignedIn.get()){
			url += "&access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "GET",
	            url: url
	        })
	        .then(function(result) {
				if(result.items == null){
					posts.isNotLastPost = false;	
				}
				else{
		        	var post;
					for(p in result.items){
					    post = convertEntityToPost(result.items[p]);
						posts.posts[post.key] = post;	
					}
					posts.cursor = result.nextPageToken;
					controller.refresh();
				}
       		})
			.catch(function(e){
				//Do nothing
			})		
	},
	callGetTimeline : function(){
		switch(controller.timeline.activeTimeline){
			case TIMELINE_PUBLIC_ID:
				controller.callGetPublicTimeline();
				break;
			case TIMELINE_PRIVATE_ID:
				controller.callGetPrivateTimeline();
				break;
			case TIMELINE_LIKED_ID:
				controller.callGetLikedTimeline();
				break;
			default:
		}
	},
	callGetPrivateTimeline : function(){
		if(!controller.timeline.isNotLastPrivatePost){return;}
		var next = "?next=" + (controller.timeline.privateCursor == null ? "" : controller.timeline.privateCursor);
		var url;
		if(controller.auth.googleAuth != null && controller.auth.googleAuth.isSignedIn.get() && controller.user.isConnected){
			url = API_TIMELINE_PRIVATE + next;
			url += "&access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "GET",
	            url: url
	        })
	        .then(function(result) {
				if(result == null){return;}
				else if(result.items == null){
					controller.timeline.isNotLastPrivatePost = false;
				}
				else{
					var post;
					for(p in result.items){
						post = convertEntityToPost(result.items[p]);
						controller.timeline.privatePosts[post.key] = post;
					}
					controller.timeline.privateCursor = result.nextPageToken;	
				}
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
			})	
	},
	callGetPublicTimeline : function(){
		if(!this.timeline.isNotLastPublicPost){return;}
		var next = "?next=" + (controller.timeline.publicCursor == null ? "" : controller.timeline.publicCursor);
		var url = API_TIMELINE_PUBLIC + next;
		if(controller.auth.googleAuth != null && controller.auth.googleAuth.isSignedIn.get()){
			url += "&access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "GET",
	            url: url
	        })
	        .then(function(result) {
				if(result == null){return;}
				else if(result.items == null){
					controller.timeline.isNotLastPublicPost = false;
				}
				else{
					var post;
					for(p in result.items){
						post = convertEntityToPost(result.items[p]);
						controller.timeline.publicPosts[post.key] = post;
					}
					controller.timeline.publicCursor = result.nextPageToken;	
				}
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
				//Do nothing
			})	
	},
	callGetLikedTimeline : function(){
		if(!controller.timeline.isNotLastLikedPost){return;}
		var next = "?next=" + (controller.timeline.likedCursor == null ? "" : controller.timeline.likedCursor);
		var url;
		if(controller.auth.googleAuth != null && controller.auth.googleAuth.isSignedIn.get() && controller.user.isConnected){
			url = API_TIMELINE_LIKED + next;
			url += "&access_token=" + encodeURIComponent(controller.auth.token);
		}  
		return m.request({
	            method: "GET",
	            url: url
	        })
	        .then(function(result) {
				if(result == null){return;}
				else if(result.items == null){
					controller.timeline.isNotLastLikedPost = false;
				}
				else{
					var post;
					for(p in result.items){
						post = convertEntityToPost(result.items[p]);
						controller.timeline.likedPosts[post.key] = post;
					}
					controller.timeline.likedCursor = result.nextPageToken;	
				}
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
				//Do nothing
			})	
	},
	callCreateProfile : function(){
		var url = API_PROFILE_CREATE;
		if(controller.auth.token != null){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "POST",
	            url: url
	        })
	        .then(function(result) {
				if(result == null){return;}
				var profile = convertEntityToProfile(result);
				controller.user.profile = profile;
				controller.closePop();
				controller.connectUser();
			})
			.catch(function(e){
				console.log(e.message);
        	})		
	},
	callUpdateProfile : function(profile){
		if(controller.request.isSendUpdateProfile){return;}
		else{
			controller.request.isSendUpdateProfile = true;
		}
		var url = API_PROFILE_UPDATE;
		if(controller.auth.token != null){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "PUT",
	            url: url,
				params : profile
	        })
	        .then(function(result) {
				if(result == null){return;}
				console.log(result);
				var profile = convertEntityToProfile(result);
				controller.user.profile = profile;
				controller.closePop();
				controller.callGetProfile(profile.profileName);
				controller.request.isSendUpdateProfile = false;
			})
			.catch(function(e){
				console.log(e.message);
				controller.request.isSendUpdateProfile = false;
        	})	
	},
	callDeleteProfile : function(){
		var url = API_PROFILE_DELETE;
		if(controller.auth.token != null){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "DELETE",
	            url: url
	        })
	        .then(function(result) {
				if(isConfirmationEntity(result)){
					controller.disconnectUser();	
					controller.refresh();
				}
			})
			.catch(function(e){
				console.log(e.message);
        	})	
	},
	callAddPost : function(post){
		if(controller.request.isSendAddPost){return;}
		else{
			controller.request.isSendAddPost = true;
		}
		var url = API_POST_CREATE;
		if(controller.auth.token != null){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "POST",
	            url: url,
				params : post
	        })
	        .then(function(result) {
				if(result == null){return;}
				var post = convertEntityToPost(result);
				controller.profiles.posts[controller.user.profile.profileName].posts[post.key] = post;
				++controller.profiles.profiles[controller.user.profile.profileName].stats.numberPosts;
				controller.closePop();
				controller.request.isSendAddPost = false;
			})
			.catch(function(e){
				console.log(e);
				controller.request.isSendAddPost = false;
        	})	
	},
	callUpdatePost : function(post){
		var url = API_POST_UPDATE;
		if(controller.auth.token != null){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "PUT",
	            url: url,
				params : post
	        })
	        .then(function(result) {
				if(result == null){return;}
				var post = convertEntityToPost(result);
				controller.setPost(post);
				controller.closePop();
			})
			.catch(function(e){
				console.log(e);
        	})	
	},
	callDeletePost : function(key){
		var url = API_POST_DELETE + key;
		if(controller.auth.token != null){
			url += "?access_token=" + encodeURIComponent(controller.auth.token);
		}
		return m.request({
	            method: "DELETE",
	            url: url
	        })
	        .then(function(result) {
				if(isConfirmationEntity(result)){
					--controller.profiles.profiles[controller.user.profile.profileName].stats.numberPosts;
					controller.removePost(key);
					controller.unextendPost();
					controller.closePop();
				}
			})
			.catch(function(e){
				console.log(e.message);
        	})	
	},
	callPostImage : function(file, call, argCall){
		if(controller.auth.token == null){return;}
		if(controller.request.isUploadImage){return;}
		else{
			controller.request.isUploadImage = true;
		}
		var url = POST_IMAGE; //+ "?profileName=" + controller.user.profile.profileName;
		var body = new FormData();
		body.append("file", file);
		return m.request({
	            method: "POST",
	            url: url,
				body : body

	        })
	        .then(function(result) {
				var url = result.imageUrl;
				var bucketName = result.bucketName;
				var objectName = result.objectName;
				if(url != null && bucketName != null && objectName != null && argCall != null){
					argCall.imageUrl = url;
					argCall.bucketName = bucketName;
					argCall.objectName = objectName;
					call(argCall);
				}
				controller.request.isUploadImage = false;
			})
			.catch(function(e){
				console.log(e.message);
				controller.request.isUploadImage = false;
        	})	
		
	},
	callSearchName : function(name){
		if(controller.search.search[name] == null){
			controller.search.search[name] = {};
			controller.search.search[name].profiles = {};
		}
		var search = controller.search.search[name];
		if(search.isLastName){return;}
		var next = "?next=" + (search.nameCursor == null ? "" : search.nameCursor);
		var url = API_SEARCH_NAME + name + next;
		return m.request({
			method: "GET",
			url: url
			})
			.then(function(result) {
				if(result == null){return;}
				else if(result.items == null){
					search.isLastName = true;
				}
				else{
					var profile;
					for(p in result.items){
						profile = convertEntityToProfile(result.items[p]);
						search.profiles[profile.key] = profile;
					}
					search.nameCursor = result.nextPageToken;	
				}
			})
			
	},
	callSearchProfileName : function(profileName){
		if(controller.search.search[profileName] == null){
			controller.search.search[profileName] = {};
			controller.search.search[profileName].profiles = {};
		}
		var search = controller.search.search[profileName];
		if(search.isLastProfileName){return;}
		var next = "?next=" + (search.profileNameCursor == null ? "" : search.profileNameCursor);
		var url = API_SEARCH_PROFILE_NAME + profileName + next;
		return m.request({
			method: "GET",
			url: url
			})
			.then(function(result) {
				if(result == null){return;}
				else if(result.items == null){
					search.isLastProfileName = true;
				}
				else{
					var profile;
					for(p in result.items){
						profile = convertEntityToProfile(result.items[p]);
						search.profiles[profile.key] = profile;
					}
					search.profileNameCursor = result.nextPageToken;	
				}
			})
			
	},
	sendLikePost : function(keyPost){
		if(controller.auth.googleAuth == null || !controller.auth.googleAuth.isSignedIn.get()){return;}
		if(controller.request.isSendLike){return;}
		else{
			controller.request.isSendLike = true;
		}
		var url = API_LIKE_CREATE + keyPost;
		url += "?access_token=" + encodeURIComponent(controller.auth.token);
		return m.request({
				method : "POST",
	            url: url
	        })
	        .then(function(result) {
				if(isConfirmationEntity(result)){
					controller.setLikePost(keyPost);	
					controller.refresh();
				}
				controller.request.isSendLike = false;
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
				controller.request.isSendLike = false;
			})	
	},
	sendUnlikePost : function(keyPost){
		if(controller.auth.googleAuth == null || controller.auth.token == null){return;}
		if(controller.request.isSendLike){return;}
		else{
			controller.request.isSendLike = true;
		}
		var url = API_LIKE_DELETE + keyPost;
		url += "?access_token=" + encodeURIComponent(controller.auth.token);
		return m.request({
	            method: "DELETE",
	            url: url
	        })
	        .then(function(result) {
				if(isConfirmationEntity(result)){
					controller.setUnlikePost(keyPost);	
					controller.refresh();
				}
				controller.request.isSendLike = false;
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
				controller.request.isSendLike = false;
			})	
	},
	sendFollowProfile : function(profileName){
		if(controller.auth.googleAuth == null || !controller.auth.googleAuth.isSignedIn.get()){return;}
		if(controller.request.isSendFollow){return;}
		else{
			controller.request.isSendFollow = true;
		}
		var url = API_FOLLOW_CREATE + profileName;
		url += "?access_token=" + encodeURIComponent(controller.auth.token);
		return m.request({
	            method: "POST",
	            url: url
	        })
	        .then(function(result) {
				if(isConfirmationEntity(result)){
					controller.setFollowProfile(profileName);	
					controller.refresh();
				}
				controller.request.isSendFollow = false;
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
				controller.request.isSendFollow = false;
			})	
	},
	sendUnfollowProfile : function(profileName){
		if(controller.auth.googleAuth == null || !controller.auth.googleAuth.isSignedIn.get()){return;}
		if(controller.request.isSendFollow){return;}
		else{
			controller.request.isSendFollow = true;
		}
		var url = API_FOLLOW_DELETE + profileName;
		url += "?access_token=" + encodeURIComponent(controller.auth.token);
		return m.request({
	            method: "DELETE",
	            url: url
	        })
	        .then(function(result) {
				if(isConfirmationEntity(result)){
					controller.setUnfollowProfile(profileName);	
					controller.refresh();
				}
				controller.request.isSendFollow = false;
	        })
			.catch(function(e){
				console.log("catch!" + e.message);
				controller.request.isSendFollow = false;
			})	
	},
	//others functions
	changeInGoogleAuth : function(){
		if(this.lastChangeIsConnected != this.auth.googleAuth.isSignedIn.get()){
			if(this.auth.googleAuth.isSignedIn.get()){
				var googleUser = this.auth.googleAuth.currentUser.get();
				this.auth.token = googleUser.getAuthResponse().id_token;
				this.callGetProfileName();
			}		
			else{
				this.disconnectUser();
			}
			this.resetData();
		}
		this.lastChangeIsConnected = this.auth.googleAuth.isSignedIn.get();
	},	
	timelineToPostsArray : function(){
		var array = [];
		var timeline = this.getActiveTimeline();
		for(post in timeline){
			if(timeline[post] != null){
				array.push(timeline[post]);
			}
		}
		return array.sort((a,b)=> a.key.localeCompare(b.key));;
	},
	openProfile : function(profileName){
		this.setProfile(profileName);
	},
	likePost : function(keyPost){
		if(!this.user.isConnected){
			this.login();
			return;
		}	
		this.sendLikePost(keyPost);
	},
	unlikePost : function(keyPost){
		if(!this.user.isConnected){
			this.login();
			return;
		}	
		this.sendUnlikePost(keyPost);
	},
	followProfile : function(profileName){
		if(!this.user.isConnected){
			this.login();
			return;
		}	
		this.sendFollowProfile(profileName);
	},
	unfollowProfile : function(profileName){
		if(!this.user.isConnected){
			this.login();
			return;
		}	
		this.sendUnfollowProfile(profileName);
	},
	resetData : function(){
		this.setCursorToNull();
		this.profiles.profiles = new Object();
		this.profiles.posts = new Object();
		this.timeline.posts = new Object();
		this.callGetTimeline();
		if(this.profiles.activeProfile != null){
			this.callGetProfile(this.profiles.activeProfile);
			this.callGetProfilePosts(this.profiles.activeProfile);
		}
	},
	searchExpr : function(){
		var content = controller.search.content;
		
		if(this.search.search[content] == null){
			this.callSearchName(content);
			this.callSearchProfileName(content);
		}
		else{
			//already search
		}
	},
	removePost : function(keyPost){
		controller.profiles.posts[controller.user.profile.profileName].posts[keyPost] = null;
	},
	//Post
	extendPost : function(key){
		var posts = this.profiles.posts[this.profiles.activeProfile];
		this.postExtend.post = posts.posts[key];
		this.postExtend.extendPostActive = true;
		this.refresh();
	},
	unextendPost : function(){
		this.postExtend.extendPostActive = false;
		this.refresh();
	},
	//Tests
	isUserKey : function(key){
		return this.user.profile != null && key == this.user.profile.key;
	},
	isUserProfileName : function(profileName){
		return this.user.profileName != null && profileName == this.user.profileName;
	},
	isEmptyActiveTimeline : function(){
		switch(controller.timeline.activeTimeline){
			case TIMELINE_PUBLIC_ID:
				return Object.entries(controller.timeline.publicPosts).length === 0;
			case TIMELINE_PRIVATE_ID:
				return Object.entries(controller.timeline.privatePosts).length === 0;
			case TIMELINE_LIKED_ID:
				return Object.entries(controller.timeline.likedPosts).length === 0;
			default:
				return null;
		}
	},
	isEmptyTimeline : function(id){
		switch(id){
			case TIMELINE_PUBLIC_ID:
				return Object.entries(controller.timeline.publicPosts).length === 0;
			case TIMELINE_PRIVATE_ID:
				return Object.entries(controller.timeline.privatePosts).length === 0;
			case TIMELINE_LIKED_ID:
				return Object.entries(controller.timeline.likedPosts).length === 0;
			default:
				return null;
		}
	},
	//Pops
	closePop : function(){
		this.pop.popActive = false;
		this.pop.dragover = false;
		this.refresh();
	},
	popMessage : function(msg){
	    this.pop.popActive = true;
	    this.pop.id = MESSAGE_ID;
		this.pop.message = msg;
		this.refresh();
	},
	//Authentification
	login : function(){
		if(this.auth.googleAuth.isSignedIn.get()){
			if(!this.user.isConnected){
				this.popMessage("You must register.");
			}
			else{
				callGetTimeline();
			}
		}
		else{	
			this.pop.popActive = true;
    		this.pop.id = LOGIN_ID;
			this.refresh();
		}
	},
	register : function(){
		this.pop.popActive = true;
		this.pop.id = REGISTER_ID;
		this.refresh();
	},
	registerValidation : function(){
		if(this.auth.googleAuth.isSignedIn.get() && !this.user.isConnected){
			this.callCreateProfile();
		}
		else{
			this.disconnectUser();
		}
	},
	connectUser : function(){
		this.user.isConnected = true;
		if(this.timeline.activeTimeline == TIMELINE_PUBLIC_ID && ! this.isEmptyTimeline(TIMELINE_PRIVATE_ID)){
			this.timeline.activeTimeline = TIMELINE_PRIVATE_ID;
		}
	},
	disconnectUser : function(){
		this.user.isConnected = false;
		this.auth.token = null;
		this.user.profile = null;
		this.user.profileName = null;
		this.timeline.activeTimeline = TIMELINE_PUBLIC_ID;
	}
}
