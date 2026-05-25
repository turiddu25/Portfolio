import { error } from '@sveltejs/kit';
import { getProjectBySlug, getProjects } from '$lib/sanityClient';
import { normalizeProject, type Project } from '$lib/projects';

export async function load({ params }) {
	const [projectData, projectsData] = await Promise.all([getProjectBySlug(params.slug), getProjects()]);

	if (!projectData) {
		throw error(404, 'Project not found');
	}

	const projects: Project[] = projectsData.map(normalizeProject);
	const project = normalizeProject(projectData);
	const currentIndex = projects.findIndex((item) => item.slug === project.slug);
	const nextProject = currentIndex >= 0 ? projects[(currentIndex + 1) % projects.length] : null;

	return {
		project,
		nextProject
	};
}
