'use client';

import { useState, useEffect } from 'react';
import { getProducts, processSale } from '@/lib/db';
import { Product } from '@/types';
import Image from 'next/image';
import { ProductCardSkeleton } from '@/components/LoadingSkeleton';

export default function VendasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<{ [size: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar produtos' });
    } finally {
      setLoadingProducts(false);
    }
  }

  function handleProductClick(product: Product) {
    setSelectedProduct(product);
    setSelectedSizes({});
    setMessage(null);
  }

  function handleSizeToggle(size: string) {
    setSelectedSizes((prev) => {
      const newSizes = { ...prev };
      if (newSizes[size]) {
        delete newSizes[size];
      } else {
        newSizes[size] = 1;
      }
      return newSizes;
    });
  }

  function handleQuantityChange(size: string, value: number) {
    if (value < 1) return;
    setSelectedSizes((prev) => ({
      ...prev,
      [size]: value,
    }));
  }

  async function handleSale() {
    if (!selectedProduct || Object.keys(selectedSizes).length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos um tamanho e quantidade' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Process each size sale
      for (const [size, quantity] of Object.entries(selectedSizes)) {
        if (quantity > 0) {
          await processSale(selectedProduct.id, size, quantity);
        }
      }
      
      const totalItems = Object.values(selectedSizes).reduce((sum, qty) => sum + qty, 0);
      setMessage({ type: 'success', text: `Venda realizada com sucesso! ${totalItems} itens vendidos.` });

      // Reload products to update stock
      await loadProducts();

      // Reset form
      setSelectedProduct(null);
      setSelectedSizes({});
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao processar venda' });
    } finally {
      setLoading(false);
    }
  }

  const sizeOrder = ['P', 'M', 'G', 'GG', 'G1'];
  const availableSizes = selectedProduct
    ? sizeOrder
        .filter(size => selectedProduct.sizes[size] && selectedProduct.sizes[size] > 0)
        .map(size => [size, selectedProduct.sizes[size]] as [string, number])
    : [];

  const totalPrice = selectedProduct
    ? Object.entries(selectedSizes).reduce((sum, [_, qty]) => sum + (selectedProduct.price * qty), 0)
    : 0;

  const totalItems = Object.values(selectedSizes).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vendas</h1>
          <a
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            ← Voltar
          </a>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Produtos</h2>
            <div className="space-y-3">
              {loadingProducts ? (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              ) : products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="flex gap-4">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover border border-gray-200"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                    ) : (
                      <div className="w-[80px] h-[80px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        Sem imagem
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900">{product.name}</div>
                      <div className="text-gray-900 text-sm mt-1 font-semibold">
                        R$ {product.price.toFixed(2)}
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-700 font-semibold mb-2">Estoque:</div>
                        <div className="flex flex-wrap gap-2">
                          {['P', 'M', 'G', 'GG', 'G1'].map(size => {
                            const qty = product.sizes[size] || 0;
                            return (
                              <span
                                key={size}
                                className={`px-3 py-1.5 rounded-md text-sm font-bold ${
                                  qty > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {size}: {qty}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {!loadingProducts && products.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum produto cadastrado
              </div>
            )}
          </div>

          {/* Sale Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Detalhes da Venda</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              {selectedProduct ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-3">Produto</div>
                    <div className="flex gap-4 items-center">
                      {selectedProduct.imageUrl ? (
                        <Image
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          width={100}
                          height={100}
                          className="rounded-lg object-cover border border-gray-200"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        />
                      ) : (
                        <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          Sem imagem
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{selectedProduct.name}</div>
                        <div className="text-gray-900 mt-1">R$ {selectedProduct.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-900">Tamanho</label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableSizes.map(([size, stockQty]) => (
                        <div key={size} className="space-y-2">
                          <button
                            onClick={() => handleSizeToggle(size)}
                            className={`w-full p-3 rounded-lg border-2 transition-all ${selectedSizes[size]
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="font-semibold text-gray-900 text-center">{size}</div>
                            <div className="text-xs text-gray-600 text-center">{stockQty} un.</div>
                          </button>
                          {selectedSizes[size] !== undefined && (
                            <div>
                              <label className="block text-xs text-gray-600 mb-1 font-medium">Quantidade</label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(size, Math.max(1, selectedSizes[size] - 1))}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={stockQty}
                                  value={selectedSizes[size]}
                                  onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 1)}
                                  className="flex-1 text-center p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white font-semibold text-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(size, Math.min(stockQty, selectedSizes[size] + 1))}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Disponível: {stockQty} unidades
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {availableSizes.length === 0 && (
                      <div className="text-red-500 text-sm mt-2">Sem estoque disponível</div>
                    )}
                  </div>

                  {totalItems > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Total de itens:</span>
                          <span className="font-semibold">{totalItems}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-gray-900">
                          <span>Total:</span>
                          <span>R$ {totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleSale}
                        disabled={loading || totalItems === 0}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Processando...' : 'VENDER'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Selecione um produto para iniciar a venda
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
