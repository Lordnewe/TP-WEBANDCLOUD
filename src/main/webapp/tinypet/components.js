//Navbar
var Navbar = {
    oncreate : function(){
		gapiRender("google-login");
	},
    view : function(){
        function login(){
            controller.login();
        }
        function register(){
            controller.register();
        }
        return m("nav", {class: "navbar is-fixed-top is-primary"}, [
            m("div", {class: "navbar-brand"}, [
                m(m.route.Link, {href: "/", class: "navbar-item"}, [
					m("p","TinyPet")
				])
            ]),
            m("div", {class:"navbar-menu"}, [
                m("div", {class:"navbar-start"}, [
                    
                ]),
                m("div", {class:"navbar-end"}, [
                    m("div", {class:"navbar-item"}, [
                        m("p","Nom de l'utilisateur connecté")
                    ]),
                    m("div", {class:"navbar-item"}, [
                        m("div", {class:"buttons"}, [
                            m("span", {onclick: login, class: "button is-light", id: "google-login"}, [
                                m("p","Se connecter")
                            ]),
                            m("span", {onclick: register, class: "button is-info", id: "google-register"}, [
                                m("p","S'inscrire")
                            ])
                        ])
                    ])
                ])
            ]),
        ])
    }
    
}

/*******************
Pages's component
*******************/

var Home = {
    view : function(){
        return [m(Navbar)]
    }
}