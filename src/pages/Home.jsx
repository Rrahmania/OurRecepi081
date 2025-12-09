import React, { useState, useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel'; 
import RecipeCard from '../components/RecipeCard'; 
import './Home.css'; 
import { initialRecipes } from '../data/resep';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [ratingVersion, setRatingVersion] = useState(0);
  
  useEffect(() => {
    const loadRecipes = () => {
      try {
        const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
        setRecipes([...initialRecipes, ...savedRecipes]);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setRecipes(initialRecipes);
      }
    };
    
    loadRecipes();
    
    window.addEventListener('storage', loadRecipes);
    
    const handleRatingUpdated = () => {
      setRatingVersion(prev => prev + 1);
    };
    
    window.addEventListener('ratingUpdated', handleRatingUpdated);
    
    return () => {
      window.removeEventListener('storage', loadRecipes);
      window.removeEventListener('ratingUpdated', handleRatingUpdated);
    };
  }, [ratingVersion]); // Tambahkan ratingVersion ke dependencies
  
  // Handler untuk update resep setelah dihapus
  const handleRecipeDelete = (deletedRecipeId) => {
    setRecipes(prevRecipes => 
      prevRecipes.filter(recipe => recipe.id !== deletedRecipeId)
    );
  };
  
  // Ambil 3 resep terbaru (atau semua jika kurang dari 3)
  const popularRecipes = recipes.slice(0, 3); 
  
  return (
    <div className='home-page'>
      <section className='hero-section'>
        <HeroCarousel />
      </section>
      
      <section className='popular-recipes-section'>
        <div className='popular-header'>
          <h2 className='section-title'>Resep Populer</h2>
          <p className='section-subtitle'>
            Temukan resep-resep terbaik yang paling banyak dicoba dan disukai oleh komunitas memasak kami
          </p>
        </div>
        
        <div className='popular-recipes-grid'>
          {popularRecipes.length > 0 ? (
            popularRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                showDelete={true} // Tampilkan tombol hapus
                onDelete={handleRecipeDelete} // Handler untuk hapus
              />
            ))
          ) : (
            <p className='no-recipes'>Belum ada resep. Silakan tambah resep pertama!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;