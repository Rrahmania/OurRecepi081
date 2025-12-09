import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { initialRecipes } from '../data/resep';
import { getRecipeRating, saveRecipeRating } from '../utils/ratingUtils';
import { recipeService } from '../services/recipeService';
import './DetailResep.css';

const DetailResep = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [isUserRecipe, setIsUserRecipe] = useState(false);

    const isUserLoggedIn = () => {
        return !!localStorage.getItem('user');
    };

    useEffect(() => {
        const load = async () => {
            // Try load from API first
            try {
                const apiRecipe = await recipeService.getRecipeById(id);
                        if (apiRecipe) {
                                        setRecipe(apiRecipe);
                                                                // If recipe came from server, determine ownership by comparing user id
                                                                const userObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                                                                if (apiRecipe && apiRecipe.userId && userObj && String(apiRecipe.userId) === String(userObj.id)) {
                                                                    setIsUserRecipe(true);
                                                                } else {
                                                                    setIsUserRecipe(false);
                                                                }
                                        // also try to set favorite status from localStorage if exists
                                        const storedFav = localStorage.getItem(`recipe-${id}-favorite`) === 'true';
                                        setIsFavorite(storedFav);

                                        // Fetch ratings/average from server
                                        try {
                                            const rdata = await recipeService.getRatings(id);
                                            if (rdata) {
                                                setAverageRating(rdata.average || 0);
                                                setRatingCount(rdata.count || 0);
                                                // if user is logged in, attempt to find their rating
                                                const userObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                                                if (userObj && Array.isArray(rdata.ratings)) {
                                                    const my = rdata.ratings.find(rt => rt.user && String(rt.user.id) === String(userObj.id));
                                                    if (my) setUserRating(my.score);
                                                }
                                            }
                                        } catch (err) {
                                            console.warn('Failed to load ratings from server:', err?.message || err);
                                            const storedUserRating = getRecipeRating(id);
                                            if (storedUserRating !== null) setUserRating(storedUserRating);
                                        }

                                        setLoading(false);
                                        return;
                                }
            } catch (err) {
                console.warn('Failed to load recipe from API, falling back to localStorage:', err.message);
            }

            // Fallback to localStorage + initialRecipes
            const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
            const allRecipes = [...initialRecipes, ...savedRecipes];
            const recipeId = parseInt(id);
            const foundRecipe = allRecipes.find(r => r.id === recipeId || r.id.toString() === id);
            setRecipe(foundRecipe);

            // Cek apakah resep ini milik user (dari localStorage)
            const isFromUser = savedRecipes.some(r => r.id === recipeId || r.id.toString() === id);
            setIsUserRecipe(isFromUser);

            // Ambil status favorit
            const storedFav = localStorage.getItem(`recipe-${id}-favorite`) === 'true';
            setIsFavorite(storedFav);

            // Ambil rating user dari localStorage
            const storedUserRating = getRecipeRating(id);
            if (storedUserRating !== null) {
                setUserRating(storedUserRating);
            }

            setLoading(false);
        };

        load();
    }, [id]);

    const toggleFavorite = () => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk menyimpan resep ke Favorite!");
            navigate('/login');
            return;
        }

        (async () => {
            try {
                if (!isFavorite) {
                    // add favorite on server
                    await recipeService.addToFavorites(id);
                    setIsFavorite(true);
                    localStorage.setItem(`recipe-${id}-favorite`, 'true');
                } else {
                    // remove favorite on server
                    await recipeService.removeFromFavorites(id);
                    setIsFavorite(false);
                    localStorage.setItem(`recipe-${id}-favorite`, 'false');
                }
                // notify other parts of app
                window.dispatchEvent(new Event('storage'));
            } catch (err) {
                console.error('Error toggling favorite:', err);
                alert('Gagal memperbarui favorit. Silakan coba lagi.');
            }
        })();
    };

    const handleRating = (rate) => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk memberi nilai (rating) resep ini!");
            navigate('/login');
            return;
        }

        // If recipe id is not a server UUID (e.g. local numeric id), store locally instead of calling server
        const isUuidV4 = (str) => {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
        };

        if (!isUuidV4(id)) {
          // Fallback to local storage for legacy/local recipes
          saveRecipeRating(id, rate);
          setUserRating(rate);
          window.dispatchEvent(new Event('ratingUpdated'));
          return;
        }

        // Send rating to server (upsert)
        (async () => {
            try {
                const payload = { recipeId: id, score: rate, comment: '' };
                await recipeService.upsertRating(payload);
                // refresh averages
                const rdata = await recipeService.getRatings(id);
                if (rdata) {
                    setAverageRating(rdata.average || 0);
                    setRatingCount(rdata.count || 0);
                    // find user's rating
                    const userObj = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                    if (userObj && Array.isArray(rdata.ratings)) {
                        const my = rdata.ratings.find(rt => rt.user && String(rt.user.id) === String(userObj.id));
                        if (my) setUserRating(my.score);
                    } else {
                        setUserRating(rate);
                    }
                }
                // Notify other components
                window.dispatchEvent(new CustomEvent('ratingUpdated', { detail: { recipeId: id, average: rdata?.average, count: rdata?.count } }));
            } catch (err) {
                // Log extra info to help debugging 500 errors
                console.error('Error submitting rating:', err, { recipeId: id, score: rate });
                alert('Gagal mengirim rating. Silakan coba lagi.');
            }
        })();
    };

    const handleDeleteRecipe = async () => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk menghapus resep!");
            navigate('/login');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menghapus resep "${recipe.name}"?`)) {
            return;
        }

        try {
                        // If recipe is server-side (UUID) and user is logged in, try to delete on server
                        const isUuidV4 = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
                        const token = localStorage.getItem('token');

                        if (isUuidV4(id) && token) {
                            try {
                                await recipeService.deleteRecipe(id);
                                // also remove any local copy
                                const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
                                const updatedRecipes = savedRecipes.filter(r => r.id !== recipe.id && r.id.toString() !== id);
                                localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
                                localStorage.removeItem(`recipe-${id}-rating`);
                                localStorage.removeItem(`recipe-${id}-favorite`);
                                window.dispatchEvent(new Event('storage'));
                                window.dispatchEvent(new Event('ratingUpdated'));
                                alert('Resep berhasil dihapus dari server');
                                navigate('/kategori');
                                return;
                            } catch (err) {
                                console.error('Failed to delete recipe on server, falling back to local delete:', err);
                                alert('Gagal menghapus dari server, akan mencoba menghapus lokal saja');
                                // fallthrough to local deletion
                            }
                        }

                        // Local delete (fallback)
                        const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
                        const updatedRecipes = savedRecipes.filter(r => r.id !== recipe.id && r.id.toString() !== id);
                        localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
                        localStorage.removeItem(`recipe-${id}-rating`);
                        localStorage.removeItem(`recipe-${id}-favorite`);
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('ratingUpdated'));
                        alert('Resep berhasil dihapus!');
                        navigate('/kategori');
            
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert("Gagal menghapus resep. Silakan coba lagi.");
        }
    };

    const renderStars = (currentRating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`star ${i <= currentRating ? 'filled' : 'empty'}`}
                    onClick={() => handleRating(i)}
                >
                    ★
                </span>
            );
        }
        return stars;
    };
    
    const renderRatingDisplay = (rating) => {
        if (!rating) return null;
        const displayRating = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(displayRating);
        const hasHalfStar = displayRating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <span className="avg-rating">
                {'★'.repeat(fullStars)}
                {hasHalfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)} 
                <span style={{color: '#333', marginLeft: '5px'}}>({rating.toFixed(1)}/5)</span>
            </span>
        );
    };

    if (loading) {
        return <div className="detail-page" style={{textAlign: 'center', padding: '50px'}}>
            <div>Memuat resep...</div>
        </div>;
    }

    if (!recipe) {
        return <div className="detail-page" style={{textAlign: 'center', color: '#DB944B'}}>
            <Link to="/kategori" className="back-button">← Kembali ke Daftar Resep</Link>
            <p>Resep dengan ID {id} tidak ditemukan.</p>
        </div>;
    }

    return (
        <div className="detail-page">
            <Link to="/kategori" className="back-button">← Kembali ke Daftar Resep</Link>

            <div className="detail-container">
                <img 
                  src={recipe.image} 
                  alt={recipe.name} 
                  className="detail-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
                
                <div className="detail-info">
                    {/* Normalize fields between backend and local shapes */}
                    {(() => {
                        // compute normalized values
                        const displayName = recipe.name || recipe.title || 'Untitled';
                        const displayCategories = Array.isArray(recipe.categories)
                            ? recipe.categories
                            : (recipe.category ? [recipe.category] : []);
                        const ingredientsArray = Array.isArray(recipe.ingredients)
                            ? recipe.ingredients
                            : (recipe.bahan ? recipe.bahan.split('\n').map(s => s.trim()).filter(Boolean) : []);
                        const instructionsText = recipe.instructions || recipe.langkah || '';

                        // Attach to recipe for downstream JSX readability via closure
                        recipe._display = { displayName, displayCategories, ingredientsArray, instructionsText };
                    })()}
                    
                    <div className="header-info">
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <h2>{recipe._display?.displayName || recipe.name}</h2>
                            {isUserRecipe && (
                                <button 
                                    onClick={handleDeleteRecipe} 
                                    className="delete-recipe-btn"
                                    style={{
                                        background: '#ff4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 15px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    🗑️ Hapus Resep
                                </button>
                            )}
                        </div>
                        <button onClick={toggleFavorite} className={`favorite-btn ${isFavorite ? 'active' : ''}`}>
                            {isFavorite ? '❤️ Favorite Tersimpan' : '🤍 Tambahkan ke Favorite'}
                        </button>
                    </div>

                    <div className="metadata">
                        <p>Kategori: <strong>{(recipe._display?.displayCategories || []).join(', ')}</strong></p>
                                                <div>
                                                    <p><strong>Rata-rata:</strong> {renderRatingDisplay(averageRating)} {ratingCount ? <small>({ratingCount} penilai)</small> : null}</p>
                                                    {userRating > 0 && (
                                                        <p>
                                                                <strong>Rating Anda:</strong> {renderRatingDisplay(userRating)}
                                                        </p>
                                                    )}
                                                </div>
                    </div>

                    <div className="description">
                        <h3>Deskripsi:</h3>
                        <p>{recipe.description}</p>
                    </div>

                    <div className="bahan-bahan">
                        <h3>Bahan - bahan:</h3>
                        <div className="ingredients-content">
                            {recipe._display?.ingredientsArray && recipe._display.ingredientsArray.length > 0 ? (
                                recipe._display.ingredientsArray.map((line, index) => (
                                    <div key={index} className="ingredient-item">{line}</div>
                                ))
                            ) : (
                                <p>Belum ada bahan yang ditambahkan</p>
                            )}
                        </div>
                    </div>

                    <div className="langkah-langkah">
                        <h3>Langkah - langkah:</h3>
                        <div className="steps-content">
                            {recipe._display?.instructionsText ? (
                                recipe._display.instructionsText.split('\n').map((line, index) => (
                                    line.trim() && <div key={index} className="step-item">{line}</div>
                                ))
                            ) : (
                                <p>Belum ada langkah yang ditambahkan</p>
                            )}
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div className="user-rating-section">
                        <h3>Beri Nilai Resep Ini:</h3>
                        <div className="rating-controls">
                            {renderStars(userRating)}
                            <span className="rating-status">
                                {userRating > 0 
                                    ? `Anda memberi ${userRating} bintang.` 
                                    : 'Klik bintang untuk memberi nilai.'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailResep;
