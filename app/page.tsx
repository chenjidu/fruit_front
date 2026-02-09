'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  unit: string
  imageUrl: string | null
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('获取商品失败')
      const data = await response.json()
      setProducts(data.slice(0, 8))
    } catch (err) {
      console.error('获取商品失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('获取分类失败')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('获取分类失败:', err)
    }
  }

  const addToCart = (productId: string) => {
    const newCart = new Map(cart)
    const currentQuantity = newCart.get(productId) || 0
    newCart.set(productId, currentQuantity + 1)
    setCart(newCart)
  }

  const cartItemsCount = Array.from(cart.values()).reduce((sum, quantity) => sum + quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">果</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">鲜果批发</span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="搜索新鲜水果..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{session.user.name}</span>
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">登录</span>
                </Link>
              )}
              <Link
                href={session ? '/dashboard/market' : '/auth/signin'}
                className="relative flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">购物车</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 px-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索新鲜水果..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Link href="/dashboard/market" className="block py-2 text-gray-700 hover:text-green-600">
                市场选购
              </Link>
              <Link href="/dashboard/my-orders" className="block py-2 text-gray-700 hover:text-green-600">
                我的订单
              </Link>
              {session?.user?.role === 'WHOLESALER' && (
                <>
                  <Link href="/dashboard/products" className="block py-2 text-gray-700 hover:text-green-600">
                    商品管理
                  </Link>
                  <Link href="/dashboard/orders" className="block py-2 text-gray-700 hover:text-green-600">
                    订单管理
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="relative bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              新鲜水果，直达您的店铺
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              优质批发商直供，价格实惠，品质保证
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={session ? '/dashboard/market' : '/auth/signin'}
                className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                立即选购
              </Link>
              <Link
                href={session ? '/dashboard/products/new' : '/auth/signup'}
                className="px-8 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors text-center"
              >
                成为批发商
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="white" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">热门分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={session ? `/dashboard/market?category=${category.id}` : '/auth/signin'}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🍎</span>
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">热门商品</h2>
            <Link
              href={session ? '/dashboard/market' : '/auth/signin'}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              查看更多 →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                        <span className="text-4xl">🍎</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        新品
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.description || '优质水果'}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-red-500">¥{product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">/{product.unit}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        加入购物车
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">成为批发商，开启您的水果生意</h2>
            <p className="text-xl mb-8 text-orange-100">
              简单易用的管理平台，助您轻松经营
            </p>
            <Link
              href={session ? '/dashboard/products/new' : '/auth/signup'}
              className="inline-block px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">关于我们</h3>
              <p className="text-gray-400">
                专业的水果批发交易平台，连接优质批发商和商户，提供新鲜水果直达服务。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard/market" className="hover:text-white">市场选购</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">成为批发商</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white">登录</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">帮助中心</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">常见问题</a></li>
                <li><a href="#" className="hover:text-white">联系我们</a></li>
                <li><a href="#" className="hover:text-white">服务条款</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">联系方式</h3>
              <ul className="space-y-2 text-gray-400">
                <li>电话：400-123-4567</li>
                <li>邮箱：support@fruit.com</li>
                <li>地址：北京市朝阳区</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 鲜果批发. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
