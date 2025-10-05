# Sanity CMS Setup Guide

## What's Been Done

### 1. **Sanity Schema Created** ✓
- Location: `sanity/schemaTypes/project.ts`
- Fields included:
  - `title` - Project name
  - `slug` - URL-friendly identifier
  - `description` - Short description for project cards
  - `details` - Full description for modal
  - `image` - Project screenshot/image
  - `technologies` - Array of tech stack items
  - `githubUrl` - Link to GitHub repo (optional)
  - `liveUrl` - Link to live demo (optional)
  - `featured` - Mark as featured project
  - `order` - Display order

### 2. **Sanity Client Created** ✓
- Location: `src/lib/sanityClient.ts`
- Functions:
  - `getProjects()` - Fetch all projects
  - `getProjectBySlug(slug)` - Fetch single project
  - `urlFor(image)` - Generate optimized image URLs

### 3. **Components Updated** ✓
- **ProjectGrid.svelte**: Fetches projects from Sanity on page load
- **ProjectModal.svelte**: Shows GitHub/Live Demo buttons conditionally

## How to Use

### Starting Sanity Studio

```bash
cd sanity
npm run dev
```

This will open Sanity Studio (usually at http://localhost:3333)

### Adding a New Project

1. Open Sanity Studio
2. Click "Project" in the sidebar
3. Click "Create new Project"
4. Fill in all fields:
   - **Title**: Your project name
   - **Slug**: Click "Generate" to auto-create from title
   - **Short Description**: Brief text for the project card (max 200 chars)
   - **Detailed Description**: Full description for the modal
   - **Project Image**: Upload a screenshot or preview image
   - **Technologies**: Add each tech as a separate item (e.g., "React", "Node.js")
   - **GitHub URL**: (Optional) Link to your repo
   - **Live Demo URL**: (Optional) Link to the deployed site
   - **Featured Project**: Toggle if this should be highlighted
   - **Display Order**: Lower numbers appear first (0, 1, 2, etc.)
5. Click "Publish"

### Data Structure

Your frontend expects this format:
```javascript
{
  _id: "unique-id",
  title: "Project Title",
  description: "Short description",
  details: "Long detailed description",
  tech: ["React", "Node.js", "MongoDB"],
  image: "https://cdn.sanity.io/...",
  githubUrl: "https://github.com/...",
  liveUrl: "https://yoursite.com"
}
```

### Image Optimization

Images are automatically optimized:
- Width: 800px
- Height: 600px
- Format: Converted to WebP for performance
- CDN: Served from Sanity's global CDN

## Configuration

Your Sanity project:
- **Project ID**: `tirssn7e`
- **Dataset**: `production`
- **API Version**: `2024-01-01`

## Next Steps

1. ✅ Sanity packages installed
2. ✅ Schema created
3. ✅ Client configured
4. ✅ Components updated
5. 🔲 Start Sanity Studio and add your first project
6. 🔲 Test the integration in your dev environment

## Troubleshooting

**Issue**: Projects not showing
- Check browser console for errors
- Verify Sanity Studio has published projects
- Ensure project ID matches in `sanityClient.ts`

**Issue**: Images not loading
- Check that images are uploaded in Sanity
- Verify `urlFor()` is generating valid URLs
- Check browser network tab for 404s

**Issue**: Missing GitHub/Live buttons
- These only show if URLs are provided in Sanity
- Check conditional rendering in `ProjectModal.svelte`
