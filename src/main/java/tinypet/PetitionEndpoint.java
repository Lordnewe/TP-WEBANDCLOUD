package tinypet;

import java.util.List;
import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.EmbeddedEntity;

@Api(name = "myApi",
     version = "v1",
     audiences = "368951663363-jo5dp0r3mj44il3lgju55fvnn5p6j1qc.apps.googleusercontent.com",
  	 clientIds = "368951663363-jo5dp0r3mj44il3lgju55fvnn5p6j1qc.apps.googleusercontent.com",
     namespace =
     @ApiNamespace(
		   ownerDomain = "helloworld.example.com",
		   ownerName = "helloworld.example.com",
		   packagePath = "")
     )

public class PetitionEndpoint {
	
	/**
	 * Add new Petition
	 * @param user
	 * @param petition
	 * @return
	 */
	@ApiMethod(name = "postNewPet", path = "petition/create", httpMethod = HttpMethod.POST)
	public Entity postNewPet(User user, Petition petition) throws Exception{ 
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		//verify the credentials
		if(user == null) { 
			throw new UnauthorizedException("Invalid credentials");
		}

		Key userKey = Utilitary.getUserKey(user);
		petition.setOwner(userKey);
		petition.generateKey();
		Entity petEntity = petition.toEntity();
		List<Entity> signCounters = petition.createSignCounter(petEntity.getKey());
		datastore.put(petEntity);
		datastore.put(signCounters);
		EmbeddedEntity owner = Utilitary.getEmbeddedProfile(userKey);
		petEntity.setProperty("owner", owner);
		//changeNumberPosts(userKey, 1);
		return petEntity;
	}

    /**
	 * Return the petitions created by a user
	 * @param user
	 * @param cursorString
	 * @return
	 */
	@ApiMethod(name = "getCreatedPetitions", path = "petitions/created/{userId}", httpMethod = ApiMethod.HttpMethod.GET)
	public List<Entity> getCreatedPetitions(User user, 
			@Named("userId") String userId) throws Exception{
		
        if(user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}
		
		Query q = new Query("Petition").setFilter(new FilterPredicate("owner", FilterOperator.EQUAL, user.getEmail()));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));
		return result;
	}
	
	@ApiMethod(name = "topTen", httpMethod = HttpMethod.GET)
	public List<Entity> topTen() {
		Query q = new Query("Petition").addSort("nbVotants", SortDirection.DESCENDING);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));

		return result;
	}
	
	@ApiMethod(name = "signedPetitions", httpMethod = HttpMethod.GET)
	public List<Entity> signedPetitions(@Named("votants") String votant) {
		Query q = new Query("Petition").setFilter(new FilterPredicate("votants", FilterOperator.EQUAL, votant));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));
		return result;
	}
	
	@ApiMethod(name = "petitionsTag", httpMethod = HttpMethod.GET)
	public List<Entity> petitionsTag(@Named("tags") String tag) {
		Query q = new Query("Petition").setFilter(new FilterPredicate("tags", FilterOperator.EQUAL, tag));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));
		return result;
	}
}