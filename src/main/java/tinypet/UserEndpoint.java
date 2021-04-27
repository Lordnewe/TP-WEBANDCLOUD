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
import com.google.appengine.api.datastore.Transaction;

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

public class UserEndpoint {
	
	/**
	 * Create user
	 * @param user
	 * @param petition
	 * @return
	 */
	@ApiMethod(name = "createNewUser", path = "user/create", httpMethod = HttpMethod.POST)
	public Entity createNewUser(User user, PetUser petUser) throws Exception{ 
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		//verify the credentials
		if(user == null) { 
			throw new UnauthorizedException("Invalid credentials");
		}

		Query searchQuery = new Query("User").setFilter(
	    		new FilterPredicate("email", FilterOperator.EQUAL, petUser.email));

	    PreparedQuery preparedSearchQuery = datastore.prepare(searchQuery);

		Entity searchQueryResult = preparedSearchQuery.asSingleEntity();

		if(searchQueryResult == null) {
			Entity newUser = new Entity("User");
			newUser.setProperty("email", petUser.email);
			newUser.setProperty("name", petUser.name);
			newUser.setProperty("invertedName", petUser.invertedName);
			newUser.setProperty("firstName", petUser.firstName);
			newUser.setProperty("lastName", petUser.lastName);
			newUser.setProperty("url", petUser.url);

			Transaction newTinyUserTransaction = datastore.beginTransaction();
			datastore.put(newUser);
			newTinyUserTransaction.commit();
			return newUser;
		}
		return searchQueryResult;
	}
}