import { getProjects, urlFor } from '$lib/sanityClient';

export async function load() {
    const data = await getProjects();
    const projects = data.map((project: any) => ({
        _id: project._id,
        title: project.title,
        description: project.description,
        details: project.details,
        tech: project.technologies || [],
        image: project.image ? urlFor(project.image).width(800).height(600).url() : '',
        imageSrcset: project.image
            ? `${urlFor(project.image).width(400).height(300).format('webp').url()} 400w, ${urlFor(project.image).width(800).height(600).format('webp').url()} 800w`
            : '',
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        featured: project.featured
    }));

    return { projects };
}
