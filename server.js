const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const mysql = require('mysql2');

const app = express();

// Set up Mustache as the view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'manish',
  database: process.env.DB_NAME || 'medical1'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve index.html from the 'public' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Render the 'dashboard' page
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Render the 'meds' page and fetch medicines from the database
app.get('/meds', (req, res) => {
  const query = 'SELECT * FROM meds';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching medicines:', err);
      res.send('Error fetching medicines');
      return;
    }
    res.render('meds', { meds: results });
  });
});

// Render the 'add' page
app.get('/add', (req, res) => {
  res.render('med-form');
});

// Handle form submission to add medicine
app.post('/meds/add', (req, res) => {
  const { name, count, brand } = req.body;
  const query = 'INSERT INTO meds (name, count, brand) VALUES (?, ?, ?)';
  connection.query(query, [name, count, brand], (err, results) => {
    if (err) {
      console.error('Error adding medicine:', err);
      res.send('Error adding medicine');
      return;
    }
    res.redirect('/meds');
  });
});

// Render the 'edit' page with medicine details
app.get('/meds/edit/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM meds WHERE mid = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching medicine details:', err);
      res.send('Error fetching medicine details');
      return;
    }
    res.render('edit-form', { ...results[0] });
  });
});

// Handle form submission to update medicine
app.post('/meds/edit/:id', (req, res) => {
  const { id } = req.params;
  const { name, count, brand } = req.body;
  const query = 'UPDATE meds SET name = ?, count = ?, brand = ? WHERE mid = ?';
  connection.query(query, [name, count, brand, id], (err, results) => {
    if (err) {
      console.error('Error updating medicine:', err);
      res.send('Error updating medicine');
      return;
    }
    res.redirect('/meds');
  });
});

// Handle deletion of medicine
app.post('/meds/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM meds WHERE mid = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting medicine:', err);
      res.send('Error deleting medicine');
      return;
    }
    res.redirect('/meds');
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
