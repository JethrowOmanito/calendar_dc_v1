import supabase from "../helper/supabaseClient";

export const loginUser = async (username, password) => {
  try {
    console.log("Username:", username);
    console.log("Password:", password);

    // Test the Supabase client
    const testConnection = async () => {
      const { data, error } = await supabase.from("user").select("*");
      console.log("Test Connection Result:", { data, error });
    };

    testConnection();

    // Query the "user" table in Supabase for the given username
    const { data: users, error } = await supabase
      .from("user")
      .select("*")
      .eq("username", username);

    console.log("Supabase Query Result:", { users, error });

    if (error) {
      console.error("Supabase Query Error:", error);
      return { success: false, error: "Error querying the database. Please try again." };
    }

    if (users && users.length > 0) {
      const userData = users[0]; // Get the first matching user

      // Ensure username and password are not null
      if (!userData.username || !userData.password) {
        return { success: false, error: "Invalid user data in the database." };
      }

      // Compare the provided password with the stored password
      if (userData.password === password) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, error: "Invalid password" };
      }
    } else {
      return { success: false, error: "No user found with that username" };
    }
  } catch (err) {
    console.error("Login Error:", err);
    return { success: false, error: "Error logging in. Please try again." };
  }
};