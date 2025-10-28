import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Bands, Reviews } from '../shared/Tables.js';
import { GetBandDetailsResponse } from '../shared/types.js';
import { entityToBand, entityToReview } from '../shared/utils.js';

export async function GetBandDetails(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const bandId = request.params.bandId;
        
        if (!bandId) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Bad Request',
                    message: 'Band ID is required'
                })
            };
        }

        context.log(`Getting details for band: ${bandId}`);

        // Get band details
        let band;
        try {
            const bandEntity = await Bands.getEntity('band', bandId);
            band = entityToBand(bandEntity as any);
        } catch (error) {
            context.log(`Band not found: ${bandId}`);
            return {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Not Found',
                    message: 'Band not found'
                })
            };
        }

        // Get reviews for this band
        const reviewEntities = Reviews.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${bandId}'`
            }
        });

        const reviews = [];
        for await (const entity of reviewEntities) {
            try {
                const review = entityToReview(entity as any);
                reviews.push(review);
            } catch (parseError) {
                context.log(`Error parsing review entity: ${parseError}`);
                continue;
            }
        }

        // Sort reviews by creation date (newest first)
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const response: GetBandDetailsResponse = {
            band,
            reviews
        };

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        };

    } catch (error) {
        context.log(`Error in GetBandDetails: ${error}`);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: 'Failed to retrieve band details'
            })
        };
    }
};

app.http('GetBandDetails', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetBandDetails,
    route: 'bands/{bandId}'
});
