package foo;

import java.io.IOException;
import java.util.Random;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

@WebServlet(name = "UserServlet", urlPatterns = { "/user" })
public class UserServlet extends HttpServlet {

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");

		Random r = new Random();
		
		response.getWriter().print("<h1>Liste des utilisateurs créés</h1><br>");

		// Create users
		for (int i = 0; i < 500; i++) {
			Entity e = new Entity("User", "u" + i);
			e.setProperty("firstName", "first" + i);
			e.setProperty("lastName", "last" + i);
			e.setProperty("age", r.nextInt(100) + 1);

			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			datastore.put(e);

			response.getWriter().print(e.getKey() + "<br>");

		}
	}
}