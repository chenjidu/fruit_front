'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return null
  }

  const isWholesaler = session.user.role === 'WHOLESALER'

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-green-600">
                水果批发
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/dashboard'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                首页
              </Link>
              {isWholesaler ? (
                <>
                  <Link
                    href="/dashboard/products"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/dashboard/products')
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    商品管理
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/dashboard/orders')
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    订单管理
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/market"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/dashboard/market')
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    市场选购
                  </Link>
                  <Link
                    href="/dashboard/my-orders"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith('/dashboard/my-orders')
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    我的订单
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {session.user.name}
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                {isWholesaler ? '批发商' : '商户'}
              </span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
