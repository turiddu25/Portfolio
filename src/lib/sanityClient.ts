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
		year,
		role,
		image,
		previewSvg,
		accentColour,
		gallery,
		technologies,
		githubUrl,
		liveUrl,
		featured
	}`;
	return await client.fetch(query);
}

