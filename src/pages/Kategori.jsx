import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initialRecipes, categories } from '../data/resep';
import RecipeCard from '../components/RecipeCard';
import { recipeService } from '../services/recipeService';
import './Kategori.css'; 
import cari from '../assets/cari.png'; 

const Kategori = () => {
  const [activeCategory, setActiveCategory] = useState('Semua Resep');
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecipes, setAllRecipes] = useState([]);
  const [ratingVersion, setRatingVersion] = useState(0);

  useEffect(() => {
    const loadRecipes = async () => {
      // Normalizer used for server and local shapes
      const normalize = (r) => {
        const id = r.id || r.serverId || String(r.id) || String(Date.now());
        const name = r.name || r.title || 'Untitled';
        const cats = Array.isArray(r.categories)
          ? r.categories
          : (r.category ? [r.category] : []);
        const image = r.image || '';
        return { ...r, id, name, categories: cats, image };
      };

      // Start from the built-in initial recipes
      const normalizedInitial = initialRecipes.map(normalize);

      // Try fetching server recipes first (preferred)
      let serverRecipes = [];
      try {
        const sr = await recipeService.getAllRecipes();
        if (Array.isArray(sr)) {
          serverRecipes = sr.map(normalize);
        } else if (sr && Array.isArray(sr.recipes)) {
          serverRecipes = sr.recipes.map(normalize);
        }
      } catch (err) {
        // If fetch fails, we will fallback to localStorage below
        console.warn('Could not fetch recipes from server:', err?.message || err);
        serverRecipes = [];
      }

      // Load saved local recipes
      let savedRecipes = [];
      try {
        savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      } catch (e) {
        savedRecipes = [];
      }
      const normalizedSaved = savedRecipes.map(normalize);

      // Merge: priority -> initial < server < saved-local (but do not overwrite server with local)
      const map = new Map();
      normalizedInitial.forEach(r => map.set(String(r.id), r));
      serverRecipes.forEach(r => map.set(String(r.id), r));
      // Only add saved-local recipes if id not present (avoid duplicates)
      normalizedSaved.forEach(r => {
        if (!map.has(String(r.id))) map.set(String(r.id), r);
      });

      setAllRecipes(Array.from(map.values()));
    };

    loadRecipes();
    
    const handleRatingUpdated = () => {
      setRatingVersion(prev => prev + 1);
    };
    
    window.addEventListener('storage', loadRecipes);
    window.addEventListener('ratingUpdated', handleRatingUpdated);
    
    return () => {
      window.removeEventListener('storage', loadRecipes);
      window.removeEventListener('ratingUpdated', handleRatingUpdated);
    };
  }, [ratingVersion]);

  const handleFilterClick = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handler untuk update resep setelah dihapus
  const handleRecipeDelete = (deletedRecipeId) => {
    setAllRecipes(prevRecipes => 
      prevRecipes.filter(recipe => recipe.id !== deletedRecipeId)
    );
  };
  
  const filterRecipes = () => {
    let filtered = allRecipes;
    
    if (activeCategory !== 'Semua Resep') {
        filtered = allRecipes.filter(recipe => 
            recipe.categories && recipe.categories.includes(activeCategory)
        );
    }
    
    if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => 
            recipe.name.toLowerCase().includes(lowerCaseSearch)
        );
    }
    
    return filtered;
  };

  const recipesToShow = filterRecipes();

  return (
    <div className='kategori-page'>
      <div className='search-input-area'>
         <div className='cari'> 
           <input 
               type="text" 
               placeholder='Cari Resep di sini...' 
               value={searchTerm}
               onChange={handleSearchChange}
           />
           <img src={cari} alt="ikon pencarian"/>
         </div>
      </div>
      
      <div className='filter-container'>
        <h2 className='filter-title'>Pilih Kategori Resep:</h2>
        <div className='filter-buttons'>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleFilterClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <hr className='separator' />

      <div className='resep-list'>
        <h1 className='list-header'>Resep untuk Kategori: {activeCategory}</h1>
        
        {recipesToShow.length > 0 ? (
            recipesToShow.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                showDelete={true} // Tampilkan tombol hapus
                onDelete={handleRecipeDelete} // Handler untuk hapus
              />
            ))
        ) : (
            <div className='no-result'>
              <p>Tidak ada resep ditemukan.</p>
              <Link to="/tambah-resep" className="add-recipe-link">
                + Tambah Resep Pertama
              </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Kategori;
