# The Lister - Neo-Brutalist Task Management

A web-based list-making tool with a neo-brutalist design aesthetic.

## Live Demo

Visit the live application at [https://shibanib.github.io/lister-project/](https://shibanib.github.io/lister-project/)

## Features

- Create, edit, and delete tasks
- Drag-and-drop to reorder tasks
- Task completion with strikethrough
- Persistent storage using localStorage
- Dark mode with custom color schemes
- Font customization
- Keyboard shortcuts
- Built-in visit counter
- Markdown export/import
- Pixel art celebrations when all tasks are completed
- Task shuffle feature (recommended for task inertia / ADHD procrastinators)

## Design

This application features a neo-brutalist design with:
- Bold, high-contrast styling with chunky elements
- Pixel art style buttons and icons
- Sharp edges and skewed elements
- Monochromatic color schemes with sepia and dark mode options

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- @dnd-kit for drag-and-drop functionality
- Custom pixel art animations

## Local Development

```bash
# Clone the repository
git clone https://github.com/shibanib/lister-project.git

# Navigate to directory
cd lister-project

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Keyboard Shortcuts

- **Enter**: Create a new item below the current one
- **Delete**: Remove the current item
- **Shift + ↑/↓**: Move item up/down

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
