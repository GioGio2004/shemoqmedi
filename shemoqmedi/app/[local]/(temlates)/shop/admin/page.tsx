"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useUser, SignIn } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { 
  Plus, Trash2, Package, 
  ShoppingBag, Upload, CheckCircle 
} from "lucide-react";

export default function AdminPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("products");
  
  // Data
  const products = useQuery(api.products.get) || [];
  const orders = useQuery(api.shop.getOrders) || [];
  const createProduct = useMutation(api.shop.createProduct);
  const deleteProduct = useMutation(api.shop.deleteProduct);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Decor",
    description: "",
    features: "",
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4">Admin Access Required</h1>
          <SignIn />
        </div>
      </div>
    );
  }

  // Security Check
  const allowedEmail = "khvichia42@gmail.com";
  const userEmail = user.primaryEmailAddress?.emailAddress;

  if (userEmail !== allowedEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-900 p-4">
        <h1 className="text-4xl font-black mb-4">ACCESS DENIED</h1>
        <p className="text-xl mb-8">You are not authorized to view this page.</p>
        <p className="font-mono bg-red-100 px-4 py-2 rounded">Current User: {userEmail}</p>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", formData.uploadPreset);
    
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${formData.cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      return json.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Check Cloud Name & Preset.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl = previewUrl;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await createProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        features: formData.features.split(",").map(s => s.trim()),
        image: imageUrl || "https://via.placeholder.com/400",
        rating: 5, // Default
        reviews: 0,
      });
      alert("Product Created!");
      setFormData({ ...formData, name: "", price: "", description: "", features: "" });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col fixed h-full z-10">
        <h1 className="text-2xl font-black mb-10 tracking-tighter">ADMIN</h1>
        
        <nav className="space-y-4 flex-1">
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "products" ? "bg-white/20 font-bold" : "text-gray-400 hover:bg-white/10"}`}
          >
            <Package className="w-5 h-5" /> Products
          </button>
          <button 
             onClick={() => setActiveTab("orders")}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "orders" ? "bg-white/20 font-bold" : "text-gray-400 hover:bg-white/10"}`}
          >
            <ShoppingBag className="w-5 h-5" /> Orders
          </button>
          <button 
             onClick={() => setActiveTab("add")}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "add" ? "bg-blue-600 font-bold shadow-lg shadow-blue-900/50" : "text-gray-400 hover:bg-white/10"}`}
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10">
           <div className="text-xs text-gray-500 mb-2">Cloudinary Config</div>
           <input 
             type="text" 
             placeholder="Cloud Name" 
             className="w-full bg-white/10 rounded px-2 py-1 text-xs mb-2 text-white placeholder:text-gray-500 border border-transparent focus:border-blue-500 outline-none"
             value={formData.cloudName}
             onChange={e => setFormData({...formData, cloudName: e.target.value})}
           />
           <input 
             type="text" 
             placeholder="Upload Preset" 
             className="w-full bg-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-gray-500 border border-transparent focus:border-blue-500 outline-none"
             value={formData.uploadPreset}
             onChange={e => setFormData({...formData, uploadPreset: e.target.value})}
           />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12">
        {activeTab === "products" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black mb-8">Product Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg relative overflow-hidden shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{product.name}</h3>
                    <p className="text-gray-500 text-sm">${product.price}</p>
                    <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm("Delete this product?")) deleteProduct({ id: product._id });
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div className="max-w-2xl mx-auto">
             <h2 className="text-3xl font-black mb-8">Add New Product</h2>
             <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                  <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" className="h-48 mx-auto object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600">
                      <Upload className="w-10 h-10 mb-2" />
                      <span className="font-bold">Click to upload image</span>
                      <span className="text-xs">Supports JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Product Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" placeholder="e.g. Marble Vase" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Price ($)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5">
                        <option>Decor</option>
                        <option>Lighting</option>
                        <option>Furniture</option>
                        <option>Art</option>
                        <option>Tech</option>
                        <option>Fashion</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-sm font-bold text-gray-700 block mb-2">Features</label>
                      <input value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" placeholder="Comma separated..." />
                   </div>
                </div>

                <div>
                   <label className="text-sm font-bold text-gray-700 block mb-2">Description</label>
                   <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" placeholder="Product details..." />
                </div>

                <button disabled={isSubmitting} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Product"}
                </button>
             </form>
          </div>
        )}

        {activeTab === "orders" && (
           <div className="space-y-6">
             <h2 className="text-3xl font-black mb-8">Recent Orders</h2>
             {orders.length === 0 ? (
               <div className="text-center text-gray-400 py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                 No orders yet.
               </div>
             ) : (
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                     <tr>
                       <th className="px-6 py-4">Order ID</th>
                       <th className="px-6 py-4">Customer</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Total</th>
                       <th className="px-6 py-4">Date</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {orders.map((order) => (
                       <tr key={order._id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 font-mono text-xs">{order._id}</td>
                         <td className="px-6 py-4">
                           <div className="font-bold">{order.customerDetails.name}</div>
                           <div className="text-xs text-gray-500">{order.customerDetails.email}</div>
                         </td>
                         <td className="px-6 py-4">
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                             <CheckCircle className="w-3 h-3" /> {order.status}
                           </span>
                         </td>
                         <td className="px-6 py-4 font-bold">${order.total}</td>
                         <td className="px-6 py-4 text-xs text-gray-500">
                           {new Date(order._creationTime).toLocaleDateString()}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
        )}
      </main>
    </div>
  );
}
