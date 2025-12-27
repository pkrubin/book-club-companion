
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rqbtntzqqkekdzvfilos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYnRudHpxcWtla2R6dmZpbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDEwMjUsImV4cCI6MjA4MDA3NzAyNX0.iKeTABH2Q_s9BjpMmigroSa0fqeyW8DDcmXRwDO0jjM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking database connection...');
    const { data, error, count } = await supabase
        .from('book_club_list')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error connecting to Supabase:', error);
    } else {
        console.log(`Successfully connected. Row count in 'book_club_list': ${count}`);
    }
}

checkData();
