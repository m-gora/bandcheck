import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function ReviewBand(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

app.http('ReviewBand', {
    methods: ['POST'],
    authLevel: 'function',
    handler: ReviewBand,
    route: '/bands/{bandId}/review'
});
