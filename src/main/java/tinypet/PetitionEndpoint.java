package tinypet;

import java.util.List;
import java.util.Date;
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
import com.google.appengine.api.datastore.Transaction;
import com.google.api.server.spi.config.Nullable;

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
	public Entity postNewPet(User user, Petition pet) throws Exception{ 
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		//verify the credentials
		if(user == null) { 
			throw new UnauthorizedException("Invalid credentials");
		}

		Entity e = new Entity("Petition", Long.MAX_VALUE-(new Date()).getTime()+":"+user.getEmail());
		e.setProperty("owner", user.getEmail());
		e.setProperty("title", pet.title);
		e.setProperty("goal", pet.goal);
		e.setProperty("body", pet.body);
		e.setProperty("tags", pet.tags);
		e.setProperty("votants", pet.votants);
		e.setProperty("nbVotants", 0);
		e.setProperty("date", new Date());

		Transaction transaction = datastore.beginTransaction();
		datastore.put(e);
		transaction.commit();
		return e;
	}

    /**
	 * Return the petitions created by a user
	 * @param user
	 * @param email
	 * @return
	 */
	@ApiMethod(name = "getCreatedPetitions", path = "petitions/created", httpMethod = ApiMethod.HttpMethod.GET)
	public List<Entity> getCreatedPetitions(User user, 
			@Nullable @Named("email") String email) throws Exception{
		
        if(user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}
		
		Query q = new Query("Petition").setFilter(new FilterPredicate("owner", FilterOperator.EQUAL, user.getEmail()));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));
		return result;
	}

	/**
	 * Return the top ten signed petitions
	 * @return
	 */
	@ApiMethod(name = "topTen", path = "petitions/topTen", httpMethod = ApiMethod.HttpMethod.GET)
	public List<Entity> topTen() throws Exception{
		Query q = new Query("Petition").addSort("nbVotants", SortDirection.DESCENDING);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));

		return result;
	}

    /**
	 * Return the petitions signed by a user
	 * @param user
	 * @param userId
	 * @return
	 */
	@ApiMethod(name = "getSignedPetitions", path = "petitions/signed/{userId}", httpMethod = ApiMethod.HttpMethod.GET)
	public List<Entity> getSignedPetitions(User user, 
			@Named("votants") String votant) throws Exception{
		
        if(user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}
		
		Query q = new Query("Petition").setFilter(new FilterPredicate("votants", FilterOperator.EQUAL, votant));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));
		return result;
	}

    /**
	 * Return the petitions signed by a user
	 * @param tag
	 * @return
	 */
	@ApiMethod(name = "getPetitionsWithTag", path = "petitions/tagged/{tag}", httpMethod = ApiMethod.HttpMethod.GET)
	public List<Entity> getPetitionsWithTag(@Named("tags") String tag) throws Exception{
		Query q = new Query("Petition").setFilter(new FilterPredicate("tags", FilterOperator.EQUAL, tag));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> result = pq.asList(FetchOptions.Builder.withLimit(10));
		return result;
	}
}