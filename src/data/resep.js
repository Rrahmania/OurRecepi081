import Ayam from '../assets/Ayam.png'; 
import Daging from '../assets/Daging.png';
import Salad from '../assets/Salad.png';


export const initialRecipes = [
  { 
    id: 1, 
    name: 'Ayam Bakar Madu', 
    categories: ['Ayam', 'Daging'], 
    image: Ayam, 
    rating: 4.5, 
    description: "Resep ayam bakar madu yang manis dan gurih. Cocok untuk makan malam keluarga.",
    bahan: "- 1 ekor ayam, potong menjadi 4 bagian \n- 100 ml madu\n- 3 siung bawang putih, haluskan\n- 1 sdt garam\n- 1 sdt merica\n- 2 sdm kecap manis\n- 1 sdm minyak zaitun\n- Air jeruk nipis secukupnya\n- Daun pisang untuk membungkus (opsional)",
    langkah: "1. Bersihkan ayam, lumuri dengan air jeruk nipis. Diamkan 15 menit.\n2. Campur madu, bawang putih, garam, merica, kecap manis, dan minyak zaitun untuk bumbu marinasi.\n3. Lumuri ayam dengan bumbu, diamkan minimal 2 jam (lebih baik semalaman).\n4. Bakar ayam di atas bara api/teflon sambil diolesi sisa bumbu hingga matang sempurna.",
  },
  { 
    id: 2, 
    name: 'Steak Daging Sapi Lada Hitam', 
    categories: ['Daging', 'Makanan Sehat'], 
    image: Daging, 
    rating: 5.0, 
    description: "Steak sapi premium dengan saus lada hitam pedas dan kaya rasa.",
    bahan: "- 200g daging sapi (sirloin/tenderloin)\n- 1 sdm lada hitam, tumbuk kasar\n- 1 sdt garam\n- 2 sdm mentega\n- 2 siung bawang putih, geprek\n- Bahan Saus: Bawang bombay, kecap inggris, air kaldu.",
    langkah: "1. Lumuri daging dengan garam dan lada hitam. Diamkan 30 menit.\n2. Panaskan wajan, lelehkan mentega. Masukkan daging dan bawang putih geprek.\n3. Masak sesuai tingkat kematangan yang diinginkan (medium rare, medium, well done).\n4. Angkat steak. Gunakan sisa mentega untuk membuat saus lada hitam. Siram di atas steak.",
  },
  { 
    id: 3, 
    name: 'Salad Buah Segar', 
    categories: ['Salad', 'Makanan Sehat', 'Aneka Minuman'], 
    image: Salad, 
    rating: 4.8, 
    description: "Kumpulan buah-buahan segar dengan dressing yoghurt manis yang ringan.",
    bahan: "- 1 buah apel, potong dadu\n- 1 buah melon, potong dadu\n- 100g anggur, belah dua\n- Bahan Dressing: 100ml yoghurt plain, 2 sdm madu, 1 sdm kental manis.",
    langkah: "1. Cuci bersih semua buah dan potong sesuai selera.\n2. Campur semua bahan dressing hingga merata.\n3. Campurkan buah dengan dressing tepat sebelum disajikan.\n4. Dinginkan sebentar di kulkas untuk rasa yang lebih nikmat.",
  },
];

export const categories = [
    'Semua Resep', 'Ayam', 'Daging', 'Sayur', 'Aneka Minuman', 'Makanan Ringan', 
    'Mie', 'Aneka Nasi', 'Puding & Dessert', 'Hidangan Laut', 'Makanan Sehat', 'Salad'
];