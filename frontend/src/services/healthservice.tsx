import axios from "axios";

const API_KEY = "d187e4cf008845abbd4a4f18733ecd7b";
const BASE_URL = "https://newsapi.org/v2/everything";

export const fetchHealthArticles = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        q: "health",
        apiKey: API_KEY,
        pageSize: 6, 
        language: "en",
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching health articles:", error);
    return [];
  }
};
