import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { initialRecipes } from '../data/resep';
import { saveRecipeRating, getRecipeRating } from '../utils/ratingUtils';
import './DetailResep.css';

const DetailResep = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [isUserRecipe, setIsUserRecipe] = useState(false);

    const isUserLoggedIn = () => {
        return !!localStorage.getItem('user');
    };

    useEffect(() => {
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
    }, [id]);

    const toggleFavorite = () => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk menyimpan resep ke Favorite!");
            navigate('/login');
            return;
        }

        const newFavStatus = !isFavorite;
        setIsFavorite(newFavStatus);
        localStorage.setItem(`recipe-${id}-favorite`, newFavStatus);
        window.dispatchEvent(new Event('storage'));
    };

    const handleRating = (rate) => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk memberi nilai (rating) resep ini!");
            navigate('/login');
            return;
        }

        // Simpan rating ke localStorage
        saveRecipeRating(id, rate);
        setUserRating(rate);
        
        // Trigger event untuk update komponen lain
        window.dispatchEvent(new Event('ratingUpdated'));
    };

    const handleDeleteRecipe = () => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk menghapus resep!");
            navigate('/login');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menghapus resep "${recipe.name}"?`)) {
            return;
        }

        try {
            // Ambil resep dari localStorage
            const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
            
            // Filter out resep yang ingin dihapus
            const updatedRecipes = savedRecipes.filter(r => 
                r.id !== recipe.id && r.id.toString() !== id
            );
            
            // Simpan kembali ke localStorage
            localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
            
            // Hapus juga data rating dan favorit untuk resep ini
            localStorage.removeItem(`recipe-${id}-rating`);
            localStorage.removeItem(`recipe-${id}-favorite`);
            
            // Trigger event untuk update tampilan
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('ratingUpdated'));
            
            // Redirect ke halaman kategori
            alert("Resep berhasil dihapus!");
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
                    
                    <div className="header-info">
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <h2>{recipe.name}</h2>
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
                        <p>Kategori: <strong>{Array.isArray(recipe.categories) ? recipe.categories.join(', ') : recipe.categories}</strong></p>
                        {userRating > 0 && (
                            <p>
                                <strong>Rating Anda:</strong> {renderRatingDisplay(userRating)}
                            </p>
                        )}
                    </div>

                    <div className="description">
                        <h3>Deskripsi:</h3>
                        <p>{recipe.description}</p>
                    </div>

                    <div className="bahan-bahan">
                        <h3>Bahan - bahan:</h3>
                        <div className="ingredients-content">
                            {recipe.bahan ? (
                                recipe.bahan.split('\n').map((line, index) => (
                                    line.trim() && <div key={index} className="ingredient-item">{line}</div>
                                ))
                            ) : (
                                <p>Belum ada bahan yang ditambahkan</p>
                            )}
                        </div>
                    </div>

                    <div className="langkah-langkah">
                        <h3>Langkah - langkah:</h3>
                        <div className="steps-content">
                            {recipe.langkah ? (
                                recipe.langkah.split('\n').map((line, index) => (
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