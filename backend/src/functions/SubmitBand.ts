import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Bands } from '../shared/Tables.js';
import { CreateBandRequest, Band } from '../shared/types.js';
import { bandToEntity, generateId } from '../shared/utils.js';

export async function SubmitBand(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as CreateBandRequest;
        
        // Validate required fields
        if (!body.name || !body.description || !body.genres || body.genres.length === 0) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Bad Request',
                    message: 'Name, description, and at least one genre are required'
                })
            };
        }

        // Check if band with same name already exists
        try {
            const existingBands = Bands.listEntities({
                queryOptions: {
                    filter: `PartitionKey eq 'band' and name eq '${body.name.replace(/'/g, "''")}'`
                }
            });

            for await (const entity of existingBands) {
                return {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        error: 'Conflict',
                        message: 'A band with this name already exists'
                    })
                };
            }
        } catch (error) {
            context.log(`Error checking for existing band: ${error}`);
        }

        // Create new band entity
        const now = new Date().toISOString();
        const bandId = generateId();
        
        const newBand: Band = {
            id: bandId,
            name: body.name.trim(),
            description: body.description.trim(),
            genres: body.genres,
            location: body.location?.trim(),
            formed: body.formed?.trim(),
            website: body.website?.trim(),
            imageUrl: body.imageUrl?.trim(),
            members: body.members?.filter(m => m.trim()),
            safetyStatus: 'pending', // New bands start as pending
            reviewCount: 0,
            createdAt: now,
            updatedAt: now
        };

        // Convert to entity and save to table
        const bandEntity = bandToEntity(newBand);
        
        await Bands.createEntity(bandEntity);
        
        context.log(`Successfully created band: ${newBand.name} with ID: ${bandId}`);

        return {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'Band submitted successfully',
                bandId: bandId,
                band: newBand
            })
        };

    } catch (error) {
        context.log(`Error in SubmitBand: ${error}`);
        
        // Handle specific Azure Table Storage errors
        if (error.message && error.message.includes('EntityAlreadyExists')) {
            return {
                status: 409,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Conflict',
                    message: 'Band with this ID already exists'
                })
            };
        }

        return {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: 'Failed to submit band'
            })
        };
    }
};

app.http('SubmitBand', {
    methods: ['POST'],
    authLevel: 'function',
    handler: SubmitBand,
    route: 'bands'
});
