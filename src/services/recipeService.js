// src/services/recipeService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5010/api";
// Debug helper: log resolved API URL at module load so it's visible in browser console
console.info('[recipeService] Resolved API_URL =', API_URL);

const getToken = () => localStorage.getItem("token");

// Universal fetch wrapper
const request = async (endpoint, method = "GET", body = null) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      // Include raw response text for easier debugging
      const errMsg = `Unable to parse JSON response (status ${res.status}): ${text}`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
  }

  if (!res.ok) {
    // Prefer server-provided message, otherwise include status
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
};

export const recipeService = {

  // ================================
  // RECIPES
  // ================================
  getAllRecipes: async () => {
    const data = await request("/recipes");
    return data.recipes;
  },

  getRecipeById: async (id) => {
    const data = await request(`/recipes/${id}`);
    return data.recipe;
  },

  createRecipe: async (recipe) => {
    const data = await request("/recipes", "POST", recipe);
    return data.recipe;
  },

  updateRecipe: async (id, recipe) => {
    const data = await request(`/recipes/${id}`, "PUT", recipe);
    return data.recipe;
  },

  deleteRecipe: async (id) => {
    return await request(`/recipes/${id}`, "DELETE");
  },

  // ================================
  // FAVORITES
  // ================================
  getFavorites: async () => {
    const data = await request("/favorites");
    return data.favorites;  // backend already returns: { favorites: [...] }
  },

  addToFavorites: async (recipeId) => {
    return await request("/favorites", "POST", { recipeId });
  },

  removeFromFavorites: async (recipeId) => {
    return await request(`/favorites/${recipeId}`, "DELETE");
  },
};
