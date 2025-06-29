'use client'

import { useRouter } from 'next/navigation'

import { Button } from 'antd'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '@/redux/userSlice'

export default function Login() {
    const dispatch = useDispatch()
    const router = useRouter()
    const [form, setForm] = useState({ email: '', password: '' })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Đăng nhập với:', form);
        const userData = { name: 'Danh Bùi', email: 'danh@example.com', role: 'admin' };
        localStorage.setItem('user', JSON.stringify(userData))
        dispatch(login(userData))
        router.push('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-md rounded-xl w-full max-w-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                        />
                    </div>
                    <div className="pt-2">
                        <Button type="primary" htmlType="submit" block>
                            Đăng nhập
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
