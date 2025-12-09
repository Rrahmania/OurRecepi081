// src/utils/recipeUtils.js

// Fungsi untuk menghapus resep
export const deleteRecipe = (recipeId) => {
  try {
    console.log('Deleting recipe with ID:', recipeId);
    
    // 1. Ambil resep dari localStorage
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    
    // 2. Filter out resep yang ingin dihapus
    const updatedRecipes = savedRecipes.filter(r => {
      const isMatch = r.id === parseInt(recipeId) || r.id.toString() === recipeId.toString();
      return !isMatch;
    });
    
    console.log('Before deletion:', savedRecipes.length, 'recipes');
    console.log('After deletion:', updatedRecipes.length, 'recipes');
    
    // 3. Simpan kembali ke localStorage
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    // 4. Hapus data rating dari sistem rating
    const ratings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
    delete ratings[recipeId];
    localStorage.setItem('recipeRatings', JSON.stringify(ratings));
    
    // 5. Hapus status favorit
    localStorage.removeItem(`recipe-${recipeId}-favorite`);
    
    // 6. Hapus rating cache jika ada
    const ratingCache = JSON.parse(localStorage.getItem('ratingCache')) || {};
    delete ratingCache[recipeId];
    localStorage.setItem('ratingCache', JSON.stringify(ratingCache));
    
    return { 
      success: true, 
      message: 'Resep berhasil dihapus!',
      deletedCount: savedRecipes.length - updatedRecipes.length
    };
    
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return { 
      success: false, 
      message: `Gagal menghapus resep: ${error.message}` 
    };
  }
};

// Cek apakah resep adalah buatan user
export const isUserRecipe = (recipeId) => {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const found = savedRecipes.some(r => 
      r.id === parseInt(recipeId) || r.id.toString() === recipeId.toString()
    );
    return found;
  } catch (error) {
    console.error('Error checking user recipe:', error);
    return false;
  }
};

// Ambil resep berdasarkan ID
export const getRecipeById = (recipeId) => {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
    const recipe = savedRecipes.find(r => 
      r.id === parseInt(recipeId) || r.id.toString() === recipeId.toString()
    );
    return recipe || null;
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    return null;
  }
};