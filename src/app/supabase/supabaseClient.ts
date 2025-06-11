import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkxtzjreqbylbmdcrnqp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreHR6anJlcWJ5bGJtZGNybnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTc3NjYsImV4cCI6MjA2NDk5Mzc2Nn0.tn2sfVb6Tc7GAp4CTdjxua43HU1bSW2IGEYMVybh0ws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
