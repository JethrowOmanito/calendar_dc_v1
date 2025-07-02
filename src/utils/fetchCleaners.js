import supabase from "../helper/supabaseClient";

/**
 * Fetch cleaners assigned to a specific service.
 * @param {string} service - The service to filter cleaners by.
 * @param {object} user - The logged-in user object (to check privilege and Teams).
 * @returns {Array} - An array of cleaner objects with `id`, `username`, and `displayName`.
 */
export const fetchCleanersByService = async (service, user) => {
  if (!service) {
    console.warn("No service provided to fetchCleanersByService.");
    return [];
  }
  if (!user) {
    console.warn("No user provided to fetchCleanersByService.");
    return [];
  }

  try {
    // Fetch all team leaders (privilege 2) assigned to the service
    const { data: teamLeaders, error: teamLeadersError } = await supabase
      .from("user")
      .select("id, username, service_assigned, role, privilege")
      .contains("service_assigned", [service])
      .eq("role", "cleaner")
      .eq("privilege", 2);

    if (teamLeadersError) {
      console.error("Error fetching team leaders:", teamLeadersError);
      return [];
    }

    // Fetch all team members (privilege 1) assigned to the service
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("user")
      .select("id, username, service_assigned, role, privilege")
      .contains("service_assigned", [service])
      .eq("role", "cleaner")
      .eq("privilege", 1);

    if (teamMembersError) {
      console.error("Error fetching team members:", teamMembersError);
      return [];
    }

    // Add displayName for UI, keep username clean for DB
    const teamLeadersWithLabel = (teamLeaders || []).map(cleaner => ({
      ...cleaner,
      displayName: `${cleaner.username} - Team Leader`
    }));

    const teamMembersWithLabel = (teamMembers || []).map(cleaner => ({
      ...cleaner,
      displayName: `${cleaner.username} - Staff`
    }));

    // Combine and return
    return [...teamLeadersWithLabel, ...teamMembersWithLabel];
  } catch (err) {
    console.error("Unexpected error fetching cleaners:", err);
    return [];
  }
};