'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShoppingCart, Search, Filter, SlidersHorizontal } from 'lucide-react'

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
  wholesaler: {
    id: string
    name: string
    businessName: string | null
    phone: string | null
  }
}

interface Category {
  id: string
  name: string
}

export default function MarketPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [selectedCategory, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoryId', selectedCategory)
      
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('获取商品失败')
      let data = await response.json()

      if (sortBy === 'price-asc') {
        data.sort((a: Product, b: Product) => a.price - b.price)
      } else if (sortBy === 'price-desc') {
        data.sort((a: Product, b: Product) => b.price - a.price)
      } else if (sortBy === 'stock') {
        data.sort((a: Product, b: Product) => b.stock - a.stock)
      }

      setProducts(data)
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

  const removeFromCart = (productId: string) => {
    const newCart = new Map(cart)
    const currentQuantity = newCart.get(productId) || 0
    if (currentQuantity > 1) {
      newCart.set(productId, currentQuantity - 1)
    } else {
      newCart.delete(productId)
    }
    setCart(newCart)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                       (!priceRange.max || product.price <= parseFloat(priceRange.max))
    
    return matchesSearch && matchesPrice
  })

  const cartTotal = Array.from(cart.entries()).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId)
    return total + (product ? product.price * quantity : 0)
  }, 0)

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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <span className="hidden sm:inline">{session?.user?.name || '用户中心'}</span>
              </Link>
              <Link
                href="/dashboard/market"
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">市场选购</h1>
          <p className="text-gray-600">精选优质水果，新鲜直达</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">筛选</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">商品分类</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !selectedCategory ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      全部分类
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">价格区间</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">最低价格</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">最高价格</label>
                      <input
                        type="number"
                        placeholder="不限"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">排序方式</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="default">默认排序</option>
                    <option value="price-asc">价格从低到高</option>
                    <option value="price-desc">价格从高到低</option>
                    <option value="stock">库存最多</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">没有找到商品</h3>
                <p className="text-gray-600 mb-4">试试调整筛选条件或搜索关键词</p>
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setSearchTerm('')
                    setPriceRange({ min: '', max: '' })
                    setSortBy('default')
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  清除筛选
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">共找到 <span className="font-semibold text-gray-900">{filteredProducts.length}</span> 件商品</p>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>筛选</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const cartQuantity = cart.get(product.id) || 0
                    return (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                        <Link href={`/dashboard/market/${product.id}`} className="block">
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
                            {product.stock < 10 && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                  仅剩 {product.stock}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="p-4">
                          <Link href={`/dashboard/market/${product.id}`}>
                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                            {product.wholesaler.businessName || product.wholesaler.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-red-500">¥{product.price.toFixed(2)}</span>
                              <span className="text-sm text-gray-500">/{product.unit}</span>
                            </div>
                            {cartQuantity > 0 ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-medium">{cartQuantity}</span>
                                <button
                                  onClick={() => addToCart(product.id)}
                                  disabled={cartQuantity >= product.stock}
                                  className="w-8 h-8 rounded-full bg-green-600 text-white hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product.id)}
                                disabled={product.stock === 0}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                              >
                                加入购物车
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {cartItemsCount > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-4 border-2 border-green-500 z-50">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600">已选 {cartItemsCount} 件商品</p>
                <p className="text-lg font-bold text-green-600">¥{cartTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={() => alert('结算功能开发中')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                去结算
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
