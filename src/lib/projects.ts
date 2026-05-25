import { urlFor } from '$lib/sanityClient';

export type Project = {
	_id: string;
	title: string;
	slug: string;
	description: string;
	details: string;
	year: string;
	role: string;
	tech: string[];
	image: string;
	imageSrcset: string;
	previewImage: string;
	heroImage: string;
	gallery: string[];
	githubUrl?: string;
	liveUrl?: string;
	featured?: boolean;
};

function imageUrl(source: unknown, width: number, height?: number) {
	let builder = urlFor(source).width(width).auto('format');
	if (height) builder = builder.height(height);
	return builder.url();
}

function imageSrcset(source: unknown, ratio: 'landscape' | 'hero' = 'landscape') {
	const sizes =
		ratio === 'hero'
			? [
					[900, 600],
					[1400, 900],
					[2000, 1200]
				]
			: [
					[400, 300],
					[800, 600],
					[1200, 900]
				];

	return sizes.map(([width, height]) => `${imageUrl(source, width, height)} ${width}w`).join(', ');
}

export function normalizeProject(project: any): Project {
	const image = project.image;
	const slug = typeof project.slug === 'string' ? project.slug : project.slug?.current;

	return {
		_id: project._id,
		title: project.title,
		slug: slug || project._id,
		description: project.description,
		details: project.details,
		year: project.year || '',
		role: project.role || '',
		tech: project.technologies || [],
		image: image ? imageUrl(image, 800, 600) : '',
		imageSrcset: image ? imageSrcset(image) : '',
		previewImage: image ? imageUrl(image, 600, 450) : '',
		heroImage: image ? imageUrl(image, 1600, 950) : '',
		gallery: (project.gallery || []).map((item: unknown) => imageUrl(item, 1400, 900)),
		githubUrl: project.githubUrl,
		liveUrl: project.liveUrl,
		featured: project.featured
	};
}

