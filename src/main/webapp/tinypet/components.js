/*******************
Header's components
*******************/
var HeaderUser = {
    view : function(){
        return m("div", {class : "user-div"}, [
            m(m.route.Link, {href: "/account"}, [
                m("span", {class : "user", style : "background-image: url("+controller.user.profile.imageUrl+")"})
            ])
        ])
    }
}

var HeaderLog = {
    view : function(){
        function login(){
            controller.login();
        }
        function register(){
            controller.register();
        }
        return m("div", {class: "user-log"}, [
            m("span", {onclick : login, class : "log"}, [
                m("p","Log in")
            ]),
            m("span", {class : "register", onclick : register}, [
                m("p", "Register")
            ])
        ])
    }
}

var SearchProfile = {
view : function(vnode){
    var profile =  vnode.attrs.profile;
    return m("span", {class : "search-profile"}, [
        m("span", {class : "profile-img", style : "background-image: url("+ profile.imageUrl+")"}),
        m("span", {class : "name-container"}, [
            m("p", {class : "name"}, [
                profile.name,
                m("span", {class : "profile-name"}, " (@" + profile.profileName + ")")
            ])
        ])
    ])
}
}

var SearchbarPop = {
view : function(){
    function focusIn(){
        controller.setSearchActive(true);
    }
    function focusOut(){
        controller.setSearchActive(false);
    }
    var profiles = controller.getSearchProfiles();
    return m("div", {class : "search-content", onfocusin : focusIn, onfocusout : focusOut}, [
            profiles.length == 0 ? "" :
            profiles.map(function(profile){
                return m(m.route.Link, {onclick : focusOut,href : controller.isUserProfileName(profile.profileName) ? "/account" : ("profile/" + profile.profileName)}, [
                    m(SearchProfile, {profile : profile})
                ]);
            }),
    ]);
}
}

var Header = {
    view : function(){
        function search(e){
            controller.setSearchContent(e.target.value);
        }
        function focusIn(){
            controller.setSearchActive(true);
        }
        function focusOut(){
            controller.setSearchActive(false);
        }
        return m("header", [
            m("div", {class : "container"}, [
                m("div", {class : "title-div"},[
                    m(m.route.Link, {href: "/"}, [
                        m("p", {class : "title"}, "TinyPet")
                    ])
                ]),
                m("div", {class : "search-div"}, [
                    m("input", {
                        id : "searchbar",
                        placeholder : "Search",
                        onkeyup : search,
                        onchange : search, 
                        onfocusin : focusIn, 
                        onfocusout : focusOut,
                        value : controller.search.content
                    }),
                    m(controller.search.isActive ? SearchbarPop : "")
                ]),
                m(controller.user.isConnected ? HeaderUser: HeaderLog)
            ])
        ])
    }
    
}
/************************
SVG components
************************/	
var SvgCoeur = {
    view : function(){
        return m("svg", {
            version : "1.1",
            xlmns : "http://www.w3.org/2000/svg",
            "xmlns:xlink" : "http://www.w3.org/1999/xlink",
            x : "0px",
            y : "0px",
            viewBox : "0 0 200 200",
            "xml:space" : "preserve",
            class : "coeur-svg"
        }, [
            m("path", {d : "M194.7,83.2c0,11.3-3.8,21.8-10.1,30.2c-7.5,13.4-21.7,30.5-39.8,47.1c-8.2,7.6-16.5,14.3-24.3,20c-7.4,5.3-14.4,9.8-20.7,13.1c-7.3-3.5-15.8-8.9-24.8-15.9c-8.3-6.4-17.1-14.2-25.9-22.9c-14.1-14.1-25.6-28.5-33.2-40.7C9.3,105.7,5.3,95,5.3,83.4C5.3,55.6,27.9,33,55.8,33c19,0,35.5,10.5,44.1,26c8.6-15.7,25.2-26.3,44.3-26.3C172.1,32.7,194.7,55.3,194.7,83.2z"})
        ])
    }
}

var SvgTrash = {
view : function(){
    return m("svg", {
                version : "1.1",
                xlmns : "http://www.w3.org/2000/svg",
                "xmlns:xlink" : "http://www.w3.org/1999/xlink",
                x : "0px",
                y : "0px",
                viewBox : "0 0 200 200",
                "xml:space" : "preserve",
                class : "trash"
            }, [
                m("path", {class : "body", "d" : "M169.3,28.3h-33c-1.8,0-3.3-1.5-3.3-3.3v-9.3c0-3.3-2.7-6-6-6H71.7c-4-0.1-4.9,2.4-4.7,5.7V25c0,1.8-1.5,3.3-3.3,3.3H34c-3.3,0-6,2.7-6,6v16c0,1.5,1.2,2.7,2.7,2.7H34c1.8,0,3.2,1.4,3.3,3.1l7.1,131.8c0.1,1.4,1.2,2.5,2.7,2.5H153c1.4,0,2.6-1.1,2.7-2.5L162.7,56c0.1-1.8,1.5-3.1,3.3-3.1h0c3.3,0,6-2.7,6-6v-16C172,29.4,170.8,28.3,169.3,28.3C169.3,28.3,169.3,28.3,169.3,28.3zM75.6,15h48.7c1.8,0,3.3,1.5,3.3,3.3V25c0,1.8-1.5,3.3-3.3,3.3H75.6c-1.8,0-3.3-1.5-3.3-3.3v-6.6C72.3,16.5,73.8,15,75.6,15zM147.3,185H52.7c-1.8,0-3.2-1.4-3.3-3.1L42.6,56.3c-0.1-1.9,1.4-3.5,3.3-3.5h108.1c1.9,0,3.4,1.6,3.3,3.5l-6.8,125.5C150.5,183.6,149.1,185,147.3,185z M163.4,47.5H36.6c-1.8,0-3.3-1.5-3.3-3.3v-7.3c0-1.8,1.5-3.3,3.3-3.3h33h0.1c0,0,0,0,0.1,0h60.5h0.1c0,0,0,0,0.1,0h33c1.8,0,3.3,1.5,3.3,3.3v7.3C166.7,46,165.2,47.5,163.4,47.5z"}),
                m("path", {class : "line", "d" : "M73.6,149.6c1.5,0,2.7-1.2,2.7-2.7V82.7c0-1.5-1.2-2.7-2.7-2.7s-2.7,1.2-2.7,2.7l0,0v64.2C70.9,148.4,72.1,149.6,73.6,149.6z"}),
                m("path", {class : "line", "d" : "M100,149.6c1.5,0,2.7-1.2,2.7-2.7V82.7c0-1.5-1.2-2.7-2.7-2.7c-1.5,0-2.7,1.2-2.7,2.7l0,0v64.2C97.3,148.4,98.5,149.6,100,149.6z"}),
                m("path", {class : "line", "d" : "M126.4,149.6c1.5,0,2.7-1.2,2.7-2.7V82.7c0-1.5-1.2-2.7-2.7-2.7c-1.5,0-2.7,1.2-2.7,2.7l0,0v64.2C123.7,148.4,124.9,149.6,126.4,149.6z"}),
            ])
}
}
var SvgHouse = {
view : function(){
    return m("svg", {
                version : "1.1",
                xlmns : "http://www.w3.org/2000/svg",
                "xmlns:xlink" : "http://www.w3.org/1999/xlink",
                x : "0px",
                y : "0px",
                viewBox : "0 0 180 180",
                "xml:space" : "preserve",
                class : "house"
            }, [
                m("path", {"d" : "M179.18,87.57,92.15.88a3,3,0,0,0-4.25,0L.87,87.57A3,3,0,0,0,3,92.73H24v83.78a3,3,0,0,0,3,3H69a3,3,0,0,0,3-3V116.68h36v59.84a3,3,0,0,0,3,3h42a3,3,0,0,0,3-3V92.74h21.15a2.52,2.52,0,0,0,2-.93A3.15,3.15,0,0,0,179.18,87.57Z"}),
            ])
}
}

var SvgLock = {
view : function(){
    return m("svg", {
                version : "1.1",
                xlmns : "http://www.w3.org/2000/svg",
                "xmlns:xlink" : "http://www.w3.org/1999/xlink",
                x : "0px",
                y : "0px",
                viewBox : "0 0 135 180",
                "xml:space" : "preserve",
                class : "lock"
            }, [
                m("path", {"d" : "M112.5,78.75V45a45,45,0,0,0-90,0V78.75A22.5,22.5,0,0,0,0,101.25V157.5A22.5,22.5,0,0,0,22.5,180h90A22.5,22.5,0,0,0,135,157.5V101.25A22.51,22.51,0,0,0,112.5,78.75ZM73.13,133.27v18.6a5.63,5.63,0,1,1-11.25,0v-18.6a11.05,11.05,0,0,1-5.63-9.52,11.25,11.25,0,0,1,22.5,0A11.06,11.06,0,0,1,73.13,133.27ZM90,78.75H45V45a22.5,22.5,0,0,1,45,0V78.75Z"}),
            ])
}
}

/************************
Post's components
************************/	

var PostLeft = {
    view : function(vnode){
        return m("div", {class : "left"}, [
            m("div", {class : "picture-container"}, [
                m("div", {class : "picture", style : "background-image: url(" + vnode.attrs.imageUrl + ")"})
            ])
        ])
    }
}

var PostTop = {
view : function(vnode){
    var poster = vnode.attrs.poster;
    return m("div", {class : "top"}, [
        m(m.route.Link, {href : controller.isUserProfileName(poster.profileName) ? "/account" : ("/profile/" + poster.profileName), class : "poster"}, [
            m("div", {class : "poster-img-div"}, [
                m("span", {class : "poster-img", style : "background-image: url(" + poster.imageUrl + ")"}),
            ]),
            m("div", {class : "poster-name-div"}, [
                m("p", {class : "poster-name"}, poster.name)
            ])
        ])
    ])
}
}

var PostRightBottom = {
    view: function(vnode){
        var post = vnode.attrs.post;
        function likeClick(){
            controller.likePost(post.key);
        }
        function unlikeClick(){
            controller.unlikePost(post.key);
        }
        function modifiateClick(){
            controller.setUpdatePostEmpty(post);
            controller.setPop(UPDATE_POST_ID);
        }
        return m("div", {class : "bottom"}, [
            m("div", {class : "tools"}, [
                controller.isUserProfileName(post.poster.profileName) ?	
                m("span", {class : "post-modification", onclick : modifiateClick}, m("p", "Modifiate"))  		
                : m("span", {class : post.isLiked ? "like liked" : "like", onclick : post.isLiked ? unlikeClick : likeClick}, [m(SvgCoeur)])
            ]),
            m("div", {class : "stats"}, [
                m("p", {class : "like-number"}, 
                    post.numberLikes > 0 ?
                    [
                    "Liked by ",
                    m("b", {class : "number-of-likes"}, post.numberLikes),
                    post.numberLikes > 1 ? " persons" : " person"
                    ]
                    : ""
                )
            ])
        ])
    }
}

var PostRight = {
    view: function(vnode){
        var post = vnode.attrs.post;
        return m("div", {class : "right"}, [
            m("div", {class : "middle"}, [
                m("div", {class : "description"}, [
                    m("p", post.description)
                ])
            ]),
            m(PostRightBottom, {post : post})
        ])	
    }
}

var Post = {
    view : function(vnode){
        var post = vnode.attrs.post;
        var poster = post.poster;
        return m("div", {class : "post"},[
            m(PostLeft, {imageUrl : post.imageUrl}),
            m(PostTop, {poster : poster}),
            m(PostRight, {post : post})
        ])
        
    }
}
/************************
Timeline's components
************************/	    

var TimelineSelector = {
view : function(){
    function setPublicTimeline(){
        controller.setActiveTimeline(TIMELINE_PUBLIC_ID);
    }
    function setPrivateTimeline(){
        controller.setActiveTimeline(TIMELINE_PRIVATE_ID); 
    }
    function setLikedTimeline(){
        controller.setActiveTimeline(TIMELINE_LIKED_ID); 
    }
    return m("div", {id : "timeline-selector"}, [
        m("span", {class : "selector-container"},[
            m("span", {class : controller.timeline.activeTimeline == TIMELINE_PUBLIC_ID ? "selector active" : "selector", 
                      onclick : setPublicTimeline}, 
                [m(SvgHouse)] 
            )
        ]),
        m("span", {class : "selector-container"},[ 
            m("span", {class : controller.timeline.activeTimeline == TIMELINE_PRIVATE_ID ? "selector active" : "selector",
                       onclick : setPrivateTimeline}, 
                 [m(SvgLock)]
            )
        
        ]),
        m("span", {class : "selector-container"}, [
            m("span", {class : controller.timeline.activeTimeline == TIMELINE_LIKED_ID ? "selector active" : "selector", 
                      onclick : setLikedTimeline}, 
                [m(SvgCoeur)]
            )
        ])
    ])
}
}

var Timeline = {
view : function(){
    function loadMorePosts(){
        controller.callGetTimeline();
    }
    var postsArray = controller.timelineToPostsArray();
    return m("div", {class : "body-container"}, [
        controller.user.isConnected ? m(TimelineSelector) : "",
        m("div", {id : "timeline"}, [
            postsArray.length == 0 ? m("p", {class : "timeline-message"}, "Sorry but there's no post to display.") :
            postsArray.map(function(post){
                return m(Post, {post : post})
            }),
            !controller.getIsNotLastPostActiveTimeline() ? "" :
            m("div", {class : "load-more", onclick : loadMorePosts}, [m("p", "See more posts")])
        ])
    ])
}
}

/************************
Profile's components
************************/

var PictureGallery = {
    view : function(vnode){
        var post = vnode.attrs.post;
        function clickOnPost(){
            controller.extendPost(post.key);
        }
        return m("div", {class : "picture",
                         style : "background-image: url("+post.imageUrl+")",
                         onclick : clickOnPost
                         }, [
            m("div", {class : "picture-container"}, [ 
                m("span", {class : "likes-container"}, [ 
                    m("p", {class : "likes"}, post.numberLikes)
                ])
            ])
        ])
    }
}

var ProfileTop = {
    view : function(vnode){
        var profile = vnode.attrs.profile;
        function followProfile(){
            controller.followProfile(profile.profileName);
        }
        function unfollowProfile(){
            controller.unfollowProfile(profile.profileName);
        }
        function updateProfile(){
            controller.setPop(UPDATE_PROFILE_ID);
        }
        return m("div", {class : "profile"}, [
              m("div", {class : "left"}, [ 
                  m("div", {class : "profile-picture"}, [ 
                      m("div", {class : "picture", style : "background-image: url("+profile.imageUrl+")"})
                  ])
              ]),
              m("div", {class : "right"}, [ 
                  m("div", {class : "top"}, [
                      m("p", {class : "profile-name"}, profile.name),
                      controller.isUserKey(profile.key) ? 
                      m("span", {class : "profile-modification", onclick : updateProfile}, "Modifiate")		  
                      : m("span", {class : profile.isFollowed ? "unfollow-button" : "follow-button", onclick : profile.isFollowed ? unfollowProfile : followProfile}, profile.isFollowed ? "Unfollow" : "Follow")
                  ]),
                  m("div", {class : "stats"}, [
                      m("span", {class : "publication"}, [
                          m("b", profile.stats.numberPosts), " publications"
                      ]),
                      m("span", {class : "followers"}, [
                          m("b", profile.stats.numberFollowers), " followers"
                      ]),
                      m("span", {class : "follow"}, [
                          m("b", profile.stats.numberFollows), " follows"
                      ])
                  ]),
                  m("div", {class : "description"}, [
                      m("p", profile.description)
                  ])
              ])
          ])
    }
}

var Profile = {
view : function(vnode){
    controller.openProfile(vnode.attrs.profileName);
    var profile = controller.getProfileActive();
      var profilePosts = controller.getProfilePostsActive();
      function closeExtendPost(){
        controller.unextendPost();
      }
      function loadMorePosts(){
        controller.callGetProfilePosts(profile.profileName);
      }
    function openAddPost(){
        controller.setPop(ADD_POST_ID);	
    }		
      if(profile != null){
          return m("div", {class : "body-container"},[
              m(ProfileTop, {profile : profile}),
              m("div", {class : "gallery"}, [
                  controller.isUserKey(profile.key) ? m("div", {class : "post-add", onclick : openAddPost}, [m("p", "Add post")]) : "",
                  profilePosts.length == 0 ? "" : 
                    profilePosts.map(function(post){
                          return m(PictureGallery, {post : post})
                      })
              ]),
             controller.getIsNotLastPostProfileActive() ? m("div", {id : "load-more-profile", onclick : loadMorePosts}, [m("p", "See more posts")]) : "",
             m("div", {id : "extend", class : controller.postExtend.extendPostActive ? "active" : ""}, [
                m("div", {class : "overlay", onclick : closeExtendPost}),
                  controller.postExtend.extendPostActive  ? m(Post, {post : controller.postExtend.post}) : ""
              ])					
          ]);
  }
  else{
      return "";
  }
}
}	    

/*******************
Pop's component
*******************/		

var PopUpdateProfile = {
oninit : function(){
    controller.setUpdateProfileEmpty();
},
view : function(){
    function updateProfile(){
        if(controller.pop.updateProfileImage != null){
            controller.callPostImage(controller.pop.updateProfileImage, controller.callUpdateProfile, controller.pop.updateProfile);
        }
        else{
            controller.callUpdateProfile(controller.pop.updateProfile);
        }
    }
    function updateImage(e){
        var file = e.srcElement.files[0];
        if(! isImage(file.name)){
            controller.popMessage("Bad image format !");
        }
        else{
            var url = URL.createObjectURL(file);
            controller.pop.updateProfile.imageUrl = url;
            controller.pop.updateProfileImage = file;
        }
    }
    function cancel(){
        controller.closePop();
    }
    function dropHandle(e){
        e.preventDefault();
        controller.pop.dragover = false;
        var file = e.dataTransfer.files[0];
        var url = URL.createObjectURL(file);
        controller.pop.updateProfile.imageUrl = url;
        controller.pop.updateProfileImage = file;
    }
    function openDeletePop(){
        controller.setPop(DELETE_PROFILE_ID);
    }
    return m("div", {class : "pop-content pop-update-profile"}, [
        m("div", {class : "header-pop"}, [
            m("p", {class : "title-pop"}, "Update profile"),
            m("span", {class : "delete", onclick : openDeletePop}, [m(SvgTrash)])
        ]),
        m("form", [
            m("div", {
                class : controller.pop.dragover ? "picture-update-container ondrag" : "picture-update-container", 
                ondrop : dropHandle},[
                m("div", {class : "picture-update", 
                style : controller.pop.updateProfile.imageUrl != "" ? "background-image: url("+controller.pop.updateProfile.imageUrl+")" : ""},[
                    m("label", {for : "pop-update-profile-image"}),
                    m("input[type=file]", {id : "pop-update-profile-image", onchange : updateImage})
                ])
            ]),
            m("div", {class : "form-content"}, [
                m("label", "Name"),
                m("input[type=text]",{
                    oninput: function (e){controller.pop.updateProfile.name = e.target.value;},
                    value : controller.pop.updateProfile.name,
                    required : true
                }),
                m("label", "Description"),
                m("textarea", {
                    oninput: function (e){controller.pop.updateProfile.description = e.target.value;},
                    value: controller.pop.updateProfile.description
                })
            ],
            m("div", {class : "bottom-form"}, [
            m("span", {class : "cancel", onclick : cancel}, m("p", "Cancel")),
            m("span", {class : "save", onclick : updateProfile}, m("p","Save"))
        ]))
        ]),
    ])
}
}

var PopDeleteProfile = { 
view : function(){
    function deleteProfile(){
        controller.callDeleteProfile();
        controller.closePop();
    }
    function cancel(){
        controller.closePop();
    }
    return m("div", {class : "pop-content pop-delete-profile"}, [
        m("div", {class : "header-pop"}, [
            m("p", {class : "title-pop"}, "Delete profile")
        ]),
        m("div", {class : "delete-content"}, [
            m("p", {class : "confirm-title"}, "Delete your profile ? This action is irreversible."),
            m("div", {class : "button-container"}, [
                m("span", {class : "cancel", onclick : cancel}, m("p","Cancel")),
                m("span", {class : "delete", onclick : deleteProfile}, m("p","Delete"))
            ])
        ])
    ])
}
}

var PopAddPost = {
oninit : function(){
    controller.setAddPostEmpty();
},
view : function(){
    function addPost(){
        if(controller.pop.addPostImage != null){
            controller.callPostImage(controller.pop.addPostImage, controller.callAddPost, controller.pop.addPost);
        }
        else{
            controller.popMessage("You must import an image");
        }
    }
    function updateImage(e){
        var file = e.srcElement.files[0];
        if(! isImage(file.name)){
            controller.popMessage("Bad image format !");
        }
        else{
            setImage(file);
            var url = URL.createObjectURL(file);
            controller.pop.addPost.imageUrl = url;
        }
    }
    function cancel(){
        controller.closePop();
    }
    function setImage(file){
        controller.pop.addPostImage = file;
    }
    function dropHandle(e){
        e.preventDefault();
        controller.pop.dragover = false;
        var file = e.dataTransfer.files[0];
        setImage(file);
        var url = URL.createObjectURL(file);
        controller.pop.addPost.imageUrl = url;
    }
    var imageUrl = controller.pop.addPost.imageUrl != "" ? controller.pop.addPost.imageUrl : "";
    return m("div", {class : "pop-content pop-add-post"}, [
        m("div", {class : "header-pop"}, [
            m("p", {class : "title-pop"}, "Add post")
        ]),
        m("form", [
            m("div", {
                class : controller.pop.dragover ? "picture-update-container ondrag" : "picture-update-container", 
                ondrop : dropHandle},[
                m("div", {class : "picture-update", 
                style : imageUrl != "" ? "background-image: url("+imageUrl+")" : ""},[
                    m("label", {for : "pop-add-post-image"}),
                    m("input[type=file]", {id : "pop-add-post-image", onchange : updateImage})
                ])
            ]),
            m("div", {class : "form-content"}, [
                m("label", "Description"),
                m("textarea", {
                    oninput: function (e){controller.pop.addPost.description = e.target.value;},
                    value: controller.pop.addPost.description
                })
            ],
            m("div", {class : "bottom-form"}, [
            m("span", {class : "cancel", onclick : cancel}, m("p", "Cancel")),
            m("span", {class : "post", onclick : addPost}, m("p","Post"))
        ]))
        ]),
    ])
}
}

var PopUpdatePost = {
oninit : function(){},
view : function(){
    function updatePost(){
        controller.callUpdatePost(controller.pop.updatePost);
    }
    function cancel(){
        controller.closePop();
    }
    function openDeletePop(){
        controller.setPop(DELETE_POST_ID);
    }
    return m("div", {class : "pop-content pop-update-post"}, [
        m("div", {class : "header-pop"}, [
            m("p", {class : "title-pop"}, "Update post"),
            m("span", {class : "delete", onclick : openDeletePop}, [m(SvgTrash)])
        ]),
        m("form", [
            m("div", {class : "form-content"}, [
                m("label", "Description"),
                m("textarea", {
                    oninput: function (e){controller.pop.updatePost.description = e.target.value;},
                    value: controller.pop.updatePost.description
                })
            ],
            m("div", {class : "bottom-form"}, [
            m("span", {class : "cancel", onclick : cancel}, m("p", "Cancel")),
            m("span", {class : "save", onclick : updatePost}, m("p","Save"))
        ]))
        ]),
    ])
}
}


var PopDeletePost = { 
view : function(){
    function deletePost(){
        controller.callDeletePost(controller.pop.updatePost.keyString);
        controller.closePop();
    }
    function cancel(){
        controller.closePop();
    }
    return m("div", {class : "pop-content pop-delete-post"}, [
        m("div", {class : "header-pop"}, [
            m("p", {class : "title-pop"}, "Delete post")
        ]),
        m("div", {class : "delete-content"}, [
            m("p", {class : "confirm-title"}, "Delete your post ? This action is irreversible."),
            m("div", {class : "button-container"}, [
                m("span", {class : "cancel", onclick : cancel}, m("p","Cancel")),
                m("span", {class : "delete", onclick : deletePost}, m("p","Delete"))
            ])
        ])
    ])
}
}


var PopMessage = {
view : function(){
    return m("div", {class : "pop-content pop-message"},[
        m("div", {class : "header-pop"}, [
            m("p", {class : "title-pop"}, "Information")
        ]),
        m("div", {class : "message-content"}, [m("p", controller.pop.message)])
    ])
}
}

var PopError = {
view : function(){
    return m("div", {class : "pop-content pop-error"}, m("p", controller.pop.message))
}
}

var PopRegister = {
oncreate : function(){
    gapiRender("g-signin2-register");
},
view : function(){
    function onRegister(){
        controller.registerValidation();	
    }
    return m("div", {class : "pop-content pop-register"},[
        m("div", {class : "top"}, [
            m("p", "Register with Google")
        ]),
        m("div", {class : "content"}, [
            m("div", {id : "g-signin2-register"}),
            m("span", {class : "register-button", onclick : onRegister}, "Register")
        ])
    ])
}
}

var PopLogin = {
oncreate : function(){
    gapiRender("g-signin2-login");
},
view : function(){
    return m("div", {class : "pop-content pop-login"},[
        m("div", {class : "top"}, [
            m("p", "Login with Google")
        ]),
        m("div", {class : "content"}, [
            m("div", {id : "g-signin2-login"}),
        ])
    ])
}
}

var Pop = {
view: function(){
    function closePop(){
        controller.closePop();
    }
    function dragOver(e){
          // Prevent default behavior (Prevent file from being opened)
          e.preventDefault();
        if(!controller.pop.dragover){
            controller.pop.dragover = true;
        }
    }
    function dragLeave(e){
        e.preventDefault();
        if(controller.pop.dragover){
            controller.pop.dragover = false;
        }
    }
    function dropInOverlay(e){
        e.preventDefault();
        controller.pop.dragover = false;
    }
    return  m("div", {
        class : controller.pop.popActive ? "pop active" : "pop",
        ondragover : dragOver,
        ondragleave : dragLeave}, [
            m("div", {
                class : "overlay",
                onclick : closePop,
                ondragover : dragOver,
                ondragleave : dragLeave,
                ondrop : dropInOverlay}),
            controller.getPopActive()
        ])
}
} 

/*******************
Pages's component
*******************/

var Home = {
view : function(){
    return [m(Header), m(Timeline), m(Pop)]
}
}

var ProfilePage = {
view : function(vnode){
    return [m(Header), m(Profile, {profileName : vnode.attrs.id}), m(Pop)]
}
}

var AccountPage = {
    view : function(){
        return [m(Header), m(Profile, {profileName : controller.user.profile.profileName}), m(Pop)]
    }
}
