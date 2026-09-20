import { getProjects } from '$lib/sanityClient';
import { normalizeProject } from '$lib/projects';

export async function load() {
	try {
		const data = await getProjects();
		return { projects: data.map(normalizeProject) };
	} catch (error) {
		// A CMS outage shouldn't take the whole page down — render the rest.
		console.error('Failed to load projects from Sanity:', error);
		return { projects: [] };
	}
}
