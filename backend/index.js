const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ugixpwumwgmeiwmuztqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXhwd3Vtd2dtZWl3bXV6dHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE0MTE4MjYsImV4cCI6MjAwNjk4NzgyNn0.IGM5Z29xyShU-6eUZ3WjRex_T5mcr9vs8o8prJtONJ8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    persistSession: false
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Tombstone Reminder Backend');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/save-tombstone-name', async (req, res) => {
    const { name, userId } = req.body;

    if (!name || !userId) {
        return res.status(400).send({ error: 'Name and User ID are required.' });
    }

    const { data, error } = await supabase
        .from('Tombs')
        .insert([{ tomb_name: name, user_id: userId }]);
    console.log("Inserted data:", data);
    console.log("Insertion error:", error);
    console.log("Supabase returned data:", data);

    if (error) {
        return res.status(500).send({ message: 'Error inserting data.', error });
    } else if (data && data.length > 0) {
        return res.send({ message: 'Name saved successfully.', tomb: data[0] });
    } else {
        console.error("Unexpected scenario: No data or error returned from Supabase");
        return res.status(500).send({ message: 'Unexpected error: No data or error returned from Supabase.' });
    }
    
});

