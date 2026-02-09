import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isWholesaler = session?.user?.role === 'WHOLESALER'

  let stats = null

  if (isWholesaler) {
    const products = await prisma.product.count({
      where: { wholesalerId: session.user.id }
    })
    const orders = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              wholesalerId: session.user.id
            }
          }
        }
      }
    })
    stats = { products, orders }
  } else {
    const orders = await prisma.order.count({
      where: { merchantId: session?.user?.id }
    })
    stats = { orders }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          欢迎回来，{session?.user?.name}！
        </h1>
        <p className="mt-2 text-gray-600">
          {isWholesaler ? '管理您的商品和订单' : '浏览市场并下单'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isWholesaler ? (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">商品数量</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.products}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">订单数量</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.orders}</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/products/new"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">发布商品</p>
                  <p className="text-lg font-semibold text-green-600">立即添加</p>
                </div>
              </div>
            </Link>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">我的订单</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.orders}</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/market"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">市场选购</p>
                  <p className="text-lg font-semibold text-green-600">立即浏览</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/my-orders"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">订单记录</p>
                  <p className="text-lg font-semibold text-green-600">查看详情</p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isWholesaler ? (
            <>
              <Link
                href="/dashboard/products"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-medium text-gray-700">管理商品</span>
              </Link>
              <Link
                href="/dashboard/products/new"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium text-gray-700">发布商品</span>
              </Link>
              <Link
                href="/dashboard/orders"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-medium text-gray-700">查看订单</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/market"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">市场选购</span>
              </Link>
              <Link
                href="/dashboard/my-orders"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">我的订单</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
