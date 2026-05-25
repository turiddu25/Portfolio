import { getProjects } from '$lib/sanityClient';
import { normalizeProject } from '$lib/projects';

export async function load() {
	const data = await getProjects();
	const projects = data.map(normalizeProject);

	return { projects };
}
