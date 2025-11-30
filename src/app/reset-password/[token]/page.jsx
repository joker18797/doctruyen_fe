'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Form, Input, Card, Alert } from 'antd'
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const token = params?.token
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        if (!token) {
            toast.error('Token không hợp lệ')
            router.push('/forgot-password')
        }
    }, [token, router])

    const handleSubmit = async (values) => {
        try {
            setLoading(true)
            const res = await API.Auth.resetPassword(token, {
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            })
            if (res?.status === 200) {
                setSuccess(true)
                toast.success('Đặt lại mật khẩu thành công!')
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
                <LayoutHeader />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                    <Card className="w-full max-w-md shadow-xl text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircleOutlined className="text-3xl text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h1>
                        <p className="text-gray-600 mb-4">
                            Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...
                        </p>
                        <Link href="/login">
                            <Button type="primary" size="large">
                                Đăng nhập ngay
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <LayoutHeader />
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                <Card className="w-full max-w-md shadow-xl">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <LockOutlined className="text-3xl text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h1>
                        <p className="text-gray-600 text-sm">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                            ]}
                        >
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined />}
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                            >
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}

