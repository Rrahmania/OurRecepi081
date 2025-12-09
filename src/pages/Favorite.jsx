import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initialRecipes } from '../data/resep'; 
import RecipeCard from '../components/RecipeCard';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import './Favorite.css';

const Favorite = () => {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingVersion, setRatingVersion] = useState(0);

    const { user } = useAuth();
    useEffect(() => {
        const loadFavoritesLocal = () => {
            const favoriteIds = [];
            
            // Cari semua resep yang difavoritkan di localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key && key.startsWith('recipe-') && key.endsWith('-favorite') && localStorage.getItem(key) === 'true') {
                    const idString = key.split('-')[1];
                    // try integer first, fallback to string
                    const recipeId = isNaN(parseInt(idString)) ? idString : parseInt(idString);
                    favoriteIds.push(recipeId);
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

        const loadFavoritesServer = async () => {
            try {
                const favs = await recipeService.getFavorites();
                // backend returns favorites with included recipe
                const recipes = (favs || []).map(f => f.recipe || f);
                setFavoriteRecipes(recipes);
            } catch (err) {
                console.error('Failed to load favorites from server:', err);
                // fallback to local
                loadFavoritesLocal();
            } finally {
                setLoading(false);
            }
        };

        // Load favorites depending on auth
        if (user) {
            loadFavoritesServer();
        } else {
            loadFavoritesLocal();
        }

        // Tambah event listener untuk update
        const handleStorageUpdate = () => {
            if (user) {
                // if logged in, refetch from server
                recipeService.getFavorites().then(favs => {
                    const recipes = (favs || []).map(f => f.recipe || f);
                    setFavoriteRecipes(recipes);
                }).catch(() => {
                    // ignore
                });
            } else {
                loadFavoritesLocal();
            }
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

    }, [ratingVersion, user]);

    // Handler untuk update resep setelah dihapus
        const handleRecipeDelete = async (deletedRecipeId) => {
            setFavoriteRecipes(prevRecipes => 
                prevRecipes.filter(recipe => recipe.id !== deletedRecipeId)
            );

            // If user is logged in and the id looks like UUID, try server removal
            const isUuidV4 = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
            const token = localStorage.getItem('token');
            if (token && isUuidV4(String(deletedRecipeId))) {
                try {
                    await recipeService.removeFromFavorites(deletedRecipeId);
                } catch (err) {
                    console.warn('Failed to remove favorite on server:', err);
                }
            }

            // Remove local cache as well
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
