const axios = require('axios');
//i did not use i build it in the main 
const searchImage = async (keyword) => {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: keyword },
        headers: {
            Authorization: `9jhsHYa59v9AytInDKFF-dXLyMwoTtz8hhTQaa-GfFE`,
        },
    });
    const image = response.data.results[0];
    return {
        id: image.id,
        thumb: image.urls.thumb,
        description: image.alt_description,
    };
};

module.exports = { searchImage };
