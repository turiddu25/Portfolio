import { writable } from 'svelte/store';
import type { Project } from '$lib/projects';

export const activeProjectPreview = writable<Project | null>(null);

