'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  product: {
    id: string
    name: string
    unit: string
    category: {
      name: string
    }
    wholesaler: {
      name: string
      businessName: string | null
    }
  }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  deliveryAddress: string
  phone: string
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

export default function MyOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      const url = filter ? `/api/orders?status=${filter}` : '/api/orders'
      const response = await fetch(url)
      if (!response.ok) throw new Error('获取订单失败')
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error('获取订单失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '待确认'
      case 'CONFIRMED':
        return '已确认'
      case 'SHIPPED':
        return '已发货'
      case 'DELIVERED':
        return '已送达'
      case 'CANCELLED':
        return '已取消'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
        <p className="mt-2 text-gray-600">查看和管理您的订单</p>
      </div>

      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">全部订单</option>
          <option value="PENDING">待确认</option>
          <option value="CONFIRMED">已确认</option>
          <option value="SHIPPED">已发货</option>
          <option value="DELIVERED">已送达</option>
          <option value="CANCELLED">已取消</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无订单</h3>
          <p className="mt-1 text-sm text-gray-500">去市场选购心仪的水果吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">{order.orderNumber}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">¥{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">商品列表</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span className="text-gray-900">{item.product.name}</span>
                        <span className="text-gray-500 ml-2">× {item.quantity}{item.product.unit}</span>
                        <span className="text-gray-500 ml-2">({item.product.category.name})</span>
                      </div>
                      <div className="text-gray-900">¥{item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">收货地址：</span>
                    <span className="text-gray-900">{order.deliveryAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">联系电话：</span>
                    <span className="text-gray-900">{order.phone}</span>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">备注：</span>
                    <span className="text-gray-900">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
