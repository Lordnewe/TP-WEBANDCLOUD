package tinypet;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;

public class Petition {

	private String keyString;
	private Key owner;
	private Date date;
	private String body;
	private String bucketName;
	private String objectName;
	
	public Petition() {}

	public String getKeyString() {
		return this.keyString;
	}
	
	public void setKeyString(String keyString) {
		this.keyString = keyString;
	}

	public Key getOwner() {
		return this.owner;
	}
	
	public void setOwner(Key owner) {
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
	
	public String getBucketName() {
		return bucketName;
	}

	public void setBucketName(String bucketName) {
		this.bucketName = bucketName;
	}

	public String getObjectName() {
		return objectName;
	}

	public void setObjectName(String objectName) {
		this.objectName = objectName;
	}

	public void generateKey() {
		Date date = new Date();
		//this.date = date;
		Long timestamp = Long.MAX_VALUE-(date.getTime());
		keyString =  timestamp +":" + owner;
	}
	
	public Entity toEntity() {
		Entity e = new Entity("Petition", keyString);
		e.setProperty("owner", owner);
		e.setProperty("date", date);
		e.setProperty("body", body);
		return e;
	}
	
	public List<Entity> createSignCounter(Key petKey) {
		List<Entity> signCounter = new ArrayList<>();
		Entity counter;
		String counterId;
		for(int i = 1 ; i <= 25 ; ++i) {
			counterId = "" + i + petKey;
			counter = new Entity("signNumber", counterId, petKey);
			counter.setProperty("number", 0);
			counter.setProperty("petKey", petKey);
			signCounter.add(counter);
		}
		return signCounter;
	}
}
