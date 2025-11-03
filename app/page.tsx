import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/logo.png"
              alt="Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sistema de Estoque e Vendas
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie seu estoque e realize vendas de forma simples e eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/vendas"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
          >
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendas</h2>
            <p className="text-gray-600">
              Realize vendas rápidas com controle automático de estoque
            </p>
          </Link>

          <Link
            href="/estoque"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Estoque</h2>
            <p className="text-gray-600">
              Gerencie produtos, tamanhos e quantidades disponíveis
            </p>
          </Link>

          <Link
            href="/historico"
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Histórico</h2>
            <p className="text-gray-600">
              Visualize o histórico completo de vendas realizadas
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
