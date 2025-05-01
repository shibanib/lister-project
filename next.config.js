/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Update this with your GitHub repository name
  basePath: process.env.NODE_ENV === 'production' ? '/lister-project' : '',
  
  // In Next.js 15.3.1, the correct way to handle unoptimized images
  experimental: {
    images: {
      unoptimized: true
    }
  }
};

module.exports = nextConfig; 