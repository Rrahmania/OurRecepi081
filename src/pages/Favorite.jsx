import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initialRecipes } from '../data/resep'; 
import RecipeCard from '../components/RecipeCard'; // Gunakan RecipeCard yang sudah diperbaiki
import './Favorite.css';

const Favorite = () => {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingVersion, setRatingVersion] = useState(0);

    useEffect(() => {
        const loadFavorites = () => {
            const favoriteIds = [];
            
            // Cari semua resep yang difavoritkan di localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key.startsWith('recipe-') && key.endsWith('-favorite') && localStorage.getItem(key) === 'true') {
                    const idString = key.split('-')[1];
                    const recipeId = parseInt(idString);
                    if (!isNaN(recipeId)) {
                        favoriteIds.push(recipeId);
                    }
                }
            }

            // Gabungkan resep dari data.js DAN localStorage
            const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
            const allRecipes = [...initialRecipes, ...savedRecipes];
            
            // Filter semua resep yang difavoritkan
            const foundFavorites = allRecipes.filter(recipe => 
                favoriteIds.includes(recipe.id)
            );

            setFavoriteRecipes(foundFavorites);
            setLoading(false);
        };

        // Load pertama kali
        loadFavorites();
        
        // Tambah event listener untuk update
        const handleStorageUpdate = () => {
            loadFavorites();
        };
        
        const handleRatingUpdated = () => {
            setRatingVersion(prev => prev + 1);
        };
        
        window.addEventListener('storage', handleStorageUpdate);
        window.addEventListener('ratingUpdated', handleRatingUpdated);
        
        // Cleanup
        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            window.removeEventListener('ratingUpdated', handleRatingUpdated);
        };
        
    }, [ratingVersion]);

    // Handler untuk update resep setelah dihapus
    const handleRecipeDelete = (deletedRecipeId) => {
      setFavoriteRecipes(prevRecipes => 
        prevRecipes.filter(recipe => recipe.id !== deletedRecipeId)
      );
      
      // Juga hapus dari localStorage favorit
      localStorage.removeItem(`recipe-${deletedRecipeId}-favorite`);
    };

    if (loading) {
        return (
            <div className="favorite-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Memuat Resep Favorit...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorite-page">
            <h1 className="page-title">❤️ Resep Favorit Saya</h1>

            <div className='resep-list-favorite'>
                {favoriteRecipes.length > 0 ? (
                    favoriteRecipes.map(recipe => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        showDelete={true} // Tampilkan tombol hapus
                        onDelete={handleRecipeDelete} // Handler untuk hapus
                      />
                    ))
                ) : (
                    <div className='no-favorites'>
                        <div className="no-favorites-icon">❤️</div>
                        <h3>Belum Ada Resep Favorit</h3>
                        <p>Anda belum memiliki resep favorit.</p>
                        <p>Coba jelajahi <Link to="/kategori">Kategori Resep</Link> dan tambahkan beberapa!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorite;