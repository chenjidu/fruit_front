'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RefreshCw } from 'lucide-react'

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
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (!response.ok) throw new Error('获取商品失败')
      const data = await response.json()
      setProduct(data)
    } catch (err) {
      console.error('获取商品失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = () => {
    if (!product) return
    
    const newCart = new Map(cart)
    const currentQuantity = newCart.get(product.id) || 0
    newCart.set(product.id, currentQuantity + quantity)
    setCart(newCart)
    
    alert(`已添加 ${quantity} ${product.unit} 到购物车`)
  }

  const buyNow = () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    alert('结算功能开发中')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">商品不存在</h2>
          <Link
            href="/dashboard/market"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            返回市场
          </Link>
        </div>
      </div>
    )
  }

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
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/market"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">返回市场</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-8xl">🍎</span>
                  </div>
                )}
                {product.stock < 10 && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                      仅剩 {product.stock} {product.unit}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                        <span className="text-2xl">🍎</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 flex-1">{product.name}</h1>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5" />
                    <span className="text-sm text-gray-600 ml-1">4.8</span>
                  </div>
                </div>
                <p className="text-gray-600">{product.description || '优质新鲜水果，品质保证'}</p>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-red-500">¥{product.price.toFixed(2)}</span>
                <span className="text-xl text-gray-500">/{product.unit}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">极速发货</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">品质保证</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">售后无忧</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">库存</span>
                  <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stock} {product.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">分类</span>
                  <span className="font-semibold text-gray-900">{product.category.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">批发商</span>
                  <span className="font-semibold text-gray-900">
                    {product.wholesaler.businessName || product.wholesaler.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">购买数量</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">
                    共 {product.stock} {product.unit} 可售
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>加入购物车</span>
                </button>
                <button
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  立即购买
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">批发商信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">商家名称</span>
                    <span className="text-gray-900">{product.wholesaler.businessName || product.wholesaler.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">联系电话</span>
                    <span className="text-gray-900">{product.wholesaler.phone || '未提供'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">商品详情</h2>
          <div className="prose max-w-none text-gray-600">
            <p>{product.description || '这是一款优质的新鲜水果，经过严格筛选，确保品质上乘。我们承诺所有水果均为产地直供，新鲜度有保障。适合各类商户采购，价格实惠，品质可靠。'}</p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">产品特点</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>产地直供，新鲜度有保障</li>
              <li>严格筛选，品质上乘</li>
              <li>价格实惠，性价比高</li>
              <li>包装精美，运输安全</li>
              <li>售后无忧，放心购买</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">储存建议</h3>
            <p>建议在阴凉干燥处储存，避免阳光直射。开封后请尽快食用，以保证最佳口感。如需长期储存，可放入冰箱冷藏。</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">购买须知</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">1.</span>
              <p>本平台所有商品均为批发价格，起批数量以商品页面标注为准</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">2.</span>
              <p>商品价格可能因市场波动而调整，请以实际下单时价格为准</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">3.</span>
              <p>如遇商品缺货，我们会尽快与您联系协商解决方案</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">4.</span>
              <p>生鲜商品不支持7天无理由退货，如遇质量问题请在24小时内联系客服</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">5.</span>
              <p>收货时请当面验货，确认无误后再签收</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
