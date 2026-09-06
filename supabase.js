// Supabase Client Initialization
const SUPABASE_URL = 'https://arvjvwgffcqhyoyfmbry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydmp2d2dmZmNxaHlveWZtYnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDA4MTYsImV4cCI6MjEwNDI3NjgxNn0.sPp_0oD4iqHP7ifZGcrW3XPtFrjWBN0NHTlH41UxoSY';

// Initialize the Supabase client using the global supabase object from the CDN script
let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase SDK not loaded yet.');
}
