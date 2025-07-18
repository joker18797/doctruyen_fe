/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://doctruyen-be-yn10.onrender.com/api/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'https://doctruyen-be-yn10.onrender.com/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
