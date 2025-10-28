import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Bands } from '../shared/Tables.js';
import { GetBandsResponse } from '../shared/types.js';
import { entityToBand } from '../shared/utils.js';

export async function GetBands(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get query parameters for search and filtering
        const search = request.query.get('search') || '';
        const genre = request.query.get('genre') || '';
        const limit = parseInt(request.query.get('limit') || '50');
        const offset = parseInt(request.query.get('offset') || '0');

        context.log(`Searching bands with search: "${search}", genre: "${genre}"`);

        // Query all bands from the table
        const entities = Bands.listEntities({
            queryOptions: {
                filter: `PartitionKey eq 'band'`
            }
        });

        const allBands = [];
        for await (const entity of entities) {
            try {
                const band = entityToBand(entity as any);
                
                // Apply search filter
                if (search && !band.name.toLowerCase().includes(search.toLowerCase()) && 
                    !band.description.toLowerCase().includes(search.toLowerCase())) {
                    continue;
                }

                // Apply genre filter
                if (genre && !band.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))) {
                    continue;
                }

                allBands.push(band);
            } catch (parseError) {
                context.log(`Error parsing band entity: ${parseError}`);
                continue;
            }
        }

        // Sort by name alphabetically
        allBands.sort((a, b) => a.name.localeCompare(b.name));

        // Apply pagination
        const paginatedBands = allBands.slice(offset, offset + limit);

        const response: GetBandsResponse = {
            bands: paginatedBands,
            total: allBands.length
        };

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        };

    } catch (error) {
        context.log(`Error in GetBands: ${error}`);
        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: 'Failed to retrieve bands'
            })
        };
    }
};

app.http('GetBands', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetBands,
    route: 'bands'
});
