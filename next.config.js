/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Update this with your GitHub repository name
  basePath: process.env.NODE_ENV === 'production' ? '/lister-project' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 