import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateAverageRating } from '../utils/ratingUtils';
import { recipeService } from '../services/recipeService';
import { isUserRecipe, deleteRecipe } from '../utils/recipeUtils';
import './Recipecard.css';

const RecipeCard = ({ recipe, showDelete = false, onDelete }) => {
  // Support both legacy local recipe shape (name, categories, bahan, langkah)
  // and backend recipe shape (title, category, ingredients, instructions)
  const id = recipe.id;
  const name = recipe.name || recipe.title || 'Untitled';
  const categories = recipe.categories || (recipe.category ? [recipe.category] : []);
  const defaultRating = recipe.rating || 0;
  const image = recipe.image || '';

  const navigate = useNavigate(); // Untuk navigasi
  const [currentRating, setCurrentRating] = useState(0);
  const [isDeletable, setIsDeletable] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cek apakah resep ini bisa dihapus (buatan user)
    const deletable = isUserRecipe(id);
    setIsDeletable(deletable);
    
    // Update rating: prefer server average when available, fallback to local calculation
    let mounted = true;
    (async () => {
      try {
        const r = await recipeService.getRatings(id);
        if (mounted && r && typeof r.average === 'number') {
          setCurrentRating(r.average);
        } else if (mounted) {
          const rating = calculateAverageRating(id, defaultRating || 0);
          setCurrentRating(rating);
        }
      } catch (err) {
        const rating = calculateAverageRating(id, defaultRating || 0);
        if (mounted) setCurrentRating(rating);
      }
    })();
    
    // Listen for rating updates
    const handleRatingUpdated = () => {
      const updatedRating = calculateAverageRating(id, defaultRating || 0);
      setCurrentRating(updatedRating);
    };

    window.addEventListener('ratingUpdated', handleRatingUpdated);
    
    return () => {
      window.removeEventListener('ratingUpdated', handleRatingUpdated);
      mounted = false;
    };
  }, [id, defaultRating]);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus resep "${name}"?`)) {
      (async () => {
        // If id looks like a server UUID and user is logged in, try server delete first
        const isUuidV4 = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
        const token = localStorage.getItem('token');

        if (isUuidV4(id) && token) {
          try {
            await recipeService.deleteRecipe(id);
            alert('Resep berhasil dihapus dari server');
            // Remove any local copy too
            deleteRecipe(id);
            if (onDelete) onDelete(id);
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('ratingUpdated'));
            return;
          } catch (err) {
            console.error('Server delete failed, falling back to local delete:', err);
            alert('Gagal menghapus dari server, akan mencoba menghapus lokal saja');
            // continue to local delete
          }
        }

        const result = deleteRecipe(id);
        if (result.success) {
          alert(result.message);
          if (onDelete) onDelete(id);
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('ratingUpdated'));
        } else {
          alert(result.message);
        }
      })();
    }
  };

  const handleCardClick = (e) => {
    // Jika klik berasal dari tombol hapus, jangan navigasi
    if (e.target.closest('.delete-card-btn')) {
      return;
    }
    // Navigasi ke detail resep
    navigate(`/resep/${id}`);
  };

  const renderRating = (rating) => {
    const displayRating = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className="rating-stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '½' : ''}
        {'☆'.repeat(emptyStars)}
        <span className="rating-value">({rating.toFixed(1)})</span> 
      </span>
    );
  };
  
  const categoryDisplay = categories 
    ? (Array.isArray(categories) ? categories.join(', ') : categories)
    : 'Tidak Ada Kategori';

  return (
    <div 
      className='recipe-card-container' 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card utama */}
      <div className='resep-card'> 
        {/* Tombol hapus - DI LUAR LINK */}
        {showDelete && isDeletable && (
          <button 
            className={`delete-card-btn ${isHovered ? 'visible' : ''}`}
            onClick={handleDelete}
            title="Hapus resep"
          >
            🗑️
          </button>
        )}
        
        {/* Gambar resep */}
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className='resep-card-img'
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className='img-placeholder'>
            <span className='recipe-emoji'>👨‍🍳</span>
          </div>
        )}

        {/* Info resep */}
        <div className='resep-card-info'>
          <h3 className='resep-card-title'>{name}</h3>
          {renderRating(currentRating)}
          <p className='resep-card-category'>
            Kategori: {categoryDisplay}
          </p>
          {isDeletable && (
            <span className="user-recipe-badge">Resep Anda</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

