import {defineType, defineField} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      description: 'Brief description shown on the project card',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'details',
      title: 'Detailed Description',
      type: 'text',
      description: 'Full description shown in the modal',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Project Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of technologies used in this project',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      description: 'Link to the GitHub repository',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live Demo URL',
      type: 'url',
      description: 'Link to the live demo',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Mark this project as featured',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which projects are displayed (lower numbers first)',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      subtitle: 'description',
    },
  },
})
