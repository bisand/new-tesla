const express = require('express');
const { engine } = require('express-handlebars');
const teslaData = require('./tesla-data');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up Handlebars
app.engine('handlebars', engine({
    helpers: {
        readFile: (filePath) => {
            try {
                const data = fs.readFileSync(filePath);
                return data;
            } catch (err) {
                console.error('Error reading file:', err);
                return '';
            }
        }
    }
}));
app.set('view engine', 'handlebars');

// Serve static files
app.use(express.static('public'));

// Helper function to read a file
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Routes
app.get('/', async (req, res) => {
    const data = await teslaData.fetchData();

    // Initialize an empty array for results
    var visualizerData = teslaData.prepareData(data);

    res.render('home', { response: visualizerData });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
