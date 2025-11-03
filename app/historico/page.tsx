'use client';

import { useState, useEffect } from 'react';
import { getSales, clearSalesHistory, generateDummyData } from '@/lib/db';
import { Sale } from '@/types';
import Link from 'next/link';

export default function HistoricoPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [clearingHistory, setClearingHistory] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const [generatingData, setGeneratingData] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      setError('Erro ao carregar histórico de vendas');
    } finally {
      setLoading(false);
    }
  }

  async function handleClearHistory() {
    if (password !== 'Litalova@1990') {
      setError('Senha incorreta');
      return;
    }

    if (!confirm('Tem certeza que deseja limpar TODO o histórico de vendas? Esta ação não pode ser desfeita!')) {
      return;
    }

    try {
      setClearingHistory(true);
      setError(null);
      await clearSalesHistory();
      setSales([]);
      setShowPasswordModal(false);
      setPassword('');
      alert('Histórico de vendas limpo com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      setError('Erro ao limpar histórico de vendas');
    } finally {
      setClearingHistory(false);
    }
  }

  function openClearModal() {
    setShowPasswordModal(true);
    setPassword('');
    setError(null);
  }

  function closeClearModal() {
    setShowPasswordModal(false);
    setPassword('');
    setError(null);
  }

  async function handleGenerateDummyData() {
    if (!confirm('Gerar vendas de teste para hoje e ontem?')) {
      return;
    }

    try {
      setGeneratingData(true);
      setError(null);
      await generateDummyData();
      await loadSales();
      alert('Dados de teste gerados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar dados:', error);
      setError(error.message || 'Erro ao gerar dados de teste');
    } finally {
      setGeneratingData(false);
    }
  }

  // Filter sales by date
  function getFilteredSales() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    switch (selectedDateFilter) {
      case 'today':
        return sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate >= today && saleDate < tomorrowStart;
        });
      case 'yesterday':
        return sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate >= yesterday && saleDate < today;
        });
      default:
        return sales;
    }
  }

  // Get formatted dates for tabs
  function getTodayLabel() {
    const today = new Date();
    return today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function getYesterdayLabel() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const filteredSales = getFilteredSales();

  // Calculate totals based on filtered sales
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  // Calculate top and least sold products by size based on filtered sales
  const salesByProductSize = filteredSales.reduce((acc, sale) => {
    const key = `${sale.productName} - ${sale.size}`;
    if (!acc[key]) {
      acc[key] = {
        productName: sale.productName,
        size: sale.size,
        quantity: 0,
        revenue: 0,
      };
    }
    acc[key].quantity += sale.quantity;
    acc[key].revenue += sale.total;
    return acc;
  }, {} as Record<string, { productName: string; size: string; quantity: number; revenue: number }>);

  const sortedByQuantity = Object.values(salesByProductSize).sort((a, b) => b.quantity - a.quantity);
  const topSellers = sortedByQuantity.slice(0, 3);
  const leastSellers = sortedByQuantity.slice(-3);

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
          <div className="flex gap-3">
            {/* <button
              onClick={handleGenerateDummyData}
              disabled={generatingData}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              {generatingData ? '⏳ Gerando...' : '🎲 Dados Teste'}
            </button> */}
            <button
              onClick={openClearModal}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              disabled={sales.length === 0}
            >
              Limpar Histórico
            </button>
            <Link
              href="/"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              ← Voltar
            </Link>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedDateFilter('today')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${selectedDateFilter === 'today'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {getTodayLabel()} ({sales.filter(s => {
                const saleDate = new Date(s.timestamp);
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const tomorrowStart = new Date(todayStart);
                tomorrowStart.setDate(tomorrowStart.getDate() + 1);
                return saleDate >= todayStart && saleDate < tomorrowStart;
              }).length})
            </button>
            <button
              onClick={() => setSelectedDateFilter('yesterday')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${selectedDateFilter === 'yesterday'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              {getYesterdayLabel()} ({sales.filter(s => {
                const saleDate = new Date(s.timestamp);
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const yesterday = new Date(todayStart);
                yesterday.setDate(yesterday.getDate() - 1);
                return saleDate >= yesterday && saleDate < todayStart;
              }).length})
            </button>
            <button
              onClick={() => setSelectedDateFilter('all')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${selectedDateFilter === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Todos ({sales.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total de Vendas</div>
            <div className="text-3xl font-bold text-gray-900">{filteredSales.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Itens Vendidos</div>
            <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Valor Total</div>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalSales.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Top and Least Sellers */}
        {filteredSales.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Sellers */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🏆 Top 3 Mais Vendidos
              </h2>
              <div className="space-y-3">
                {topSellers.map((item, index) => (
                  <div
                    key={`${item.productName}-${item.size}`}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Tamanho: <span className="font-semibold">{item.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">
                        {item.quantity} un.
                      </div>
                      <div className="text-xs text-gray-600">
                        R$ {item.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {topSellers.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Sem dados suficientes
                  </div>
                )}
              </div>
            </div>

            {/* Least Sellers */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📉 Top 3 Menos Vendidos
              </h2>
              <div className="space-y-3">
                {leastSellers.map((item, index) => (
                  <div
                    key={`${item.productName}-${item.size}`}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Tamanho: <span className="font-semibold">{item.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-700">
                        {item.quantity} un.
                      </div>
                      <div className="text-xs text-gray-600">
                        R$ {item.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {leastSellers.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Sem dados suficientes
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sales Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Carregando...</div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {sales.length === 0 ? 'Nenhuma venda realizada ainda.' : 'Nenhuma venda neste período.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold">Data/Hora</th>
                    <th className="text-left p-4 font-semibold">Produto</th>
                    <th className="text-left p-4 font-semibold">Tamanho</th>
                    <th className="text-right p-4 font-semibold">Quantidade</th>
                    <th className="text-right p-4 font-semibold">Preço Unit.</th>
                    <th className="text-right p-4 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 text-sm text-gray-600">
                        {sale.timestamp
                          ? new Date(sale.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '-'}
                      </td>
                      <td className="p-4 font-medium">{sale.productName}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {sale.size}
                        </span>
                      </td>
                      <td className="p-4 text-right">{sale.quantity}</td>
                      <td className="p-4 text-right">R$ {sale.price.toFixed(2)}</td>
                      <td className="p-4 text-right font-semibold text-green-600">
                        R$ {sale.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔒 Limpar Histórico de Vendas
            </h2>
            <p className="text-gray-600 mb-4">
              Esta ação irá deletar permanentemente todo o histórico de vendas. Digite a senha para confirmar.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleClearHistory()}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                placeholder="Digite a senha"
                autoFocus
              />
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleClearHistory}
                disabled={clearingHistory || !password}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {clearingHistory ? 'Limpando...' : 'Confirmar'}
              </button>
              <button
                onClick={closeClearModal}
                disabled={clearingHistory}
                className="flex-1 bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
