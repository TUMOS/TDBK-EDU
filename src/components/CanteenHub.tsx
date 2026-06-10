import React, { useState } from 'react';
import { ShoppingBasket, Plus, Trash2, Package } from 'lucide-react';
import { CanteenItem, CanteenOrder } from '../types';
import { createDocument } from '../lib/firebase';

interface CanteenHubProps {
  items: CanteenItem[];
  orders: CanteenOrder[];
}

export default function CanteenHub({ items, orders }: CanteenHubProps) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [itemStock, setItemStock] = useState(0);
  const [itemCategory, setItemCategory] = useState<'Snack' | 'Drink' | 'Meal'>('Snack');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: CanteenItem = {
      id: 'ITM-' + Math.floor(Math.random() * 10000),
      name: itemName,
      price: itemPrice,
      stock: itemStock,
      category: itemCategory
    };
    await createDocument('canteenItems', newItem);
    setItemName('');
    setItemPrice(0);
    setItemStock(0);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
        <ShoppingBasket className="text-indigo-600" /> Canteen Management Hub
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catalog Management */}
        <div className="space-y-4">
            <h3 className="font-medium text-slate-800">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <input type="text" placeholder="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full p-2 border rounded-lg" required />
                <input type="number" placeholder="Price" value={itemPrice} onChange={e => setItemPrice(Number(e.target.value))} className="w-full p-2 border rounded-lg" required />
                <input type="number" placeholder="Stock" value={itemStock} onChange={e => setItemStock(Number(e.target.value))} className="w-full p-2 border rounded-lg" required />
                <select value={itemCategory} onChange={e => setItemCategory(e.target.value as any)} className="w-full p-2 border rounded-lg">
                    <option value="Snack">Snack</option>
                    <option value="Drink">Drink</option>
                    <option value="Meal">Meal</option>
                </select>
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-lg flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add to Catalog
                </button>
            </form>
        </div>

        {/* Catalog Display */}
        <div className="space-y-2">
            <h3 className="font-medium text-slate-800">Product Catalog</h3>
            {items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{item.name} ({item.category})</span>
                    <span className="font-bold text-indigo-600">KES {item.price} | Stock: {item.stock}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
