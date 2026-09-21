import { getProjects } from '$lib/sanityClient';
import { normalizeProject } from '$lib/projects';

export async function load() {
	let raw;

	try {
		raw = await getProjects();
	} catch (error) {
		// Don't take the whole page down for a CMS outage — but say what broke.
		console.error('Sanity fetch failed:', error);
		return { projects: [], cmsError: `Fetch: ${(error as Error)?.message ?? error}` };
	}

	try {
		return { projects: raw.map(normalizeProject), cmsError: '' };
	} catch (error) {
		// A bad image ref throws here, not in the fetch — don't blame the network.
		console.error('Sanity data could not be normalised:', error);
		return { projects: [], cmsError: `Data: ${(error as Error)?.message ?? error}` };
	}
}
