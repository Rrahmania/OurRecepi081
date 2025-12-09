// src/hooks/useResep.js
import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", 
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID", 
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const useResep = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); // Default TRUE saat memuat awal
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Dapatkan ID Pengguna dari localStorage (simulasi autentikasi)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')); 
    if (user && user.uid) {
        setUserId(user.uid);
    } else {
        setError("User ID tidak ditemukan. Harap login.");
        setLoading(false);
    }
  }, []);

  // ... (getCollectionRef dan fetchRecipes) ...

  const getCollectionRef = useCallback(() => {
    if (!userId) return null;
    return collection(db, 'users', userId, 'recipes');
  }, [userId]);

  const fetchRecipes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const q = query(getCollectionRef(), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const recipesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecipes(recipesList);
      setError(null); // Clear error after successful fetch
    } catch (e) {
      console.error("Error fetching recipes: ", e);
      setError("Gagal memuat resep dari server.");
    } finally {
      setLoading(false);
    }
  }, [userId, getCollectionRef]);

  useEffect(() => {
    if (userId) {
      fetchRecipes();
    }
  }, [userId, fetchRecipes]);


  // 4. Tambah Resep (CREATE) - FUNGSI INI MENGATUR LOADING STATE
  const addRecipe = async (recipeData) => {
    if (!userId) {
        alert("Gagal menyimpan: Pengguna belum terautentikasi.");
        return;
    }
    
    setLoading(true); // 👈 PENTING: MULAI LOADING
    setError(null);

    try {
      let imageUrl = '';
      
      // Upload Gambar ke Firebase Storage
      if (recipeData.image) {
        const imageRef = ref(storage, `recipe_images/${userId}/${Date.now()}_${recipeData.image.name}`);
        await uploadBytes(imageRef, recipeData.image);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      const recipeToSave = {
        ...recipeData,
        image: imageUrl, 
        createdAt: new Date().toISOString(),
        rating: 0 
      };

      await addDoc(getCollectionRef(), recipeToSave);
      
      // Refresh daftar resep setelah berhasil simpan
      await fetchRecipes(); 

    } catch (e) {
      console.error("Error adding document: ", e);
      setError("Gagal menyimpan resep ke server. Cek konsol dan aturan Firebase.");
      alert("Penyimpanan gagal. Cek error di konsol.");

    } finally {
      // Tidak perlu set loading ke false di sini, karena fetchRecipes() sudah melakukannya
      // Jika Anda tidak memanggil fetchRecipes, Anda harus memanggil setLoading(false) di sini.
    }
  };
  
  // ... (fungsi deleteRecipe) ...

  const deleteRecipe = async (id) => {
    if (!userId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(getCollectionRef(), id));
      await fetchRecipes(); 
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Gagal menghapus resep.");
    } finally {
      // Loading akan diset ke false oleh fetchRecipes()
    }
  };

  return { recipes, loading, error, addRecipe, deleteRecipe, userId };
};

export default useResep;