package tinypet;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.response.NotFoundException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.EmbeddedEntity;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;

public class Utilitary {
	static final String clientId = "368951663363-jo5dp0r3mj44il3lgju55fvnn5p6j1qc.apps.googleusercontent.com";
	static final String audiences = "368951663363-jo5dp0r3mj44il3lgju55fvnn5p6j1qc.apps.googleusercontent.com";
	public static final int NUMBER_SIGN_COUNTER = 25;
	
	public static boolean userIsRegistered(User user) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		String mail = user.getEmail();
		//test if user is already registered
		Query q = new Query("User").setFilter(new FilterPredicate("email", FilterOperator.EQUAL, mail));
		PreparedQuery pq = datastore.prepare(q);
		Entity result = pq.asSingleEntity();
		if(result != null) {
			boolean isActive = (boolean) result.getProperty("active");
			return isActive;
		}
		else {
			return false;
		}
	}
	
	public static Key getUserKey(User user) throws Exception{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		String mail = user.getEmail(); 
		Query q = new Query("User").setFilter(new FilterPredicate("email", FilterOperator.EQUAL, mail)).setKeysOnly();
		PreparedQuery pq = datastore.prepare(q);
		Entity result = pq.asSingleEntity();
		if(result == null) {
			throw new Exception("User unregistered");
		}
		return result.getKey();
	}
	
	public static Key getProfileKey(String profileName) throws Exception{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("User").setFilter(new FilterPredicate("profileName", FilterOperator.EQUAL, profileName)).setKeysOnly();
		PreparedQuery pq = datastore.prepare(q);
		Entity result = pq.asSingleEntity();
		if(result == null) {
			throw new NotFoundException("Inexistant profile");
		}
		return result.getKey();
	}
	
	public static EmbeddedEntity getEmbeddedProfile(Key profileKey) throws Exception{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("User").setFilter(new FilterPredicate("__key__", FilterOperator.EQUAL, profileKey));
		PreparedQuery pq = datastore.prepare(q);
		Entity e =  pq.asSingleEntity();
		if(e != null) {
			EmbeddedEntity result = new EmbeddedEntity();
			result.setProperty("name", e.getProperty("name"));
			result.setProperty("key", profileKey);
			return result;
		}
		else {
			throw new NotFoundException("Inexistant profile");
		}
	}
}
