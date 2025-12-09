// src/utils/ratingUtils.js - PERBAIKAN LENGKAP

// ============ STORAGE STRUCTURE ============
/**
 * Struktur rating di localStorage:
 * 1. recipeRatings: { [recipeId]: averageRating }
 * 2. userRatings: { [recipeId]: { [userId]: rating } }
 * 3. ratingCache: { [recipeId]: { average, count, timestamp } }
 */

// ============ USER RATINGS ============
// Simpan rating dari user tertentu
export const saveUserRating = (recipeId, userId, rating) => {
  try {
    if (!recipeId || !userId) return false;
    
    // Validasi rating
    if (rating < 1 || rating > 5) {
      console.error('Rating harus antara 1-5');
      return false;
    }
    
    // Ambil semua user ratings
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    
    // Inisialisasi jika belum ada
    if (!userRatings[recipeId]) {
      userRatings[recipeId] = {};
    }
    
    // Simpan rating user
    userRatings[recipeId][userId] = rating;
    
    // Update localStorage
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    
    // Clear cache untuk resep ini (supaya dihitung ulang)
    clearRatingCache(recipeId);
    
    // Hitung ulang average rating
    const result = calculateAndCacheAverageRating(recipeId);
    
    // Trigger event untuk update UI
    triggerRatingUpdate(recipeId);
    
    return true;
  } catch (error) {
    console.error('Error saving user rating:', error);
    return false;
  }
};

// Ambil rating user tertentu untuk resep tertentu
export const getUserRating = (recipeId, userId) => {
  try {
    if (!recipeId || !userId) return null;
    
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    
    if (userRatings[recipeId] && userRatings[recipeId][userId] !== undefined) {
      return parseInt(userRatings[recipeId][userId]);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
};

// Hapus rating user tertentu
export const deleteUserRating = (recipeId, userId) => {
  try {
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    
    if (userRatings[recipeId] && userRatings[recipeId][userId] !== undefined) {
      delete userRatings[recipeId][userId];
      
      // Hapus object jika kosong
      if (Object.keys(userRatings[recipeId]).length === 0) {
        delete userRatings[recipeId];
      }
      
      localStorage.setItem('userRatings', JSON.stringify(userRatings));
      clearRatingCache(recipeId);
      triggerRatingUpdate(recipeId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting user rating:', error);
    return false;
  }
};

// ============ AVERAGE RATING CALCULATION ============
// Hitung dan cache rating rata-rata
export const calculateAndCacheAverageRating = (recipeId, defaultRating = 0) => {
  try {
    // Cek cache dulu
    const cached = getCachedRating(recipeId);
    if (cached) {
      return cached;
    }
    
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    const recipeRatings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
    
    let allRatings = [];
    
    // 1. Tambahkan rating dari userRatings
    if (userRatings[recipeId]) {
      const userRatingValues = Object.values(userRatings[recipeId])
        .map(r => parseInt(r))
        .filter(r => r >= 1 && r <= 5);
      allRatings = [...allRatings, ...userRatingValues];
    }
    
    // 2. Tambahkan rating dari recipeRatings (legacy)
    if (recipeRatings[recipeId]) {
      const rating = parseInt(recipeRatings[recipeId]);
      if (rating >= 1 && rating <= 5) {
        allRatings.push(rating);
      }
    }
    
    // 3. Tambahkan rating default jika ada
    if (defaultRating > 0 && defaultRating <= 5) {
      allRatings.push(defaultRating);
    }
    
    // 4. Tambahkan rating dari localStorage key lama (backward compatibility)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`recipe-${recipeId}-rating-`)) {
        const rating = parseInt(localStorage.getItem(key));
        if (rating >= 1 && rating <= 5) {
          allRatings.push(rating);
        }
      }
    }
    
    // Hitung rata-rata
    let average = 0;
    if (allRatings.length > 0) {
      const sum = allRatings.reduce((a, b) => a + b, 0);
      average = parseFloat((sum / allRatings.length).toFixed(1));
    }
    
    // Cache hasilnya
    const ratingData = {
      average,
      count: allRatings.length,
      timestamp: Date.now()
    };
    
    // Simpan ke cache
    const ratingCache = JSON.parse(localStorage.getItem('ratingCache')) || {};
    ratingCache[recipeId] = ratingData;
    localStorage.setItem('ratingCache', JSON.stringify(ratingCache));
    
    // Juga simpan ke recipeRatings untuk backward compatibility
    if (average > 0) {
      const updatedRatings = { ...recipeRatings, [recipeId]: average };
      localStorage.setItem('recipeRatings', JSON.stringify(updatedRatings));
    }
    
    return ratingData;
    
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { average: defaultRating || 0, count: 0, timestamp: Date.now() };
  }
};

// Ambil rating dari cache
const getCachedRating = (recipeId) => {
  try {
    const ratingCache = JSON.parse(localStorage.getItem('ratingCache')) || {};
    
    if (ratingCache[recipeId]) {
      const cache = ratingCache[recipeId];
      const CACHE_DURATION = 5 * 60 * 1000; // 5 menit
      
      // Return cache jika masih fresh
      if (Date.now() - cache.timestamp < CACHE_DURATION) {
        return cache;
      } else {
        // Cache expired, hapus
        delete ratingCache[recipeId];
        localStorage.setItem('ratingCache', JSON.stringify(ratingCache));
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached rating:', error);
    return null;
  }
};

// Clear cache untuk resep tertentu
const clearRatingCache = (recipeId) => {
  try {
    const ratingCache = JSON.parse(localStorage.getItem('ratingCache')) || {};
    delete ratingCache[recipeId];
    localStorage.setItem('ratingCache', JSON.stringify(ratingCache));
    return true;
  } catch (error) {
    console.error('Error clearing rating cache:', error);
    return false;
  }
};

// ============ PUBLIC FUNCTIONS (Backward Compatible) ============
// Untuk kompatibilitas dengan kode lama
export const saveRecipeRating = (recipeId, rating) => {
  // Simpan sebagai rating global (tanpa user)
  const ratings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
  ratings[recipeId] = rating;
  localStorage.setItem('recipeRatings', JSON.stringify(ratings));
  clearRatingCache(recipeId);
  triggerRatingUpdate(recipeId);
  return true;
};

export const getRecipeRating = (recipeId) => {
  // Ambil dari cache atau hitung ulang
  const cached = getCachedRating(recipeId);
  if (cached) {
    return cached.average;
  }
  
  const ratings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
  return ratings[recipeId] || null;
};

export const calculateAverageRating = (recipeId, defaultRating = 0) => {
  const cached = getCachedRating(recipeId);
  if (cached) {
    return cached.average;
  }
  
  const result = calculateAndCacheAverageRating(recipeId, defaultRating);
  return result.average;
};

export const getAllRatings = () => {
  try {
    // Gabungkan semua sumber rating
    const allRatings = {};
    
    // 1. Dari recipeRatings
    const recipeRatings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
    Object.keys(recipeRatings).forEach(recipeId => {
      allRatings[recipeId] = recipeRatings[recipeId];
    });
    
    // 2. Dari cache (lebih update)
    const ratingCache = JSON.parse(localStorage.getItem('ratingCache')) || {};
    Object.keys(ratingCache).forEach(recipeId => {
      allRatings[recipeId] = ratingCache[recipeId].average;
    });
    
    return allRatings;
  } catch (error) {
    console.error('Error getting all ratings:', error);
    return {};
  }
};

export const deleteRecipeRating = (recipeId) => {
  try {
    // Hapus dari semua sumber
    const recipeRatings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
    delete recipeRatings[recipeId];
    localStorage.setItem('recipeRatings', JSON.stringify(recipeRatings));
    
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    delete userRatings[recipeId];
    localStorage.setItem('userRatings', JSON.stringify(userRatings));
    
    clearRatingCache(recipeId);
    triggerRatingUpdate(recipeId);
    
    return true;
  } catch (error) {
    console.error('Error deleting recipe rating:', error);
    return false;
  }
};

// ============ UTILITIES ============
// Trigger event untuk update UI
export const triggerRatingUpdate = (recipeId) => {
  const result = calculateAndCacheAverageRating(recipeId);
  
  window.dispatchEvent(new CustomEvent('ratingUpdated', {
    detail: {
      recipeId,
      average: result.average,
      count: result.count,
      timestamp: Date.now()
    }
  }));
  
  window.dispatchEvent(new Event('storage'));
  
  return result;
};

// Migrasi data lama ke sistem baru
export const migrateOldRatings = () => {
  try {
    console.log('Migrating old rating data...');
    
    // Migrasi dari localStorage keys lama
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Pattern: recipe-{id}-rating-{userId}
      if (key && key.includes('-rating-')) {
        const parts = key.split('-');
        if (parts.length >= 4) {
          const recipeId = parts[1];
          const userId = parts[3] || 'anonymous';
          const rating = parseInt(localStorage.getItem(key));
          
          if (recipeId && rating >= 1 && rating <= 5) {
            saveUserRating(recipeId, userId, rating);
            // Optional: hapus key lama setelah migrasi
            // localStorage.removeItem(key);
          }
        }
      }
    }
    
    console.log('Rating migration completed');
    return true;
  } catch (error) {
    console.error('Error migrating ratings:', error);
    return false;
  }
};

// Initialize rating system
export const initRatingSystem = () => {
  // Jalankan migrasi sekali
  if (!localStorage.getItem('ratingSystemInitialized')) {
    migrateOldRatings();
    localStorage.setItem('ratingSystemInitialized', 'true');
  }
  
  console.log('Rating system initialized');
  return true;
};

// Get rating count for a recipe
export const getRatingCount = (recipeId) => {
  const cached = getCachedRating(recipeId);
  if (cached) {
    return cached.count;
  }
  
  const result = calculateAndCacheAverageRating(recipeId);
  return result.count;
};

// Get all user ratings for a recipe
export const getAllUserRatingsForRecipe = (recipeId) => {
  try {
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    return userRatings[recipeId] || {};
  } catch (error) {
    console.error('Error getting user ratings for recipe:', error);
    return {};
  }
};

// Reset all ratings (untuk debugging/testing)
export const resetAllRatings = () => {
  try {
    localStorage.removeItem('recipeRatings');
    localStorage.removeItem('userRatings');
    localStorage.removeItem('ratingCache');
    localStorage.removeItem('ratingSystemInitialized');
    window.dispatchEvent(new Event('storage'));
    console.log('All ratings reset');
    return true;
  } catch (error) {
    console.error('Error resetting ratings:', error);
    return false;
  }
};