/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Update this with your GitHub repository name
  basePath: process.env.NODE_ENV === 'production' ? '/lister-project' : '',
  
  // The 'images' config needs to be at the top level, not inside experimental
  // In Next.js 15.3.1, this is the correct format
  unoptimizedImages: true,
};

module.exports = nextConfig; 