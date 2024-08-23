const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data.json');
//to get all the data
const getAllProjects = () => {
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
};

const saveProjects = (projects) => {
    fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2));
};

module.exports = { getAllProjects, saveProjects };
