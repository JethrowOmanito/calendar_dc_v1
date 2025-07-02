import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://agyzvknaqnamaoczxgsb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneXp2a25hcW5hbWFvY3p4Z3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTcxMTcsImV4cCI6MjA1OTA3MzExN30.0IO8f3aOzuldSUdjIgg88mzsK2zurrms3jx1KO9WJ9Y";

const supabase = createClient(supabaseUrl, SUPABASE_ANON_KEY);
export default supabase;