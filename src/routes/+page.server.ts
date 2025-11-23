import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, depends }) => {
	depends('app:state');

	if (!platform?.env?.KV) {
		return { status: 'nothing' };
	}

	const raw = await platform.env.KV.get('current-state');

	if (!raw) {
		return { status: 'nothing' };
	}

	return JSON.parse(raw);
};
