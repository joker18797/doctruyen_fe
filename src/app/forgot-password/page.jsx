'use client'

import { useState } from 'react'
import { Button, Form, Input, Card } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const handleSubmit = async (values) => {
        try {
            setLoading(true)
            const res = await API.Auth.forgotPassword({ email: values.email })
            if (res?.status === 200) {
                toast.success(res.data.message || 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn')
                form.resetFields()
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <LayoutHeader />
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
                <Card className="w-full max-w-md shadow-xl">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <MailOutlined className="text-3xl text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h1>
                        <p className="text-gray-600 text-sm">
                            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                        </p>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                        >
                            <Input
                                size="large"
                                prefix={<MailOutlined />}
                                placeholder="Nhập email của bạn"
                                autoComplete="email"
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
                                Gửi link đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2">
                            <ArrowLeftOutlined />
                            <span>Quay lại đăng nhập</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}

