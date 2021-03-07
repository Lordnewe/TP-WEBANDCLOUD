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

@WebServlet(name = "PetServlet", urlPatterns = { "/petitions" })
public class PetitionServlet extends HttpServlet {

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");

		Random r = new Random();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		// Création des pétitions
		for (int i = 0; i < 50; i++) {
			for (int j = 0; j < 10; j++) {
				Entity e = new Entity("PU", "P" + i + "_" + "U"+j);
				e.setProperty("firstName", "My name is" + j);
				e.setProperty("body", "Vote for my "+i+","+j);
				datastore.put(e);
				response.getWriter().print("<li> created post:" + e.getKey() + "<br>");
			}
		}
	}
}