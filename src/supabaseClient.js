import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ugixpwumwgmeiwmuztqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXhwd3Vtd2dtZWl3bXV6dHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE0MTE4MjYsImV4cCI6MjAwNjk4NzgyNn0.IGM5Z29xyShU-6eUZ3WjRex_T5mcr9vs8o8prJtONJ8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
