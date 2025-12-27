
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rqbtntzqqkekdzvfilos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYnRudHpxcWtla2R6dmZpbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDEwMjUsImV4cCI6MjA4MDA3NzAyNX0.iKeTABH2Q_s9BjpMmigroSa0jjM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    // AGENT NOTE: I do not have valid credentials. 
    // PLEASE LOG IN MANUALLY IN THE BROWSER.
    // The previous credentials here were invalid/stale.
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'USER_MUST_LOG_IN_MANUALLY',
        password: 'USER_MUST_LOG_IN_MANUALLY'
    });

    if (error) {
        console.error('Login failed:', error.message);
    } else {
        console.log('Login successful!');
        console.log('User ID:', data.user.id);
    }
}

testLogin();
