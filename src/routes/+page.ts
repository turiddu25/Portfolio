import { getProjects } from '$lib/sanityClient';
import { normalizeProject } from '$lib/projects';

export async function load() {
	try {
		const data = await getProjects();
		return { projects: data.map(normalizeProject), cmsReachable: true };
	} catch (error) {
		// A CMS outage shouldn't take the whole page down — but it should say so
		// rather than looking like an empty portfolio.
		console.error('Failed to load projects from Sanity:', error);
		return { projects: [], cmsReachable: false };
	}
}
