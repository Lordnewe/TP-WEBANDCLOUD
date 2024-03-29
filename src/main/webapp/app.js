/*jshint esversion: 6 */

m.route(document.body, "/", {
    "/" : {
        onmatch: function() {
            MyApp.Homepage.getTopTen();
            return MyApp.Homepage;
        }
    },
    "/myProfile": {
        onmatch: function() {
            if (!auth2.isSignedIn.get()) m.route.set("/notLogged");
            else {
                MyApp.User.userData = {};
                MyApp.Profile.getCreatedPets();
                MyApp.Profile.getSignedPets();
                return MyApp.Profile;
            }
        }
    },
    "/postNewPet": {
        onmatch: function() {
            if (!auth2.isSignedIn.get()) m.route.set("/notLogged");
            else {
                return MyApp.PostNewPet;
            }
        }
    },
    "/search": {
        onmatch : function () {
            return MyApp.SearchedPetList;
        }
    },
    "/signataires": {
        onmatch : function () {
            return MyApp.SignatairesList;
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
    "/notLogged": {
        onmatch: function () {
            return MyApp.NotLogged;
        }
    }
});

var showProfile = false;
var showSearchList = false;
var showHomepage = false;

var isLoggedIn = false;
var auth2;
var googleUser;


gapi.load('auth2', function() {
    auth2 = gapi.auth2.init({
        client_id: "368951663363-jo5dp0r3mj44il3lgju55fvnn5p6j1qc.apps.googleusercontent.com"
    });
    auth2.attachClickHandler('signin-button', {}, onSuccess, onFailure);

    auth2.isSignedIn.listen(signinChanged);
    auth2.currentUser.listen(userChanged);
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

    m.route.set("/");
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

$(window).on('load', function() {
    MyApp.Homepage.getTopTen();
});

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
        return m("nav", {class: "navbar is-fixed-top is-link"}, [
            m("div", {class: "navbar-brand"}, [
                m(m.route.Link, {href: "/", class: "navbar-item"}, [
                    m("img", {"src": "ressources/img/apple-touch-icon.png"}),
					m("p"," TinyPet")
				])
            ]),
            m("div", {class:"navbar-menu"}, [
                m("div", {class:"navbar-start"}, [
                    m(MyApp.postNewPetMenu),
                    m(MyApp.Searchbar)
                ]),
                m("div", {class:"navbar-end"}, [
                    m("div", {class:"navbar-item"}, [
                        MyApp.Profile.userData.name
                    ]),
                    m(m.route.Link, {href: "/myProfile", class: "navbar-item"}, [
                        m("figure", {class: "image is-32x32"}, [
                            m("img", {
                                class: "is-rounded",
                                "src": MyApp.Profile.userData.url
                            })
                        ])
                    ]),
                    m(MyApp.signOutButton)
                ])
            ]),
        ])
    },
};

MyApp.postNewPetMenu = {
    view: function() {
        if(MyApp.Profile.userData.id != "") {
            return m(m.route.Link, {href: "/postNewPet", class: "navbar-item"}, [
                m("i", {class: "fas fa-vote-yea"}),
                m("p"," Poster une nouvelle pétition")
            ])
        }
    }
};

MyApp.signOutButton = {
    view: function() {
        if(MyApp.Profile.userData.id != "") {
            return m("div", {class:"navbar-item"}, [
                m("div", {class:"buttons"}, [
                    m("span", {class: "button is-danger",
                    onclick: function() {
                        signOut();
                    }
                }, [
                        "Déconnexion"
                    ])
                ])
            ])
        } else {
            return m("div", {class:"navbar-item"}, [
                m("div", {class:"buttons"}, [
                    m("span", {class: "g-signin2", id:"signin-button"}, [
                    ])
                ])
            ])
        }
    }
};

MyApp.Searchbar = {
    view: function () {
        if(MyApp.Profile.userData.id!="") {
            return m("div", {class:"navbar-item"}, [
                    m("form[action='/search'][method='post']", [
                        m("div", {class:"field has-addons"}, [
                            m("p", {class:"control"}, [
                                m("input.input[aria-label='Search'][id='search'][name='search'][placeholder='Rechercher une pétition'][type='search']")
                            ]),
                            m("input[id='me'][name='me'][type='hidden'][value=" + MyApp.Profile.userData.email + "]"),
                            m("p", {class:"control"}, [
                                m("button.button.is-primary[type='submit']",{
                                    onclick: function (e) {
                                        e.preventDefault();
                                        MyApp.Searchbar.searchPetByTagOrTitle();
                                    }
                                } , "Rechercher"),
                            ])
                    ])
                ])
            ])
        }
    },
    searchPetByTagOrTitle: function () {
        m.request({
            method: "GET",
            params: {
                'email': MyApp.Profile.userData.email,
                'search':$("#search").val(),
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            },
            url: "_ah/api/myApi/v1/petitions/searchByTagOrTitle"
        })
        .then(function(response) {
            console.log("pets:",response);
            var i = 0;
            var pet = {};
            if(response.items === undefined) {
                MyApp.SearchedPetList.petList= [];
            } else {
                response.items.forEach(function (item) {
                    pet=item.properties;
                    petKey=item.key;
                    MyApp.SearchedPetList.petList[i] = {
                        key:petKey,
                        title:pet.title,
                        owner:pet.owner,
                        date:pet.date,
                        body:pet.body,
                        goal:pet.goal,
                        tags:pet.tags,
                        nbVotants:pet.nbVotants
                    };
                    i++;
                });
                console.log(MyApp.SearchedPetList.petList);
            }
            m.route.set("/search");
        });
    }
};

MyApp.SearchedPetList = {
    petList: [],
    view: function (vnode) {
        return (
            m("div",
                m(MyApp.Navbar),
                MyApp.SearchedPetList.petList.length != 0 ?
                    m("div.container", [
                        m('div', {
                            class:'subtitle'
                        },
                            m("h1","Résultats de la recherche")
                        ),
                        m('table', {
                            class:'table is-fullwidth'
                        },[
                            m('thead', [
                                m('tr', [
                                    m('th', "Publié par"),
                                    m('th', "Titre"),
                                    m('th', "Description"),
                                    m('th', "Votes"),
                                    m('th', "Objectif"),
                                    m('th', "Date de publication"),
                                    m('th', "Tags"),
                                    m('th', ""),
                                    m('th', ""),
                                ])
                            ]),
                                MyApp.SearchedPetList.petList.map(function(pet) {
                                        return m('tbody', [
                                            m("tr", [
                                                m('td', m('a', {
                                                    onclick: function () {
                                                        MyApp.SearchedPetList.goToUser(pet.owner);
                                                    }
                                                }, pet.owner)),
                                                m('td', m('label', pet.title)),
                                                m('td', m('label', pet.body)),
                                                m('td', m('label', pet.nbVotants)),
                                                m('td', m('label', pet.goal)),
                                                m('td', m('label', pet.date)),
                                                m('td', m('label', pet.tags)),
                                                m("td", m("button", {
                                                        "class":"button is-info",
                                                        onclick: function () {
                                                            MyApp.SearchedPetList.signPet(pet.key.name);
                                                        },
                                                    },
                                                    "Signer cette pétition")
                                                ),
                                                m("td", m("button", {
                                                        "class":"button is-info",
                                                        onclick: function () {
                                                            MyApp.Homepage.getSignataires(pet.key.name);
                                                        },
                                                    },
                                                    "Liste des signataires")
                                                )
                                            ])
                                        ])
                                })
                        ])
                    ]
                )
                :
                m("div.container",
                    m("h1.title", "Pas de pétition trouvée")
                )
            )
        );
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
            MyApp.Searchbar.searchPetByTagOrTitle();
            m.redraw();
        });
    },
    goToUser: function (email) {
        m.request({
            method: "GET",
            params: {
                'email': email,
            },
            url: "_ah/api/myApi/v1/user/getInfos"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),        })
        .then(function (response) {
            var user = response.properties;
            MyApp.User.userData = {
                email:user.email,
                name:user.name,
                invertedName:user.invertedName,
                firstName:user.firstName,
                lastName:user.lastName,
                url:user.url,
                nextToken:"",
                pets:[],
            };
            MyApp.User.getCreatedPets();
            m.route.set("/user");
        });
    }
};

MyApp.SignatairesList = {
    pet: {},
    view: function (vnode) {
        return (
            m("div",
                m(MyApp.Navbar),
                    m("div.container", [
                        m('div', {
                            class:'subtitle'
                        },
                            m("h1","Liste des signataires de la pétition '"+MyApp.SignatairesList.pet.title+"'")
                        ),
                        m('table', {
                            class:'table is-fullwidth'
                        },[
                            m('thead', [
                                m('tr', [
                                    m('th', "Adresse mail")
                                ])
                            ]),
                                MyApp.SignatairesList.pet.votants.map(function(votant) {
                                        return m('tbody', [
                                            m("tr", [
                                                m('td', m('label', votant))
                                            ])
                                        ])
                                })
                        ])
                    ]
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
            url: "_ah/api/myApi/v1/user/getInfos"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),        })
        .then(function (response) {
            var user = response.properties;
            MyApp.User.userData = {
                email:user.email,
                name:user.name,
                invertedName:user.invertedName,
                firstName:user.firstName,
                lastName:user.lastName,
                url:user.url,
                nextToken:"",
                pets:[],
            };
            MyApp.User.getCreatedPets();
            m.route.set("/user");
        });
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
                            m("figure", {class: "image is-96x96"}, [
                                m("img", {
                                    class: "is-rounded",
                                    "src": MyApp.User.userData.url,
                                    "alt":"Photo de profil de "+MyApp.User.userData.name
                                })
                            ])
                        ),
                        m('div', {class:"col-md-3 col-sm-3 col-xs-3"},
                            m("h1", {
                                class: 'title'
                            }, MyApp.User.userData.name),
                            m("h2", {
                                class: 'subtitle'
                            }, MyApp.User.userData.email)
                        )]
                    ),
                    m("div",m(MyApp.PetsTable,{profile: MyApp.User, owned:false}))
                ]),
            ])
        );
    },
    getCreatedPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/created",
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
    getNextCreatedPets: function() {
        console.log(MyApp.Profile.userData.nextToken);
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/created",
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
    }
};

MyApp.Homepage = {
    pets: [],
    loading_gif: false,
    view: function () {
        return m("div", [
            m(MyApp.Navbar),
            m("div.container", [
                m("h1.title","Top 10 des pétitions"),
                m("button.button is-info", {
                    onclick: function () {
                        MyApp.Homepage.getTopTen();
                    }
                }, "Rafraîchir"),
                    MyApp.Homepage.loading_gif?
                        m("div.has-text-centered",
                            m("img", {
                                "width":"454",
                                "height":"auto",
                                "src":"ressources/img/loading.gif",
                                "alt":"Chargement..."
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
                                            class: "card"
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
                                                        "Publié par ",
                                                        m("a", {
                                                            href: "#",
                                                            onclick: function () {
                                                                MyApp.Homepage.goToUser(pet.owner);
                                                            }
                                                        },pet.owner),
                                                        " le "+pet.date
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
                                                },"Signer"),
                                                m("a", {
                                                    href: "#",
                                                    class: "card-footer-item",
                                                    onclick: function () {
                                                        MyApp.Homepage.getSignataires(pet.key.name);
                                                    }
                                                },"Liste des signataires")
                                            ])
                                        ])
                                    ]);
                                })
                            ]),

            ])
        ]);
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
            url: "_ah/api/myApi/v1/user/getInfos"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id),        })
        .then(function (response) {
            var user = response.properties;
            MyApp.User.userData = {
                email:user.email,
                name:user.name,
                invertedName:user.invertedName,
                firstName:user.firstName,
                lastName:user.lastName,
                url:user.url,
                nextToken:"",
                pets:[],
            };
            MyApp.User.getCreatedPets();
            m.route.set("/user");
        });
    },
    getSignataires: function (petition) {
        m.request({
            method: "GET",
            params: {
                'petition': petition
            },
            url: "_ah/api/myApi/v1/petitions/signataires"+'?access_token='+encodeURIComponent(MyApp.Profile.userData.id)
        })
        .then(function(response) {
            pet=response.properties;
            petKey=response.key;
            MyApp.SignatairesList.pet = {
                key:petKey,
                title:pet.title,
                owner:pet.owner,
                date:pet.date,
                body:pet.body,
                goal:pet.goal,
                tags:pet.tags,
                votants:pet.votants,
                nbVotants:pet.nbVotants
            };
            console.log(MyApp.SignatairesList.signList);
            m.route.set("/signataires");
        });
    }
};

MyApp.PostNewPet = {
    view: function(){
        return m('div',[
            m(MyApp.Navbar),
            m('div', {class:'container'},[
                m("h1.title","Poster une nouvelle pétition"),
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
                        MyApp.PostNewPet.newPet(pet_goal,pet_title,pet_tags,pet_body);
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
                                    required:"required",
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
                                    required:"required",
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
                                    required:"required",
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
                                    required:"required",
                                    id:"new_pet_tags"
                                })
                            ),
                        ]),
                        m("button[type=submit]", {
                            class:'button is-info'
                        },"Poster la pétition")
                    ]
                ),
            ])
        ])
    },
    newPet: function(goal, title, tags, body) {
        var data= {};
        data= {
            'body': body,
            'goal': goal,
            'title': title,
            'tags': tags,
            'access_token': encodeURIComponent(MyApp.Profile.userData.id)
        };
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/petition/create",
            params: data,
        }).then(function(response) {
            MyApp.Homepage.getTopTen();
            m.route.set("/");
        })
        ;
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
        petsCreated:[],
        petsSigned:[],
    },
    view: function(){
        return m('div',[
            m(MyApp.Navbar),
            m('div', {class:'container'},[
                m('div', {class:"row"},[
                    m('figure', {class:"image is-96x96"},
                        m("img", {
                            class:"is-rounded",
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
                    )/* ,
                    m('div', {class:"col-md-2 col-sm-2 col-xs-2"},
                        m("button", {
                            class:"btn btn-info float-right",
                            onclick: function () {
                                MyApp.Profile.getPets();
                            },
                        },"Rafraîchir")
                    ) */]
                ),
                m("div",m(MyApp.PetsTable,{profile: MyApp.Profile, owned: true})),
                m("div",m(MyApp.SignedPetsTable,{profile: MyApp.Profile}))
            ]),
        ]);
    },
    getCreatedPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/created",
            params : {
                'email':MyApp.Profile.userData.email,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            MyApp.Profile.userData.petsCreated=response.items;
            if ('nextPageToken' in response) {
                MyApp.Profile.userData.nextToken= response.nextPageToken;
            } else {
                MyApp.Profile.userData.nextToken="";
            }
        });
    },
    getNextCreatedPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/created",
            params: {
                'email':MyApp.Profile.userData.email,
                'next':MyApp.Profile.userData.nextToken,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            if(response.items != undefined) {
                MyApp.Profile.userData.petsCreated = response.items;
                if ('nextPageToken' in response) {
                    MyApp.Profile.userData.nextToken = response.nextPageToken;
                } else {
                    MyApp.Profile.nextToken = "";
                }
            }
        });
    },
    getSignedPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/signed",
            params : {
                'email':MyApp.Profile.userData.email,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            MyApp.Profile.userData.petsSigned=response.items;
            if ('nextPageToken' in response) {
                MyApp.Profile.userData.nextToken= response.nextPageToken;
            } else {
                MyApp.Profile.userData.nextToken="";
            }
        });
    },
    getNextSignedPets: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/petitions/signed",
            params: {
                'email':MyApp.Profile.userData.email,
                'next':MyApp.Profile.userData.nextToken,
                'access_token': encodeURIComponent(MyApp.Profile.userData.id)
            }
        })
        .then(function(response) {
            if(response.items != undefined) {
                MyApp.Profile.userData.petsSigned = response.items;
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
            MyApp.Profile.getCreatedPets();
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

MyApp.PetsTable = {
    view: function(vnode) {
        return m('div', [
            m('div', {
                class:'subtitle'
            },
                m("h3",vnode.attrs.owned?"Mes pétitions créées":"Pétitions créées par "+vnode.attrs.profile.userData.name)
            ),
            m('table', {
                class:'table is-fullwidth'
            },[
                m('thead', [
                    m('tr', [
                        m('th', "Titre"),
                        m('th', "Description"),
                        m('th', "Votes"),
                        m('th', "Objectif"),
                        m('th', "Date de publication"),
                        m('th', "Tags"),
                        m('th', ""),
                        m('th', ""),
                    ])
                ]),
                (vnode.attrs.profile.userData.petsCreated != undefined)?
                    vnode.attrs.profile.userData.petsCreated.map(function(item) {
                        if (vnode.attrs.owned) {
                            return m('tbody', [
                                    m("tr", [
                                        m('td', m('label', item.properties.title)),
                                        m('td', m('label', item.properties.body)),
                                        m('td', m('label', item.properties.nbVotants)),
                                        m('td', m('label', item.properties.goal)),
                                        m('td', m('label', item.properties.date)),
                                        m('td', m('label', item.properties.tags)),
                                        m("td", m("button", {
                                                "class":"button is-danger",
                                                onclick: function() {
                                                    MyApp.PetsTable.deletePet(item);
                                                },
                                            },
                                            "Supprimer cette pétition")
                                        ),
                                        m("td", m("button", {
                                                "class":"button is-info",
                                                onclick: function() {
                                                    MyApp.Homepage.getSignataires(item.key.name);
                                                },
                                            },
                                            "Lister les signataires")
                                        )
                                    ])
                                ])
                        } else {
                            return m('tbody', [
                                m("tr", [
                                    m('td', m('label', item.properties.title)),
                                    m('td', m('label', item.properties.body)),
                                    m('td', m('label', item.properties.nbVotants)),
                                    m('td', m('label', item.properties.goal)),
                                    m('td', m('label', item.properties.date)),
                                    m('td', m('label', item.properties.tags)),
                                    m("td", m("button", {
                                            "class":"button is-info",
                                            onclick: function () {
                                                MyApp.PetsTable.signPet(item.key.name);
                                            },
                                        },
                                        "Signer cette pétition")
                                    )
                                ])
                            ])
                        }
                    }):
                m("div")
            ]),
            m('button',{
                class: 'button is-info',
                onclick: function(e) {
                    vnode.attrs.profile.getNextCreatedPets();
                }
            }, "Suivant"),
        ]);
    },
    deletePet: function (pet) {
        var data = {
            'id': pet.key.name,
            'access_token': encodeURIComponent(MyApp.Profile.userData.id)
        };
        m.request ({
            method: "POST",
            url: "_ah/api/myApi/v1/petition/delete",
            params: data,
        }).then(function(response) {
            MyApp.Profile.getCreatedPets();
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
            MyApp.User.getCreatedPets();
            m.redraw();
        });
	}
};

MyApp.SignedPetsTable = {
    view: function(vnode) {
        return m('div', [
            m('div', {
                class:'subtitle'
            },
                m("h3","Mes pétitions signées")
            ),
            m('table', {
                class:'table is-fullwidth'
            },[
                m('thead', [
                    m('tr', [
                        m('th', "Titre"),
                        m('th', "Description"),
                        m('th', "Votes"),
                        m('th', "Objectif"),
                        m('th', "Date de publication"),
                        m('th', "Tags"),
                        m('th', ""),
                        m('th', ""),
                    ])
                ]),
                (vnode.attrs.profile.userData.petsSigned != undefined)?
                    vnode.attrs.profile.userData.petsSigned.map(function(item) {
                        return m('tbody', [
                            m("tr", [
                                m('td', m('label', item.properties.title)),
                                m('td', m('label', item.properties.body)),
                                m('td', m('label', item.properties.nbVotants)),
                                m('td', m('label', item.properties.goal)),
                                m('td', m('label', item.properties.date)),
                                m('td', m('label', item.properties.tags)),
                                m("td", m("button", {
                                        "class":"button is-warning",
                                        onclick: function () {
                                            MyApp.SignedPetsTable.signPet(item.key.name);
                                        },
                                    },
                                    "Annuler ma signature")
                                ),
                                m("td", m("button", {
                                        "class":"button is-info",
                                        onclick: function () {
                                            MyApp.Homepage.getSignataires(item.key.name);
                                        },
                                    },
                                    "Liste des signataires")
                                )
                            ])
                        ])
                    }):
                m("div")
            ]),
            m('button',{
                class: 'button is-info',
                onclick: function(e) {
                    vnode.attrs.profile.getNextSignedPets();
                }
            }, "Suivant"),
        ]);
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
            MyApp.User.getSignedPets();
            m.redraw();
        });
	}
};

MyApp.NotLogged = {
    view: function() {
        return m('div',[
            m(MyApp.Navbar),
            m('div.container',[
                m("h1.title", 'Merci de vous connecter avec Google afin d\'accéder à cette page.'),
            ])
        ]);
    }
};