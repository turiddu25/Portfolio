import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
	projectId: 'tirssn7e',
	dataset: 'production',
	useCdn: true,
	apiVersion: '2024-01-01',
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
	return builder.image(source);
}

// GROQ query to fetch all projects
export async function getProjects() {
	const query = `*[_type == "project"] | order(order asc, _createdAt desc) {
		_id,
		title,
		slug,
		description,
		details,
		image,
		technologies,
		githubUrl,
		liveUrl,
		featured
	}`;
	return await client.fetch(query);
}

// GROQ query to fetch a single project by slug
export async function getProjectBySlug(slug: string) {
	const query = `*[_type == "project" && slug.current == $slug][0] {
		_id,
		title,
		slug,
		description,
		details,
		image,
		technologies,
		githubUrl,
		liveUrl,
		featured
	}`;
	return await client.fetch(query, { slug });
}
