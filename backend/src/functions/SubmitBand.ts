import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Reviews } from '../shared/Tables';

export async function SubmitBand(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json();

    Reviews.createEntity({
        partitionKey: '',
        rowKey: '',
    });

    return { body: `Hello, ${name}!` };
};

app.http('SubmitBand', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: SubmitBand,
    route: '/bands'
});
