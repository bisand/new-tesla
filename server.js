const express = require('express');
const { engine } = require('express-handlebars');
const teslaData = require('./tesla-data');
const app = express();
const port = 3000;

// Set up Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Serve static files
app.use(express.static('public'));


// Routes// Include the tesla.data.js module

app.get('/', async (req, res) => {
    const data = await teslaData.fetchData();

    // Initialize an empty array for results
    var visualizerData = teslaData.prepareData(data);

    res.render('home', { response: visualizerData });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
