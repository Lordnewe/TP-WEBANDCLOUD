package foo;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Month;
import java.util.Date;
import java.util.HashSet;
import java.util.Random;
import  java.util.concurrent.ThreadLocalRandom;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

@WebServlet(name = "PrefixServlet", urlPatterns = { "/prefix" })
public class PrefixServlet extends HttpServlet {

	static Random r = new Random();

	
	public LocalDate between(LocalDate startInclusive, LocalDate endExclusive) {
	    long startEpochDay = startInclusive.toEpochDay();
	    long endEpochDay = endExclusive.toEpochDay();
	    long randomDay = ThreadLocalRandom
	    	      .current()
	    	      .nextLong(startEpochDay, endEpochDay);
	    return LocalDate.ofEpochDay(randomDay);
	}
	
	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		
		LocalDate start = LocalDate.of(2019, Month.OCTOBER, 14);
		LocalDate end = LocalDate.now();

		
		
		// Create posts
		for (int i = 0; i < 100; i++) {
			for (int j=0;j<10;j++) {
				LocalDate rdate = this.between(start, end);
				Entity e = new Entity("Post", "f" +i+":"+rdate.toString());
				e.setProperty("body", "blabla" + rdate.toString());
				e.setProperty("url", "https://dummyimage.com/320x200/000/fff.jpg&text="+rdate.toString());
				e.setProperty("owner", "f" + i);
				e.setProperty("date",new Date());

				// Create user friends
				HashSet<String> toset = new HashSet<String>();
				while (toset.size() < 5) {
					toset.add("f" + r.nextInt(100));
				}
				e.setProperty("to", toset);

				HashSet<String> like = new HashSet<String>();
				while (like.size() < 5) {
					like.add("f" + r.nextInt(100));
				}
				e.setProperty("like", like);
				e.setProperty("likec",like.size());
				
				datastore.put(e);
				response.getWriter().print("<li> created post:" + e.getKey() + "<br>" + toset + "<br>");
			}

		}
	}
}