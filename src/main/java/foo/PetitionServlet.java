package foo;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

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

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		// Création des pétitions
		for (int i = 0; i < 50; i++) {
			for (int j = 0; j < 10; j++) {

				Entity p = new Entity("Petition", new SimpleDateFormat("s-m-H") + "U" + j); // ligne à modifier pour saler les clés
				p.setProperty("owner", "U" + j);
				p.setProperty("date", new Date());
				p.setProperty("body", "Please vote for my P" + i);
				p.setProperty("tag", "#marredezoom");
				p.setProperty("goal", getRandomNumber(1000, 100000) );
				
				datastore.put(p);
				response.getWriter().print("<li> created post:" + p.getKey() + "<br>");
			}
		}
	}
	
	public int getRandomNumber(int min, int max) {
	    return (int) ((Math.random() * (max - min)) + min);
	}
	
}