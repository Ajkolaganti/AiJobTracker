import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://senzdnlswpzjwjzthbso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbnpkbmxzd3B6andqenRoYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzOTU0NTcsImV4cCI6MjA0NDk3MTQ1N30.7WLnqUfBnpe4jd8SsjwdNoZpiI_onfD0OWESIg1uk5Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);