'use client';

import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/db';
import { uploadProductImage } from '@/lib/storage';
import { Product } from '@/types';
import Image from 'next/image';

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sizes: {} as { [key: string]: number },
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const commonSizes = ['P', 'M', 'G', 'GG', 'G1'];

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar produtos' });
    }
  }

  function handleNewProduct() {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      sizes: {},
      imageUrl: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
    setMessage(null);
  }

  function handleEditProduct(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      sizes: { ...product.sizes },
      imageUrl: product.imageUrl || '',
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || null);
    setShowForm(true);
    setMessage(null);
  }

  function handleSizeChange(size: string, value: string) {
    const qty = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [size]: qty },
    }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      setMessage({ type: 'error', text: 'Preencha nome e preço' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        const tempId = editingProduct?.id || Date.now().toString();
        imageUrl = await uploadProductImage(imageFile, tempId);
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        sizes: formData.sizes,
        imageUrl,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
      } else {
        const newId = await addProduct(productData);
        // If we used a temp ID, upload again with the real ID
        if (imageFile && !editingProduct) {
          imageUrl = await uploadProductImage(imageFile, newId);
          await updateProduct(newId, { imageUrl });
        }
        setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' });
      }

      await loadProducts();
      setShowForm(false);
      setFormData({ name: '', price: '', sizes: {}, imageUrl: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar produto' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja realmente excluir o produto "${name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteProduct(id);
      setMessage({ type: 'success', text: 'Produto excluído com sucesso!' });
      await loadProducts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao excluir produto' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-black font-bold">Gerenciar Estoque</h1>
          <div className="flex gap-3">
            <a
              href="/"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              ← Voltar
            </a>
            <button
              onClick={handleNewProduct}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Novo Produto
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
              }`}
          >
            {message.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Nome do Produto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Imagem do Produto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover border border-gray-300"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Tamanhos e Quantidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {commonSizes.map((size) => (
                    <div key={size}>
                      <label className="block text-xs font-semibold text-gray-900 mb-1">{size}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sizes[size] || ''}
                        onChange={(e) => handleSizeChange(size, e.target.value)}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Imagem</th>
                <th className="text-left p-4 font-semibold text-gray-900">Produto</th>
                <th className="text-left p-4 font-semibold text-gray-900">Preço</th>
                <th className="text-left p-4 font-semibold text-gray-900">Estoque</th>
                <th className="text-right p-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover border border-gray-200"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        Sem imagem
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-900">R$ {product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(product.sizes).map(([size, qty]) => (
                        <span
                          key={size}
                          className={`px-2 py-1 rounded text-xs font-medium ${qty > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {size}: {qty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
