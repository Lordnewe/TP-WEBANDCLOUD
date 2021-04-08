package foo;

import java.io.IOException;
import java.sql.Time;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
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
		for (int i = 0; i < 500; i++) {
			Date date = new Date();
				
				try {
					 date = new SimpleDateFormat("dd/mm/yyyy").parse(getDate());
				} catch (ParseException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				date = new Timestamp(date.getTime());
												
				Entity p = new Entity("Petition", new Timestamp(date.getTime()) + "P" + i);
				p.setProperty("owner", "U" + getRandomNumber(0,2000));
				p.setProperty("date", new Date());
				p.setProperty("body", "Please vote for my Petition, pretty please <3 " + i);
				
				
				
				ArrayList<String> arrayTags = new ArrayList<String>();
				
				do {
					arrayTags.add("#TAG"+ getRandomNumber(0,50));
				}while(arrayTags.size() < 50);
				p.setProperty("tags", arrayTags.get(getRandomNumber(0,50)));
				
				p.setProperty("goal", getRandomNumber(1000, 100000) );
				
				
				ArrayList<String> arrayVotants = new ArrayList<String>();
				do {
					arrayVotants.add("U"+ getRandomNumber(0,2000));
				}while(arrayVotants.size() < 2000);
				
				p.setProperty("votants",arrayVotants.get(getRandomNumber(0,2000)));
				
				
				datastore.put(p);
				response.getWriter().print("<li> created post:" + p.getKey() + "<br>");
			
		}
	}
	
	public int getRandomNumber(int min, int max) {
	    return (int) ((Math.random() * (max - min)) + min);
	}
	
	public String getDate() {
		int day = 0, month = 0, year = 0;
		
		day = 1 + (int)(Math.random() * ((30 - 1) + 1));
		
		month = 1 + (int)(Math.random() * ((12 - 1) + 1));
		
		year = 2019 + (int)(Math.random() * ((2021 - 2019) + 1));
			
		return day+"/"+month+"/"+year;
	}
	
	
}