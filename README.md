# The Lister

<div align="center">
A simple web-based list making tool built with Next.js and TypeScript.

 <p>
    <img src="https://svgl.app/library/nextjs_icon_dark.svg" alt="Next.js" height="60" style="margin-right: 20px"/>
    and
    <img src="https://svgl.app/library/typescript.svg" alt="Typescript Logo" height="60" style="margin-left: 20px"/>
  </p>
</div>

## Features

- Create and manage lists with up to 100 items
- Drag and drop to reorder items
- Customize appearance:
  - Change background color
  - Change text color
  - Choose from 5 font options (including VG5000, Fogtwo No5, and Saira)
  - Adjust font size
- Automatic saving to local storage
- Dark/Light mode toggle
- Export and import lists as markdown
- Responsive design for mobile and desktop

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- dnd-kit (for drag and drop functionality)
- React 19

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

This project is automatically deployed to GitHub Pages using GitHub Actions:

1. The workflow is triggered on push to the main branch
2. It builds the Next.js project with the static export option
3. The output is automatically deployed to GitHub Pages

You can view the deployment workflow in `.github/workflows/deploy.yml`

## License

MIT

---

<div align="center">
  <p>Made with pair programming using Claude 3.7-sonnet and Cursor</p>
  <p>
    <img src="https://svgl.app/library/claude-ai-icon.svg" alt="Claude Logo" height="60" style="margin-right: 20px"/>
    and
    <img src="https://svgl.app/library/cursor_light.svg" alt="Cursor Logo" height="60" style="margin-left: 20px"/>
  </p>
</div>
