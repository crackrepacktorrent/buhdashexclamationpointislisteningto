import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const raw = await platform?.env.KV.get('current-state');

	if (!raw) {
		return Response.json({ status: 'nothing' });
	}

	return Response.json(JSON.parse(raw));
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const authHeader = request.headers.get('Authorization');
	if (authHeader != `Bearer ${platform?.env.API_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}
	const body = await request.json();

	await platform?.env.KV.put('current-state', JSON.stringify(body));

	return new Response('OK');
};
