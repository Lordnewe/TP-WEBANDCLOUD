package tinypet;

import java.util.Date;
import com.google.appengine.api.datastore.Entity;

public class Petition {

	private String keyString;
	private String owner;
	private Date date;
	private String body;
	
	public Petition() {}

	public String getKeyString() {
		return this.keyString;
	}
	
	public void setKeyString(String keyString) {
		this.keyString = keyString;
	}

	public String getOwner() {
		return this.owner;
	}
	
	public void setOwner(String owner) {
		this.owner = owner;
	}

	public Date getDate() {
		return this.date;
	}
	
	public void setDate(Date date) {
		this.date = date;
	}

	public String getBody() {
		return this.body;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
	
	public Entity toEntity() {
		Entity e = new Entity("Petition", keyString);
		e.setProperty("owner", owner);
		e.setProperty("date", date);
		e.setProperty("body", body);
		return e;
	}
}
