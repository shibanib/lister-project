/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Update this to your actual repository name
  basePath: process.env.NODE_ENV === 'production' ? '/lister-project' : '',
  images: {
    unoptimized: true,
  },
  // This setting helps with GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/lister-project/' : '',
  trailingSlash: true,
};

module.exports = nextConfig; 