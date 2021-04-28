package tinypet;

import java.util.ArrayList;

public class Petition {
	public String title;
	public String owner;
	public String body;
	public Integer goal;
	public Integer nbVotants;
	public String name;
	public ArrayList<String> tags;
	public ArrayList<String> votants;
	public String id;

	public Petition() {}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
}
