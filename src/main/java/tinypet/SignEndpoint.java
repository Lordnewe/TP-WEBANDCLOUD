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
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.EntityNotFoundException;
import java.util.ArrayList;

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

public class SignEndpoint {
	
	/**
	 * Sign a petition
	 * @param user
	 * @param petition
	 * @return
	 */
	@ApiMethod(name = "signPet", path = "petition/sign", httpMethod = HttpMethod.POST)
	public Entity signPet(User user, Sign sign) throws Exception{ 
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		//verify the credentials
		if(user == null) { 
			throw new UnauthorizedException("Invalid credentials");
		}

		Query signQuery = new Query("Sign")
				.setFilter(CompositeFilterOperator.and(
					new FilterPredicate("Email", FilterOperator.EQUAL, user.getEmail()),
					new FilterPredicate("Petition", FilterOperator.EQUAL, sign.getSignedPet())
					)
				);

		PreparedQuery preparedSignQuery = datastore.prepare(signQuery.setKeysOnly());

		Entity signQueryResult = preparedSignQuery.asSingleEntity();

		if (signQueryResult == null) {
			Entity e = new Entity("Sign");
			e.setProperty("Email", user.getEmail());
			e.setProperty("Petition", sign.getSignedPet());

			Transaction signInsertTransaction = datastore.beginTransaction();
			datastore.put(e);
			signInsertTransaction.commit();
			Entity pet;
			try {
				Transaction petAddSignTransaction = datastore.beginTransaction();
				pet = datastore.get(KeyFactory.createKey("Petition", sign.getSignedPet()));
				pet.setProperty("nbVotants", (Long) pet.getProperty("nbVotants")+1);
				@SuppressWarnings("unchecked")
				ArrayList<String> votants = (ArrayList<String>) pet.getProperty("votants");
				votants.add(user.getEmail());
				pet.setProperty("votants", votants);
				datastore.put(pet);
				petAddSignTransaction.commit();
				return pet;
			} catch (EntityNotFoundException e1) {
				// If the entity is not found we just log the error
				e1.printStackTrace();
				return e;
			}
		} else {
			datastore.delete(signQueryResult.getKey());
			Entity pet;
			try {
				Transaction petRemoveSignTransaction = datastore.beginTransaction();
				pet = datastore.get(KeyFactory.createKey("Petition", sign.getSignedPet()));
				if((Long)pet.getProperty("nbVotants")!=0) pet.setProperty("nbVotants", (Long)pet.getProperty("nbVotants")-1);
				
				ArrayList<String> votants = (ArrayList<String>) pet.getProperty("votants");
				votants.remove(user.getEmail());
				pet.setProperty("votants", votants);
				datastore.put(pet);
				petRemoveSignTransaction.commit();
				return pet;
			} catch (EntityNotFoundException e1) {
				// If the entity is not found we just log the error
				e1.printStackTrace();
				return null;
			}
		}
	}
}