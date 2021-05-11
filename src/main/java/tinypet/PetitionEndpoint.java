package tinypet;

import java.util.List;
import java.util.Date;
import java.util.ArrayList;
import java.sql.Timestamp;
import java.util.Arrays;
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
import com.google.appengine.api.datastore.KeyFactory;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.QueryResultList;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;

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
		@SuppressWarnings("unchecked")
		
		ArrayList<String> tags = new ArrayList<String>();
		tags.addAll(Arrays.asList(pet.tags.split(",")));
		
		ArrayList<String> votants = new ArrayList<String>();
		votants.add(" ");

		Date dateAjd = new Date();

		Entity e = new Entity("Petition", new Timestamp(dateAjd.getTime())+":"+user.getEmail());
		e.setProperty("owner", user.getEmail());
		e.setProperty("title", pet.title);
		e.setProperty("goal", pet.goal);
		e.setProperty("body", pet.body);
		e.setProperty("tags", tags);
		e.setProperty("votants", votants);
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
	 * @param cursorString
	 * @return
	 */
	@ApiMethod(name = "getCreatedPetitions", path = "petitions/created", httpMethod = ApiMethod.HttpMethod.GET)
	public CollectionResponse<Entity> getCreatedPetitions(User user, 
			@Nullable @Named("email") String email, @Nullable @Named("next") String cursorString) throws Exception{
		
        if (user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}

		Query petQuery = new Query("Petition").setFilter(new FilterPredicate("owner", FilterOperator.EQUAL, email));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery preparedPetQuery = datastore.prepare(petQuery);

		FetchOptions fetchOptions = FetchOptions.Builder.withLimit(5);

		if (cursorString != null) {
			fetchOptions.startCursor(Cursor.fromWebSafeString(cursorString));
		}

		QueryResultList<Entity> results = preparedPetQuery.asQueryResultList(fetchOptions);
		cursorString = results.getCursor().toWebSafeString();

		return CollectionResponse.<Entity>builder().setItems(results).setNextPageToken(cursorString).build();
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
	 * @param cursorString
	 * @return
	 */
	@ApiMethod(name = "getSignedPetitions", path = "petitions/signed", httpMethod = ApiMethod.HttpMethod.GET)
	public CollectionResponse<Entity> getSignedPetitions(User user, 
			@Named("email") String email, @Nullable @Named("next") String cursorString) throws Exception{
		
        if(user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}
		
		Query petQuery = new Query("Petition").setFilter(new FilterPredicate("votants", FilterOperator.EQUAL, email));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery preparedPetQuery = datastore.prepare(petQuery);

		FetchOptions fetchOptions = FetchOptions.Builder.withLimit(5);

		if (cursorString != null) {
			fetchOptions.startCursor(Cursor.fromWebSafeString(cursorString));
		}

		QueryResultList<Entity> results = preparedPetQuery.asQueryResultList(fetchOptions);
		cursorString = results.getCursor().toWebSafeString();

		return CollectionResponse.<Entity>builder().setItems(results).setNextPageToken(cursorString).build();
	}

    /**
	 * Return the petitions signed by a user
	 * @param tag
	 * @return
	 */
	@ApiMethod(name = "getPetitionsWithTagOrTitle", path = "petitions/searchByTagOrTitle", httpMethod = ApiMethod.HttpMethod.GET)
	public CollectionResponse<Entity> getPetitionsWithTagOrTitle(User user, @Named("search") String search, @Nullable @Named("next") String cursorString) throws Exception{

        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }

		Query q = new Query("Petition").setFilter(
			new CompositeFilter(CompositeFilterOperator.OR, Arrays.asList(
				new FilterPredicate("title", FilterOperator.EQUAL, search),
				new FilterPredicate("tags", FilterOperator.EQUAL, search)
		)));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        PreparedQuery preparedSearchQuery = datastore.prepare(q);
        FetchOptions fetchOptions = FetchOptions.Builder.withLimit(10);

		if (cursorString != null) {
            fetchOptions.startCursor(Cursor.fromWebSafeString(cursorString));
            QueryResultList<Entity> results = preparedSearchQuery.asQueryResultList(fetchOptions);
            cursorString = results.getCursor().toWebSafeString();

            return CollectionResponse.<Entity>builder().setItems(results).setNextPageToken(cursorString).build();
		} else {
            return CollectionResponse.<Entity>builder().setItems(preparedSearchQuery.asQueryResultList(fetchOptions)).build();
        }
	}

	/**
	 * Delete a petition
	 * @param user
	 * @param pet
	 * @return
	 */
	@ApiMethod(name = "deletePet", path = "petition/delete", httpMethod = HttpMethod.POST)
	public Entity deletePet(User user, Petition pet) throws UnauthorizedException {

		if (user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Transaction deletePetTransaction = datastore.beginTransaction();
		Key petKey = KeyFactory.createKey("Petition", pet.getId());

		datastore.delete(petKey);
		deletePetTransaction.commit();

		return null;
	}
}