import React, { useState } from 'react';
import './ResepiForm.css';
import { recipeService } from '../services/recipeService';

const RecipeForm = () => { 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    categories: [],
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Daftar kategori yang tersedia
  const availableCategories = [
    'Ayam', 'Daging', 'Sayur', 'Aneka Minuman', 'Makanan Ringan', 'Mie',
    'Aneka Nasi', 'Pudding & Dessert', 'Hidangan Laut', 'Makanan Sehat', 'Salad'
  ];

  // --- HANDLER LOGIC ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => {
      const currentCategories = prev.categories;
      const isSelected = currentCategories.includes(category);
      if (isSelected) {
        return { ...prev, categories: currentCategories.filter(cat => cat !== category) };
      } else if (currentCategories.length < 3) {
        return { ...prev, categories: [...currentCategories, category] };
      }
      return prev;
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addIngredient = () => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  const addStep = () => setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Fungsi konversi File ke Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.categories.length === 0) {
      alert('Pilih minimal 1 kategori!');
      setLoading(false);
      return;
    }
    
    try {
      // Use multipart FormData upload (supports large images)
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category', formData.categories[0] || 'Lainnya');
      form.append('ingredients', JSON.stringify(formData.ingredients.filter(ing => ing.trim() !== '')));
      form.append('instructions', formData.steps.filter(step => step.trim() !== '').join('\n'));
      if (formData.image && formData.image instanceof File) {
        form.append('image', formData.image, formData.image.name);
      }

      let createdRecipe = null;
      try {
        createdRecipe = await recipeService.createRecipeForm(form);
      } catch (apiError) {
        console.error('API createRecipe (form) error:', apiError);
        const msg = apiError?.message || 'Gagal menyimpan resep ke server.';
        alert(`Gagal menyimpan ke server: ${msg}`);
        setLoading(false);
        return;
      }

      // 4. Persist to localStorage so category page (which reads localStorage) shows the recipe
      try {
        const saved = JSON.parse(localStorage.getItem('recipes')) || [];
        const created = createdRecipe || {};
        const localRecipe = {
          id: created.id || newRecipe.id,
          name: created.title || newRecipe.name,
          categories: created.category ? [created.category] : (newRecipe.categories || []),
          image: created.image || newRecipe.image || '',
          bahan: Array.isArray(created.ingredients)
            ? created.ingredients.map(i => `- ${i}`).join('\n')
            : (created.ingredients || newRecipe.bahan),
          langkah: created.instructions || newRecipe.langkah,
          createdAt: created.createdAt || new Date().toISOString()
        };

        saved.push(localRecipe);
        localStorage.setItem('recipes', JSON.stringify(saved));
        // If user is logged in, also add to server-side favorites
        try {
          const token = localStorage.getItem('token');
          const serverId = createdRecipe?.id || null;
          if (token && serverId) {
            // recipeService.addToFavorites expects recipeId
            try {
              await recipeService.addToFavorites(serverId);
            } catch (favErr) {
              // non-fatal: log and continue
              console.warn('Could not add to favorites on server:', favErr?.message || favErr);
            }
          }
        } catch (e) {
          console.warn('Error while trying to add favorite:', e);
        }

        // Trigger other listeners (Kategori listens to 'storage' to reload)
        try { window.dispatchEvent(new Event('storage')); } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn('Could not persist recipe to localStorage:', e);
      }

      // 5. Reset form
      setFormData({
        title: '', description: '', ingredients: [''], steps: [''], categories: [], image: null
      });
      setImagePreview(null);
      // 5. Tampilkan alert & redirect
      alert('Resep berhasil ditambahkan!');

      // 6. Redirect ke halaman detail (backend returns created recipe object)
      const targetId = createdRecipe?.id || newRecipe.id;
      window.location.href = `/resep/${targetId}`;
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Terjadi kesalahan saat menyimpan resep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form-container">
      <h2>Tambah Resep Baru</h2>
      <form onSubmit={handleSubmit} className="recipe-form">
        
        {/* 1. Judul Resep */}
        <div className="form-group">
          <label htmlFor="title">Judul Resep *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Masukkan judul resep..."
          />
        </div>

        {/* 2. Deskripsi Resep */}
        <div className="form-group">
          <label htmlFor="description">Deskripsi Resep *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            placeholder="Deskripsikan resep Anda..."
          />
        </div>

        {/* 3. Kategori */}
        <div className="form-group">
          <label>Kategori * (Maksimal 3)</label>
          <div className="categories-container">
            <div className="categories-grid">
              {availableCategories.map(category => (
                <label key={category} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    disabled={formData.categories.length >= 3 && !formData.categories.includes(category)}
                  />
                  <span className="checkbox-custom"></span>
                  {category}
                </label>
              ))}
            </div>
            <div className="categories-selected">
              <strong>Kategori terpilih: </strong>
              {formData.categories.length > 0 ? (
                formData.categories.join(', ')
              ) : (
                <span className="no-category">Belum memilih kategori</span>
              )}
              <span className="categories-count">
                ({formData.categories.length}/3)
              </span>
            </div>
          </div>
        </div>

        {/* 4. Bahan-bahan */}
        <div className="form-group">
          <label>Bahan-bahan *</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Bahan ${index + 1}...`}
                required={index === 0}
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeIngredient(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addIngredient}>
            + Tambah Bahan
          </button>
        </div>

        {/* 5. Langkah-langkah */}
        <div className="form-group">
          <label>Langkah-langkah *</label>
          {formData.steps.map((step, index) => (
            <div key={index} className="dynamic-field">
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Langkah ${index + 1}...`}
                rows="3"
                required={index === 0}
              />
              {formData.steps.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeStep(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addStep}>
            + Tambah Langkah
          </button>
        </div>

        {/* 6. Upload Foto */}
        <div className="form-group">
          <label>Foto Makanan</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            /> 
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 7. Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}> 
          {loading ? 'Menyimpan...' : 'Simpan Resep'}
        </button>
        {loading && <p>Mohon tunggu, resep sedang diunggah...</p>} 
      </form>
    </div>
  );
}; 

export default RecipeForm;
