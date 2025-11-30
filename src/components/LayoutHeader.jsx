'use client'

import { useSelector, useDispatch } from 'react-redux'
import { Input, Button, Dropdown, Avatar, AutoComplete, Drawer, Select } from 'antd'
import { UserOutlined, LogoutOutlined, BookOutlined, LinkOutlined, PictureOutlined, MenuOutlined, TrophyOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { logout, login } from '@/redux/userSlice'
import API from '@/Service/API'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'
import GenreDropdown from './GenreDropdown'
import NotificationDropdown from './NotificationDropdown'
const allGenres = [
    'Bách Hợp', 'BE', 'Bình Luận Cốt Truyện', 'Chữa Lành', 'Cổ Đại', 'Cung Đấu', 'Cưới Trước Yêu Sau',
    'Cường Thủ Hào Đoạt', 'Dị Năng', 'Dưỡng Thê', 'Đam Mỹ', 'Điền Văn', 'Đô Thị', 'Đoản Văn', 'Đọc Tâm',
    'Gả Thay', 'Gia Đấu', 'Gia Đình', 'Gương Vỡ Không Lành', 'Gương Vỡ Lại Lành', 'Hài Hước', 'Hành Động',
    'Hào Môn Thế Gia', 'HE', 'Hệ Thống', 'Hiện Đại', 'Hoán Đổi Thân Xác', 'Học Bá', 'Học Đường',
    'Hư Cấu Kỳ Ảo', 'Huyền Huyễn', 'Không CP', 'Kinh Dị', 'Linh Dị', 'Mạt Thế', 'Mỹ Thực', 'Ngôn Tình',
    'Ngọt', 'Ngược', 'Ngược Luyến Tàn Tâm', 'Ngược Nam', 'Ngược Nữ', 'Nhân Thú', 'Niên Đại', 'Nữ Cường',
    'OE', 'Phép Thuật', 'Phiêu Lưu', 'Phương Đông', 'Phương Tây', 'Quy tắc', 'Sảng Văn', 'SE', 'Showbiz',
    'Sủng', 'Thanh Xuân Vườn Trường', 'Thức Tỉnh Nhân Vật', 'Tiên Hiệp', 'Tiểu Thuyết', 'Tổng Tài',
    'Trả Thù', 'Trinh thám', 'Trọng Sinh', 'Truy Thê', 'Vả Mặt', 'Vô Tri', 'Xuyên Không', 'Xuyên Sách'
]

const genreOptions = allGenres.map((genre) => ({
    label: genre,
    value: genre,
}))

export default function LayoutHeader() {
    const user = useSelector((state) => state.user.currentUser)
    const dispatch = useDispatch()
    const router = useRouter()
    const hasFetched = useRef(false)

    const [searchValue, setSearchValue] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [openDrawer, setOpenDrawer] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem("jwt")
        dispatch(logout())
    }

    const getInfoUser = async () => {
        try {
            const res = await API.User.info()
            if (res?.status === 200) {
                dispatch(login(res?.data))
            }
        } catch { }
    }

    useEffect(() => {
        if (!hasFetched.current && !user) {
            hasFetched.current = true
            getInfoUser()
        }
    }, [user])

    const fetchSuggestions = debounce(async (keyword) => {
        if (!keyword.trim()) return setSuggestions([])
        try {
            const res = await API.Story.list({ search: keyword })
            if (res?.data?.data) {
                const formatted = res.data.data.slice(0, 5).map((story) => ({
                    value: story.title,
                    label: (
                        <div className="flex gap-3 items-center">
                            <img src={story.coverImage} alt="cover" className="w-10 h-14 object-cover rounded" />
                            <div>
                                <div className="font-medium">{story.title}</div>
                                <div className="text-xs text-gray-500">{story.description?.slice(0, 60)}...</div>
                            </div>
                        </div>
                    ),
                    storyId: story._id,
                }))
                setSuggestions(formatted)
            }
        } catch {
            setSuggestions([])
        }
    }, 300)

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: <Link href="/profile"><UserOutlined className="mr-2" />Hồ sơ cá nhân</Link>,
            },
            {
                key: 'my-stories',
                label: <Link href="/my-stories"><BookOutlined className="mr-2" />Truyện của tôi</Link>,
            },
            {
                key: 'ranking',
                label: <Link href="/ranking"><TrophyOutlined className="mr-2" />Bảng xếp hạng</Link>,
            },
            {
                key: 'create-story',
                label: <Link href="/story/new"><BookOutlined className="mr-2" />Đăng truyện mới</Link>,
            },
            {
                key: 'logout',
                label: <button onClick={handleLogout} className="w-full text-left"><LogoutOutlined className="mr-2" />Đăng xuất</button>,
            },
        ],
    }

    return (
        <div className="w-full bg-[#FFEBCB] border-b px-4 py-2 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
                <MenuOutlined className="md:hidden text-lg" onClick={() => setOpenDrawer(true)} />
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <img src="https://cdn.jsdelivr.net/gh/joker18797/doctruyen_storage@main/uploads/1756106895153-z6768944788849_7bdce7562fe6f812db182c83bdc66ee0.jpg" alt="Logo" className="h-[60px] w-[60px] object-contain" />
                    <span className="text-xl font-bold text-violet-600 hidden md:block">Ổ của Dưa</span>
                </Link>
            </div>



            <div className="md:flex items-center flex-wrap gap-3">
                {/* Thanh tìm kiếm + Genre */}
                <div className="hidden md:flex flex-grow max-w-md gap-2">
                    <div className="mr-2">
                        <GenreDropdown />
                    </div>
                    <AutoComplete
                        className="w-full"
                        options={suggestions}
                        onSearch={(value) => {
                            setSearchValue(value)
                            fetchSuggestions(value)
                        }}
                        onSelect={(value, option) => {
                            if (option?.storyId) router.push(`/story/${option.storyId}`)
                        }}
                    >
                        <Input.Search
                            placeholder="Tìm kiếm truyện..."
                            allowClear
                            enterButton
                            onSearch={(value) => {
                                if (value.trim()) router.push(`/search?keyword=${value.trim()}`)
                            }}
                        />
                    </AutoComplete>
                </div>

                {/* Các button quản trị viên */}
                <div className="hidden max-[700px]:hidden md:flex gap-2">
                    {user?.role === 'admin' && (
                        <>
                            <Link href="/admin/users">
                                <Button type="dashed" icon={<UserOutlined />}>
                                    QL Người dùng
                                </Button>
                            </Link>
                            <Link href="/admin/ads">
                                <Button type="dashed" icon={<LinkOutlined />}>
                                    QL Quảng cáo
                                </Button>
                            </Link>
                            <Link href="/admin/banners">
                                <Button type="dashed" icon={<PictureOutlined />}>
                                    QL Banner
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Avatar hoặc login/register */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <NotificationDropdown />
                            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                                <div className="cursor-pointer flex items-center gap-2">
                                    <Avatar src={user.avatar} icon={!user.avatar && <UserOutlined />} />
                                    <span className="hidden sm:inline text-sm text-gray-700">{user.name}</span>
                                </div>
                            </Dropdown>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button>Đăng nhập</Button>
                            </Link>
                            <Link href="/register">
                                <Button type="primary">Đăng ký</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>


            <Drawer title="Tìm kiếm & Thể loại" placement="left" onClose={() => setOpenDrawer(false)} open={openDrawer}>
                <div className="mb-4">
                    <AutoComplete
                        className="w-full"
                        options={suggestions}
                        onSearch={(value) => {
                            setSearchValue(value)
                            fetchSuggestions(value)
                        }}
                        onSelect={(value, option) => {
                            if (option?.storyId) router.push(`/story/${option.storyId}`)
                        }}
                    >
                        <Input.Search
                            placeholder="Tìm kiếm truyện..."
                            allowClear
                            enterButton
                            onSearch={(value) => {
                                if (value.trim()) router.push(`/search?keyword=${value.trim()}`)
                            }}
                        />
                    </AutoComplete>
                </div>

                <Select
                    showSearch
                    placeholder="Chọn thể loại"
                    className="w-full"
                    options={genreOptions}
                    onChange={(value) => {
                        setOpenDrawer(false)
                        router.push(`/search?genre=${encodeURIComponent(value)}`)
                    }}
                />
                {user?.role === 'admin' && (
                    <div className="mt-6 flex flex-col space-y-3">
                        <Link href="/admin/users">
                            <Button block icon={<UserOutlined />}>
                                QL Người dùng
                            </Button>
                        </Link>
                        <Link href="/admin/ads">
                            <Button block icon={<LinkOutlined />}>
                                QL Quảng cáo
                            </Button>
                        </Link>
                        <Link href="/admin/banners">
                            <Button block icon={<PictureOutlined />}>
                                QL Banner
                            </Button>
                        </Link>
                    </div>
                )}

            </Drawer>
        </div>
    )
}
