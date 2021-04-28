/*jshint esversion: 6 */

m.route(document.body, "/", {
    "/" : {
        onmatch: function() {
            return MyApp.Homepage;
        }
    },
    "/home" : {
        onmatch: function() {
            if (!auth2.isSignedIn.get()) return MyApp.NotSignedIn;
            else return MyApp.Homepage;
        }
    },
    "/profile": {
        onmatch: function() {
            if (!auth2.isSignedIn.get()) m.route.set("/login");
            else {
                MyApp.User.userData = {};
                MyApp.Profile.getPets();
                return MyApp.Profile;
            }
        }
    },
    "/search": {
        onmatch : function () {
            return MyApp.SearchedUsersList;
        }
    },
    "/user": {
        onmatch : function () {
            if(Object.keys(MyApp.User.userData).length !=0) return MyApp.User;
            else {
                m.route.set("/");
            }
        }
    },
    "/login": {
        onmatch: function () {
            return MyApp.Login;
        }
    }
});

var showProfile = false;
var showSearchList = false;
var showHomepage = false;

var isLoggedIn = false;
var auth2;
var googleUser; // The current user


gapi.load('auth2', function() {
    auth2 = gapi.auth2.init({
        client_id: "368951663363-jo5dp0r3mj44il3lgju55fvnn5p6j1qc.apps.googleusercontent.com"
    });
    auth2.attachClickHandler('signin-button', {}, onSuccess, onFailure);

    auth2.isSignedIn.listen(signinChanged);
    auth2.currentUser.listen(userChanged); // This is what you use to listen for user changes
});

var signinChanged = function (loggedIn) {

    if (auth2.isSignedIn.get()) {
        googleUser = auth2.currentUser.get();
        isLoggedIn = loggedIn;
        if(loggedIn) {
            MyApp.Profile.userData.name = googleUser.getBasicProfile().getName();
            MyApp.Profile.userData.email = googleUser.getBasicProfile().getEmail();
            MyApp.Profile.userData.firstName = googleUser.getBasicProfile().getGivenName();
            MyApp.Profile.userData.lastName= googleUser.getBasicProfile().getFamilyName();
            MyApp.Profile.userData.id = googleUser.getAuthResponse().id_token;
            MyApp.Profile.userData.url = googleUser.getBasicProfile().getImageUrl();

        } else {
            MyApp.Profile.userData.name = "";
            MyApp.Profile.userData.firstName = "";
            MyApp.Profile.userData.lastName = "";
            MyApp.Profile.userData.email = "";
            MyApp.Profile.userData.id = "";
            MyApp.Profile.userData.url = "";
        }
    }
};

var onSuccess = function(user) {
    googleUser = user;
    var profile = user.getBasicProfile();

    MyApp.Profile.userData.name = profile.getName();
    MyApp.Profile.userData.firstName = profile.getGivenName();
    MyApp.Profile.userData.lastName= profile.getFamilyName();
    MyApp.Profile.userData.email = profile.getEmail();
    MyApp.Profile.userData.id = user.getAuthResponse().id_token;
    MyApp.Profile.userData.url = profile.getImageUrl();

    isLoggedIn=true;

    MyApp.Profile.createUser();
    MyApp.Homepage.getTopTen();

    m.route.set("/home");
};

var onFailure = function(error) {
    console.log(error);
};

function signOut() {
    auth2.signOut().then(function () {
        console.log('User signed out.');
        window.location.reload();
    });
}

var userChanged = function (user) {
    if(user.getId()){
      // Do something here
    }
};

var MyApp = {
    view: function (ctrl) {
        return (
            m("div", [
                m(MyApp.Navbar, {}),

            ])
        );
    }
};

MyApp.Navbar = {
    view: function () {
        return m("nav", {class: "navbar is-link"}, [
            m("div", {class: "navbar-brand"}, [
                m(m.route.Link, {href: "/", class: "navbar-item"}, [
                    m("i", {class: "fas fa-home"}),
					m("p"," TinyPet")
				])
            ]),
            m("div", {class:"navbar-menu"}, [
                /* m("div", {class:"navbar-start"}, [
                    m(m.route.Link, {href: "/newPet", class: "navbar-item"}, [
                        m("i", {class: "fas fa-vote-yea"}),
                        m("p"," Poster une nouvelle pétition")
                    ])
                ]), */
                m("div", {class:"navbar-end"}, [
                    m("div", {class:"navbar-item"}, [
                        MyApp.Profile.userData.name
                    ]),
                    m(m.route.Link, {href: "/profile", class: "navbar-item"}, [
                        m("figure", {class: "image is-32x32"}, [
                            m("img", {
                                class: "is-rounded",
                                "src": MyApp.Profile.userData.url
                            })
                        ])
                    ]),
                    m("div", {class:"navbar-item"}, [
                        m("div", {class:"buttons"}, [
                            m("span", {class: "g-signin2", id:"signin-button"}, [
                                //m("p","Se connecter")
                            ])
                        ])
                    ])
                ])
            ]),
        ])
    },

};

MyApp.signInButton = {
    view: function () {
        return m("div", {
                "class":"g-signin2",
                "id":"signin-button"
            }
        );
    }
};

MyApp.Searchbar = {
    view: function () {
        if(MyApp.Profile.userData.id!="") {
            return m("div.form-inline", [
                m("div",
                    m("form.form-inline.my-2.my-lg-0[action='/search'][method='post']", {
                        id:"searchForm"
                    }, [
                        m("input.form-control.mr-sm-2[aria-label='Search'][id='search'][name='search'][placeholder='Search users'][type='search']"),
                        m("input[id='me'][name='me'][type='hidden'][value=" + MyApp.Profile.userData.email + "]"),
                        m("button.btn.btn-outline-success.my-2.my-sm-0.mr-2[type='submit']",{
                            onclick: function (e) {
                                e.preventDefault();
                                MyApp.Searchbar.searchUser();
                            }
                        } , "Search"),
                    ])
                ),
                m(MyApp.profilePicAndSignOut)
            ]);
        } else {
            return (
                m("form.form-inline.my-2.my-lg-0[action='/search'][method='post']", [
                    m("input.form-control.mr-sm-2[aria-label='Search'][id='search'][name='search'][placeholder='Please connect beforehand'][type='search'] [disabled='true']"),
                    m("button.btn.btn-outline-success.my-2.my-sm-0[type='submit'] [disabled='true']", "Search")
                ])
            );
        }
    },
    searchUser: function () {
        m.request({
            method: "GET",
            params: {
                'email': MyApp.Profile.userData.email,
                'search':$("#search").val(),
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            },
            url: "_ah/api/user_api/1.0/getSearchUser"
        })
        .then(function(response) {
            console.log("users:",response);
            var i = 0;
            var tinyUser = {};
            if(response.items === undefined) {
                MyApp.SearchedUsersList.tinyUserList= [];

            } else {
                response.items.forEach(function (item) {
                    var friend = false;
                    item.properties.followers.forEach(function (follower) {
                        if (follower == MyApp.Profile.userData.email) {
                            friend = true;
                        }
                    });
                    tinyUser=item.properties;
                    MyApp.SearchedUsersList.tinyUserList[i] = {
                        email:tinyUser.email,
                        name:tinyUser.name,
                        invertedName:tinyUser.invertedName,
                        firstName:tinyUser.firstName,
                        lastName:tinyUser.lastName,
                        url:tinyUser.url,
                        friend:friend,
                    };
                    i++;
                });
                console.log(MyApp.SearchedUsersList.tinyUserList);
            }
            m.route.set("/search");
        });
    }
};

MyApp.profilePicAndSignOut = {
    view: function () {
        if(MyApp.Profile.userData.id!="") {
            return m("div.form-inline.my-2.my-lg-0", [
                m("span[aria-controls='collapseSignOut'][aria-expanded='false'][data-target='#collapseSignOut'][data-toggle='collapse']",
                    m("img.mr-sm-2", {
                        class:"profile_image",
                        "style":"height:42px",
                        "src":MyApp.Profile.userData.url,
                        "alt":MyApp.Profile.userData.name,
                    })
                ),
                m(".collapse[id='collapseSignOut'].my-2.my-sm-", [
                    m("button.btn.btn-info", {
                        onclick: function () {
                            signOut();
                        }
                    }, "Sign Out")
                ]),
                ]);
        } else {
            return m("div");
        }
    }
};

MyApp.SearchedUsersList = {
    tinyUserList: [],
    view: function (vnode) {
        return (
            m("div",
                m(MyApp.Navbar),
                MyApp.SearchedUsersList.tinyUserList.length != 0 ?
                    m("div.container", [
                        m('table', {
                            class:'table is-striped',
                            "table":"is-striped"
                        },[
                            MyApp.SearchedUsersList.tinyUserList.map(function(tinyUser) {
                                return m("tr", {
                                    "style":"height:9vh"
                                }, [
                                    m('td', {
                                        "style":"width:10vw",
                                        onclick: function () {
                                            MyApp.SearchedUsersList.goToUser(tinyUser.email);
                                        }
                                    },  m('img',
                                        {
                                            "style":"height:8vh",
                                            class:"profile_image",
                                            'src': tinyUser.url,
                                            'alt':tinyUser.name,
                                        })
                                    ),
                                    m('td.inline', {
                                        "style":"width:80vw",
                                        onclick: function () {
                                            MyApp.SearchedUsersList.goToUser(tinyUser.email);
                                        }
                                    }, [
                                        m('h1', tinyUser.name),
                                        m('span', "("+tinyUser.email+")"),
                                    ]),
                                    m('td', {
                                        "style":"width:12vw"
                                    }, m('button.btn.float-right', {
                                        class:tinyUser.friend?"btn-danger":"btn-success",
                                        id: "btn_follow",
                                        onclick: function () {
                                            MyApp.SearchedUsersList.followUser(tinyUser);
                                        }
                                    }, tinyUser.friend?"Followed":"Follow")
                                    )
                                ]);
                            })
                        ])
                    ])
                    :
                    m("div.container",
                        m("h1.title", "No user found for your search...")
                    )
            )
        );
    },
    goToUser: function (email) {
        m.request({
            method: "GET",
            params: {
                'email': email,
            },
            url: "_ah/api/user_api/1.0/getUser"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),
        })
        .then(function (response) {
            var tinyUser = response.properties;
            var friend = false;
            var followers_count = -1;

            tinyUser.followers.forEach(function (follower) {
                followers_count++;
                if (follower == MyApp.Profile.userData.email) {
                    friend = true;
                }
            });

            MyApp.User.userData = {
                email:tinyUser.email,
                name:tinyUser.name,
                invertedName:tinyUser.invertedName,
                firstName:tinyUser.firstName,
                lastName:tinyUser.lastName,
                url:tinyUser.url,
                friend: friend,
                followers_count: followers_count,
                nextToken:"",
                pets:[],
            };
            MyApp.User.getPets();
            m.route.set("/user");
        });
    },
    followUser: function (tinyUser) {
        var data = {
            'askingUser': MyApp.Profile.userData.email,
            'targetUser': tinyUser.email,
        };
        if (!tinyUser.friend) {
            return m.request ({
                method: "POST",
                url: "_ah/api/user_api/1.0/followUser"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),                                                    params: data,
            }).then(function () {
                tinyUser.friend = true;
                document.getElementById("btn_follow").class = "btn-danger";
                console.log("Followed");
            });
        } else {
            return m.request ({
                method: "POST",
                url: "_ah/api/user_api/1.0/unfollowUser"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),                                                    params: data,
            }).then(function () {
                tinyUser.friend = false;
                document.getElementById("btn_follow").class = "btn-success";
                console.log("Unfollowed");
            });
        }
    }
};


MyApp.User = {
    userData: {},
    view: function (vnode) {
        return (
            m('div',[
                m(MyApp.Navbar),
                m('div', {class:'container'},[
                    m('div', {class:"row"},[
                        m('div', {class:"col-md-2 col-sm-2 col-xs-2"},
                            m("img", {
                                class:"profile_image",
                                "src":MyApp.User.userData.url,
                                "alt":MyApp.User.userData.name+"'s profile picture"
                            })
                        ),
                        m('div', {class:"col-md-3 col-sm-3 col-xs-3"},
                            m("h1", {
                                class: 'title'
                            }, MyApp.User.userData.name),
                            m("h2", {
                                class: 'subtitle'
                            }, MyApp.User.userData.email)
                        ),
                        m("div", {class:"col-md-3 col-sm-3 col-xs-3"},
                            m("h2.subtitle", MyApp.User.userData.followers_count +" abonné(es)")
                        ),
                        MyApp.Profile.userData.email != MyApp.User.userData.email?
                            m('div', {class:"col-md-4 col-sm-4 col-xs-4"},
                                m("button.btn.float-right", {
                                    class: MyApp.User.userData.friend?"btn-danger":"btn-success",
                                    onclick: function () {
                                        MyApp.User.followUser();
                                    }
                                }, MyApp.User.userData.friend?"Unfollow":"Follow")
                            ):
                            m('div', {class:"col-md-4 col-sm-4 col-xs-4"},
                                m("span.btn.float-left", {
                                    class:"btn-outline-info",
                                    style:"cursor:inherit",
                                    onclick: function () {
                                        m.route.set("/profile");
                                    }
                                }, "This is your public profile (click to access to your profile)")
                            )]
                    ),
                    m("div",m(MyApp.PostView,{profile: MyApp.User, owned:false}))
                ]),
            ])
        );
    },
    getPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/post_api/1.0/getPost",
            params: {
                'email':MyApp.User.userData.email,
                'access_token':encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            console.log("load_list:",response);
            MyApp.User.userData.pets=response.items;
            if ('nextPageToken' in response) {
                MyApp.User.userData.nextToken= response.nextPageToken;
            } else {
                MyApp.User.userData.nextToken="";
            }
        });
    },
    getNextPets: function() {
        console.log(MyApp.Profile.userData.nextToken);
        return m.request({
            method: "GET",
            url: "_ah/api/post_api/1.0/getPost",
            params: {
                'email':MyApp.User.userData.email,
                'next':MyApp.User.userData.nextToken,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            if(response.items !=  undefined) {
                MyApp.User.userData.pets = response.items;
            }
            if ('nextPageToken' in response) {
                MyApp.User.userData.nextToken= response.nextPageToken;
            } else {
                MyApp.User.userData.nextToken="";
            }
        });
    },
    followUser: function () {
        var data = {
            'askingUser': MyApp.Profile.userData.email,
            'targetUser': MyApp.User.userData.email,
        };
        if (!MyApp.User.userData.friend) {
            return m.request ({
                method: "POST",
                url: "_ah/api/user_api/1.0/followUser"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),                                                params: data,
            }).then(function () {
                MyApp.User.userData.friend = true;
                MyApp.User.userData.followers_count++;
                m.redraw();
                console.log("Followed");
            });
        } else {
            return m.request ({
                method: "POST",
                url: "_ah/api/user_api/1.0/unfollowUser"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),                                                params: data,
            }).then(function () {
                MyApp.User.userData.friend = false;
                MyApp.User.userData.followers_count--;
                m.redraw();
                console.log("Unfollowed");
            });
        }
    }
};

MyApp.Homepage = {
    pets: [],
    loading_gif: false,
    view: function () {
        if (MyApp.Profile.userData.id == "") return m(MyApp.NotSignedIn);
        else {
            return m("div", [
                m(MyApp.Navbar),
                m("div.container", [
                    m("h1.title","Top 10 des pétitions"),
                    m("button.btn.mb-5", {
                        onclick: function () {
                            MyApp.Homepage.getTopTen();
                        }
                    }, "Rafraîchir"),
                        MyApp.Homepage.loading_gif?
                            m("div",
                                m("img", {
                                    "style":"text-center",
                                    "src":"static/images/loading.gif",
                                    "alt":"Loading..."
                                })
                            )
                            :
                            MyApp.Homepage.pets.length==0?
                                m("div",
                                    m("span", "Pas de pétitions à afficher...")
                                ):
                                m('div', {
                                    class:'columns-entity columns is-mobile is-multiline is-centered'
                                },[
                                    MyApp.Homepage.pets.map(function(pet) {
                                        return m("div", {class:"column is-narrow"}, [
                                            m('div', {
                                                class: "card",
                                                onclick: function () {
                                                    MyApp.Homepage.goToUser(pet.owner);
                                                }
                                            }, [
                                                m("div", {class:"card-content"}, [
                                                    m("div", {class:"media"}, [
                                                        m("div", {class:"media-left"}, [
                                                            m("i", {class:"fas fa-vote-yea"})
                                                        ]),
                                                        m("div", {class:"media-content"}, [
                                                            m("p", {class:"title is-4"}, [
                                                                pet.title
                                                            ]),
                                                            m("p", {class:"subtitle is-6"}, [
                                                                pet.body
                                                            ]),
                                                            m("p", {class:"subtitle is-6 is-italic"}, [
                                                                pet.tags
                                                            ])
                                                        ])
                                                    ]),
                                                    m("div", {class:"content"}, [
                                                        m("div", {class:"has-text-grey"}, [
                                                            "Publié par "+pet.owner+" le "+pet.date
                                                        ])
                                                    ])
                                                ]),
                                                m("div", {class:"card-footer"}, [
                                                    m("div", {class:"card-footer-item"}, [
                                                        "Votants : "+pet.nbVotants+"/"+pet.goal
                                                    ]),
                                                    m("a", {
                                                        href: "#",
                                                        class: "card-footer-item",
                                                        onclick: function () {
                                                            MyApp.Homepage.signPet(pet.key.name);
                                                        }
                                                    },"Signer")
                                                ])
                                            ])
                                        ]);
                                    })
                                ]),
                                m('button',{
                                    class: 'btn btn-info float-right mt-3',
                                    onclick: function(e) {
                                        MyApp.Homepage.getNextPets();
                                    }
                                }, "Next"),

                ])
            ]);
        }
    },
    getTopTen : function () {
        MyApp.Homepage.loading_gif = true;
        m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/topTen"+'?access_token=' + encodeURIComponent(MyApp.Profile.userData.id)
        })
        .then(function(response) {
            showHomepage = true;
            MyApp.Homepage.loading_gif = false;
            var i = 0;
            if (response.items === undefined) {
                MyApp.Homepage.pets = [];
            } else {
                response.items.forEach( function (pet) {
                    MyApp.Homepage.pets[i] = {
                        "key":pet.key,
                        "title":pet.properties.title,
                        "owner":pet.properties.owner,
                        "date":pet.properties.date,
                        "body":pet.properties.body,
                        "goal":pet.properties.goal,
                        "tags":pet.properties.tags,
                        "nbVotants":pet.properties.nbVotants
                    };
                    i++;
                });
            }
        });
    },
    getNextPets: function() {
        console.log(MyApp.Profile.userData.nextToken);
        return m.request({
            method: "GET",
            url: "_ah/api/post_api/1.0/getTimeline",
            params: {
                'next':MyApp.Profile.userData.nextToken,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            showTopten = true;
            MyApp.Homepage.loading_gif = false;
            var i = 0;
            if (response.items != undefined) {
                response.items.forEach( function (post) {
                    MyApp.Homepage.pets[i] = {
                        "key":pet.key,
                        "title":pet.properties.title,
                        "owner":pet.properties.owner,
                        "date":pet.properties.date,
                        "body":pet.properties.body,
                        "goal":pet.properties.goal,
                        "tags":pet.properties.tags,
                        "nbVotants":pet.properties.nbVotants
                    };
                    i++;
                });
                if ('nextPageToken' in response) {
                    MyApp.Profile.userData.nextToken = response.nextPageToken;
                } else {
                    MyApp.Profile.nextToken="";
                }
            }
        });
    },
    signPet: function (signedPet) {
	    var data = {
            'signedPet': signedPet,
            'email': MyApp.Profile.userData.email
        };
        m.request ({
	 		method: "POST",
            url: "_ah/api/myApi/v1/petition/sign"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),
            params: data,
		}).then(function(response){
            console.log(signedPet+ "successfully signed");
            MyApp.Homepage.getTopTen();
            m.redraw();
        });
    },
    goToUser: function (email) {
        m.request({
            method: "GET",
            params: {
                'email': email,
            },
            url: "_ah/api/user_api/1.0/getUser"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),        })
        .then(function (response) {
            var tinyUser = response.properties;
            MyApp.User.userData = {
                email:tinyUser.email,
                name:tinyUser.name,
                invertedName:tinyUser.invertedName,
                firstName:tinyUser.firstName,
                lastName:tinyUser.lastName,
                url:tinyUser.url,
                nextToken:"",
                pets:[],
            };
            m.route.set("/user");
        });
    }
};

MyApp.NotSignedIn = {
    view: function () {
        return m("div", [
            m(MyApp.Navbar),
            m("div.container", [
                m("div.row.mb-3",
                    m("div", {
                        class:"title col-md-12 col-sm-12 col-xs-12"
                    },
                        m("h1", "Bienvenue sur TinyPet ! Le paradis des pétitions !"))
                ),
                m("div.row.mt-1", [
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/japanese_bridge.jpg",
                        "alt":"Japanese bridge"
                    })),
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/instagram_101.jpg",
                        "alt":"would-be-nice-on-insta-101"
                    })),
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/floating-homes-in-the-beautiful-dusk-light.jpg",
                        "alt":"Floating homes in the beautiful dusk light"
                    })),
                ]),
                m("div.row.mt-1", [
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/skyrim.jpg",
                        "alt":"skyrim > real world"
                    })),
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/sun_behind_trees.jpg",
                        "alt":"The sun behind trees (it always is behind things tho)"
                    })),
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/kaermorhen.jpg",
                        "alt":"Kaer morhen looks nice"
                    }))
                ]),
                m("div.row.mt-1", [
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/trees.jpg",
                        "alt":"Mmmmmmh... trees"
                    })),
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/winter_sunset.jpg",
                        "alt":"Winter is gorgeous but kinda sucks anyway"
                    })),
                    m("div", {
                        class:"col-md-4 col-sm-4 col-xs-4"
                    },m("img.my-auto", {
                        "src":"static/images/windows_like.jpg",
                        "alt":"Is it a windows wallpaper ??"
                    }))
                ]),
            ])
        ]);
    }
};

MyApp.Profile = {
    userData: {
        name: "",
        firstName: "",
        lastName: "",
        email: "",
        id: "",
        url: "",
        content:"",
        nextToken:"",
        followers_count:0,
        pets:[],
    },
    view: function(){
        return m('div',[
            m(MyApp.Navbar),
            m('div', {class:'container mt-5'},[
                m('div', {class:"row"},[
                    m('div', {class:"col-md-2 col-sm-2 col-xs-2"},
                        m("img", {
                            class:"profile_image",
                            "src":MyApp.Profile.userData.url
                        })
                    ),
                    m('div', {class:"col-md-5 col-sm-5 col-xs-5"},
                        m("h1", {
                            class: 'title'
                        }, MyApp.Profile.userData.name),
                        m("h2", {
                            class: 'subtitle'
                        }, MyApp.Profile.userData.email)
                    ),
                    m('div', {class:"col-md-2 col-sm-2 col-xs-2"},
                        m("button", {
                            class:"btn btn-info float-right",
                            onclick: function () {
                                MyApp.Profile.getPets();
                            },
                        },"Rafraîchir")
                    )]
                ),
                m("form", {
                    onsubmit: function(e) {
                        e.preventDefault();
                        var pet_goal = "";
                        var pet_body = "";
                        var pet_tags = "";
                        var pet_title = "";
                        pet_title = $("#new_pet_title").val();
                        pet_goal = $("#new_pet_goal").val();
                        pet_body = $("#new_pet_body").val();
                        pet_tags = $("#new_pet_tags").val();
                        MyApp.Profile.newPet(pet_goal,pet_title,pet_tags,pet_body);
                    }},
                    [
                        m('div', {
                            class:'field'
                        },[
                            m("label", {
                                class:'label',
                            },"Titre"),
                            m('div',{class:'control'},
                                m("input[type=text]", {
                                    class:'input',
                                    placeholder:"Le titre de votre pétition",
                                    id:"new_pet_title"
                                })
                            ),
                        ]),
                        m('div',{class:'field'},[
                            m("label", {class: 'label'},"Description"),
                            m('div',{class:'control'},
                                m("input[type=textarea]", {
                                    class:'textarea',
                                    placeholder:"Décrivez votre pétition",
                                    id:"new_pet_body"
                                })
                            ),
                        ]),
                        m('div',{class:'field'},[
                            m("label", {class: 'label'},"But"),
                            m('div',{class:'control'},
                                m("input[type=number]", {
                                    class:'input',
                                    placeholder:"Le but visé en termes de votes",
                                    id:"new_pet_goal"
                                })
                            ),
                        ]),
                        m('div', {
                            class:'field'
                        },[
                            m("label", {
                                class:'label',
                            },"Hashtags"),
                            m('div',{class:'control'},
                                m("input[type=text]", {
                                    class:'input',
                                    placeholder:"Les différents tags séparés par des virgules (exemple : #cat,#food,#government)",
                                    id:"new_pet_tags"
                                })
                            ),
                        ]),
                        m('div',{class:'control mt-3'},
                            m("button[type=submit]", {
                                class:'float-right btn btn-success'
                            },"Poster la pétition")
                        ),
                    ]
                ),
                m("br.mt-3"),
            ]),
            m("div",m(MyApp.PostView,{profile: MyApp.Profile, owned: true}))
        ]);
    },
    getPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/created",
            params : {
                'email':MyApp.Profile.userData.email,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            console.log("load_list:",response);
            MyApp.Profile.userData.pets=response.items;
            if ('nextPageToken' in response) {
                MyApp.Profile.userData.nextToken= response.nextPageToken;
            } else {
                MyApp.Profile.userData.nextToken="";
            }
        });
    },
    getNextPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/post_api/1.0/getPost",
            params: {
                'email':MyApp.User.userData.email,
                'next':MyApp.Profile.userData.nextToken,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            if(response.items != undefined) {
                MyApp.Profile.userData.pets = response.items;
                if ('nextPageToken' in response) {
                    MyApp.Profile.userData.nextToken = response.nextPageToken;
                } else {
                    MyApp.Profile.nextToken = "";
                }
            }
        });
    },
    newPet: function(goal, title, tags, body) {
        var data= {};
        var arrayTags = tags.split(',');
        data= {
            'body': body,
            'goal': goal,
            'title': title,
            'tags': arrayTags,
            'access_token': encodeURIComponent(MyApp.Profile.userData.id)
        };
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/petition/create",
            params: data,
        })
        .then(function(response) {
            MyApp.Profile.getPets();
        });
    },
    createUser: function() {
        var data = {
            'email': MyApp.Profile.userData.email,
            'firstName': MyApp.Profile.userData.firstName,
            'lastName': MyApp.Profile.userData.lastName,
            'name': MyApp.Profile.userData.name,
            'invertedName': MyApp.Profile.userData.lastName + " " + MyApp.Profile.userData.firstName,
            'url': MyApp.Profile.userData.url,
            'access_token': encodeURIComponent(MyApp.Profile.userData.id)
        };
        m.request ({
            method: "POST",
            url: "_ah/api/myApi/v1/user/create",
            params: data,
        }).then(function (response){
            //MyApp.Profile.userData.followers_count = response.properties.followers.length-1;
        });
    },
};

MyApp.PostView = {
    view: function(vnode) {
        return m('div', [
            m('div.mt-3.mb-3', {
                class:'subtitle'
            },
                m("h3",vnode.attrs.owned?"My Pets":vnode.attrs.profile.userData.name+"'s Pets")
            ),
            m('table', {
                class:'table is-striped',"table":"is-striped"
            },[
                vnode.attrs.owned?
                m('tr', [
                    m('th', {
                        "style":"width:40vw"
                    }, "Post"),
                    m('th', {
                        "style":"width:30vw"
                    }, "Caption"),
                    m('th', {
                        "style":"width:5vw"
                    }, "Votes"),
                    m('th', {
                        "style":"width:10vw"
                    }),
                    m('th', {
                        "style":"width:10vw"
                    }),
                ]):
                m('tr', [
                    m('th', {
                        "style":"width:50vw"
                    }, "Post"),
                    m('th', {
                        "style":"width:30vw"
                    }, "Caption"),
                    m('th', {
                        "style":"width:5vw"
                    }, "Votes"),
                    m('th', {
                        "style":"width:15vw"
                    }),
                ]),
                (vnode.attrs.profile.userData.pets != undefined)?
                    vnode.attrs.profile.userData.pets.map(function(item) {
                        if (vnode.attrs.owned) {
                            return m("tr", [
                                m('td', {
                                    "style":"width:40vw"
                                }, m('img', {
                                        class:"profile_image",
                                        'src': item.properties.url
                                    })
                                ),
                                m('td', {
                                    "style":"width:30vw"
                                }, m('label', item.properties.body)
                                ),
                                m('td', {
                                    "style":"width:5vw"
                                },
                                    m('label',
                                        item.properties.likes
                                    )
                                ),
                                m("td", {
                                    "style":"width:10vw"
                                },
                                    m("button", {
                                        "class":"btn btn-danger",
                                        onclick: function() {
                                            MyApp.PostView.deletePost(item);
                                        },

                                        },
                                    "Supprimer cette pétition")
                                )
                            ]);
                        } else {
                            return m("tr", [
                                m('td', {
                                    "style":"width:50vw"
                                }, m('img', {
                                        class:"profile_image",
                                        'src': item.properties.url
                                    })
                                ),
                                m('td', {
                                    "style":"width:30vw"
                                }, m('label', item.properties.body)
                                ),
                                m('td', {
                                    "style":"width:5vw"
                                },
                                    m('label',
                                        item.properties.likes
                                    )
                                ),
                                m("td", {
                                    "style":"width:15vw"
                                },
                                        m("button", {
                                            "class":"btn btn-success float-right",
                                            onclick: function () {
                                                MyApp.PostView.signPet(item.key.name);
                                            },
                                    },
                                    "Sign this petition")
                                ),
                            ]);
                        }
                    }):
                m("div")
            ]),
            m('button',{
                class: 'btn btn-info float-right mt-3',
                onclick: function(e) {
                    vnode.attrs.profile.getNextPets();
                }
            }, "Next"),
        ]);
    },
    deletePost: function (post) {
        var data = {
            'id': post.key.name,
            'access_token': encodeURIComponent(MyApp.Profile.userData.id)
        };
        m.request ({
            method: "POST",
            url: "_ah/api/post_api/1.0/deletePost",
            params: data,
        }).then(function(response) {
            MyApp.Profile.getPets();
            m.redraw();
        });

    },
	signPet: function(signedPet) {
	    var data = {
            'signedPet': signedPet,
            'email': MyApp.Profile.userData.email,
            'access_token': encodeURIComponent(MyApp.Profile.userData.id)
        };
	    m.request ({
	 		method: "POST",
            url: "_ah/api/myApi/v1/petition/sign",
            params: data,
		}).then(function() {
            MyApp.User.getPets();
            m.redraw();
        });
	}
};

MyApp.Login = {
    view: function() {
        return m('div',[
            m(MyApp.Navbar),
            m('div.container',[
                m("h1.title", 'Please Sign in with google to use the application.'),
                m("h2", 'If no sign in button appears on the top left of the screen, please refresh the page.'),
            ])
        ]);
    }
};