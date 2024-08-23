const express = require('express');
const bodyParser = require('body-parser');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const port = 3001;
//building the server in the port 3001
app.use(bodyParser.json());
app.use('/projects', projectRoutes);
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
