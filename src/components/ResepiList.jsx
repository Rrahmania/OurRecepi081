import React from 'react';
import './ResepiList.css';


const RecipeList = ({ recipes, onDelete }) => {
  if (recipes.length === 0) {
    return (
      <div className="recipe-list-empty">
        <p>🍽 Belum ada resep. Silakan tambah resep pertama Anda!</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <h3>📖 Resep Terbaru ({recipes.length})</h3>
      <div className="recipes-grid">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-card-header">
              <h4>{recipe.title}</h4>
              <button 
                className="delete-btn"
                onClick={() => onDelete(recipe.id)}
                title="Hapus resep"
              >
                🗑
              </button>
            </div>
            
            {/* Tampilkan Kategori */}
            {recipe.categories && recipe.categories.length > 0 && (
              <div className="recipe-categories">
                {recipe.categories.map((category, index) => (
                  <span key={index} className="category-tag">
                    {category}
                  </span>
                ))}
              </div>
            )}
            
            {recipe.image && (
              <div className="recipe-image">
                <img 
                  src={typeof recipe.image === 'string' 
                    ? recipe.image 
                    : URL.createObjectURL(recipe.image)
                  } 
                  alt={recipe.title} 
                />
              </div>
            )}
            
            <div className="recipe-content">
              <p className="recipe-description">{recipe.description}</p>
              
              <div className="recipe-section">
                <strong>🛒 Bahan-bahan:</strong>
                <ul>
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div className="recipe-section">
                <strong>👨‍🍳 Langkah-langkah:</strong>
                <ol>
                  {recipe.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="recipe-meta">
                <small>Dibuat pada: {new Date(recipe.createdAt).toLocaleDateString('id-ID')}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;