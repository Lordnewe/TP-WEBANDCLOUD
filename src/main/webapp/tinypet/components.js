//Navbar
var Navbar = {
    view : function(){
        return m("nav", {class: "navbar is-fixed-top is-primary"}, [
            m("div", {class: "navbar-brand"}, [
                m(m.route.Link, {href: "/", class: "navbar-item"}, [
					m("p","test")
				])
            ])
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