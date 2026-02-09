'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'MERCHANT',
    businessName: '',
    address: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '注册失败')
        return
      }

      router.push('/auth/signin?registered=true')
    } catch (error) {
      setError('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const nextStep = () => {
    if (step === 1 && !formData.name) {
      setError('请输入姓名')
      return
    }
    if (step === 1 && !formData.email) {
      setError('请输入邮箱')
      return
    }
    if (step === 1 && !formData.phone) {
      setError('请输入手机号')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">果</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">鲜果批发</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">创建新账户</h2>
            <p className="mt-2 text-gray-600">加入我们，开启您的水果生意</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">基本信息</span>
              </div>
              <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step > 2 ? <Check className="h-5 w-5" /> : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">账户设置</span>
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-green-600 rounded transition-all duration-300"
                style={{ width: `${step === 1 ? '50%' : '100%'}` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="您的姓名"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱 *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    手机号 *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="13800138000"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    账户类型 *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'MERCHANT' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        formData.role === 'MERCHANT' 
                          ? 'border-green-600 bg-green-50 text-green-700' 
                          : 'border-gray-300 text-gray-700 hover:border-green-600'
                      }`}
                    >
                      我是商户
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'WHOLESALER' })}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        formData.role === 'WHOLESALER' 
                          ? 'border-green-600 bg-green-50 text-green-700' 
                          : 'border-gray-300 text-gray-700 hover:border-green-600'
                      }`}
                    >
                      我是批发商
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium"
                >
                  下一步
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {formData.role === 'WHOLESALER' && (
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                      企业名称 *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required={formData.role === 'WHOLESALER'}
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="您的企业名称"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    地址
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="您的地址"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密码 *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="至少6位密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码 *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="再次输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    上一步
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '注册中...' : '完成注册'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            已有账户？{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              立即登录
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          注册即表示您同意我们的{' '}
          <a href="#" className="text-green-600 hover:text-green-500">服务条款</a>
          {' '}和{' '}
          <a href="#" className="text-green-600 hover:text-green-500">隐私政策</a>
        </p>
      </div>
    </div>
  )
}
