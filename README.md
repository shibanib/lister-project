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

## Deployment Instructions

### Deploying to GitHub Pages

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy the build output to a docs folder:
   ```bash
   rm -rf docs && cp -R out docs
   ```

3. Create a `.nojekyll` file to bypass Jekyll processing:
   ```bash
   touch docs/.nojekyll
   ```

4. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Update deployment files"
   git push
   ```

5. Configure GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/docs" folder
   - Click "Save"

Your site will be available at: `https://[your-username].github.io/lister-project/`

## Troubleshooting Deployment Issues

If your deployed site has styling or layout issues:

1. Check that your `next.config.js` has the correct `basePath` and `assetPrefix` settings
2. Ensure all font references in CSS use the correct paths
3. Add explicit font-face declarations in your CSS for backup font loading
4. Check browser console for any 404 errors on CSS or font files

## License

MIT
