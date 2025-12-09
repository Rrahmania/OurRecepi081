import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initialRecipes, categories } from '../data/resep'; 
import RecipeCard from '../components/RecipeCard'; // Gunakan RecipeCard yang sudah diperbaiki
import './Kategori.css'; 
import cari from '../assets/cari.png'; 

const Kategori = () => {
  const [activeCategory, setActiveCategory] = useState('Semua Resep');
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecipes, setAllRecipes] = useState([]);
  const [ratingVersion, setRatingVersion] = useState(0);

  useEffect(() => {
    const loadRecipes = () => {
      try {
        const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];

        // Normalize each recipe so we always have: id, name, categories (array), image, bahan/langkah or ingredients/instructions
        const normalize = (r) => {
          const id = r.id;
          const name = r.name || r.title || 'Untitled';
          const categories = r.categories && Array.isArray(r.categories)
            ? r.categories
            : (r.category ? [r.category] : []);
          const image = r.image || '';
          return { ...r, id, name, categories, image };
        };

        const normalizedInitial = initialRecipes.map(normalize);
        const normalizedSaved = savedRecipes.map(normalize);

        setAllRecipes([...normalizedInitial, ...normalizedSaved]);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setAllRecipes(initialRecipes.map(r => ({
          ...r,
          name: r.name || r.title || 'Untitled',
          categories: r.categories || (r.category ? [r.category] : [])
        })));
      }
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
