# List Maker

A simple web-based list making tool built with Next.js and TypeScript.

## Features

- Create and manage lists with up to 100 items
- Drag and drop to reorder items
- Customize appearance:
  - Change background color
  - Change text color
  - Choose from 5 font options
  - Adjust font size
- Automatic saving to local storage
- Responsive design

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- dnd-kit (for drag and drop functionality)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project can be deployed to GitHub Pages. To deploy:

1. Update the `next.config.js` file with your repository name
2. Run:
   ```
   npm run build
   npm run export
   ```
3. Push the generated `out` directory to the `gh-pages` branch

## License

MIT
