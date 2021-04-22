package tinypet;

import java.util.ArrayList;
import java.util.List;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;

public class User {
	private String email;
	private String name;
	private String bucketName;
	private String objectName;
	
	public User() {}
	
	public User(String email) {
		this.email = email;
		this.name = generateProfileName(email);
	}

	public String getEmail() {
		return email;
	}

	public String getName() {
		return name;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}

	public void setName(String name) {
		this.name = name;
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

	public String generateProfileName(String email) {
		return email.split("@")[0].replaceAll("\\.", "");
	}
	
	public Entity createEntity() {
		Entity e = new Entity("person", email);
		e.setProperty("profileName", generateProfileName(email));
		e.setProperty("email", email);
		e.setProperty("name", name);
		if(objectName != null && bucketName != null) {
			e.setProperty("objectName", objectName);
			e.setProperty("bucketName", bucketName);
		}
		return e;
	}

	public Entity toEntity() {
		Entity e = new Entity("person", email);
		e.setProperty("profileName", generateProfileName(email));
		e.setProperty("email", email);
		e.setProperty("name", name);
		return e;
	}
		
	public Entity toEntity(Key key) {
		Entity e = new Entity("person", key);
		e.setProperty("profileName", generateProfileName(email));
		e.setProperty("email", email);
		e.setProperty("name", name);
		return e;
	}
	
	public String toString() {
		return "User[" + email + ", " + name + "]";
	}
}
