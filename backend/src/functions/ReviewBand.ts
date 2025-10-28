import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Bands, Reviews } from '../shared/Tables.js';
import { CreateReviewRequest, Review } from '../shared/types.js';
import { reviewToEntity, generateId, entityToReview, calculateSafetyStatus, bandToEntity, entityToBand } from '../shared/utils.js';

export async function ReviewBand(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const bandId = request.params.bandId;
        const body = await request.json() as CreateReviewRequest;
        
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

        // Validate required fields
        if (!body.safetyAssessment || !body.comment || !body.userId || !body.userDisplayName || !body.evidence || body.evidence.length === 0) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Bad Request',
                    message: 'Safety assessment, comment, user information, and at least one evidence item are required'
                })
            };
        }

        // Check if band exists
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

        // Check if user has already reviewed this band
        const existingReviews = Reviews.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${bandId}' and userId eq '${body.userId}'`
            }
        });

        for await (const entity of existingReviews) {
            return {
                status: 409,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Conflict',
                    message: 'User has already reviewed this band'
                })
            };
        }

        // Create new review
        const now = new Date().toISOString();
        const reviewId = generateId();
        
        const newReview: Review = {
            id: reviewId,
            bandId: bandId,
            userId: body.userId.trim(),
            userDisplayName: body.userDisplayName.trim(),
            safetyAssessment: body.safetyAssessment,
            comment: body.comment.trim(),
            evidence: body.evidence.filter(e => e.trim()),
            createdAt: now,
            updatedAt: now
        };

        // Convert to entity and save to table
        const reviewEntity = reviewToEntity(newReview);
        await Reviews.createEntity(reviewEntity);
        
        // Update band's review count and recalculate safety status
        const allReviews = [];
        const reviewEntities = Reviews.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${bandId}'`
            }
        });

        for await (const entity of reviewEntities) {
            try {
                const review = entityToReview(entity as any);
                allReviews.push(review);
            } catch (parseError) {
                context.log(`Error parsing review entity: ${parseError}`);
                continue;
            }
        }

        // Update band with new review count and safety status
        band.reviewCount = allReviews.length;
        band.safetyStatus = calculateSafetyStatus(allReviews);
        band.updatedAt = now;

        const updatedBandEntity = bandToEntity(band);
        await Bands.updateEntity(updatedBandEntity, 'Replace');
        
        context.log(`Successfully created review for band ${bandId} by user ${body.userId}`);

        return {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'Review submitted successfully',
                reviewId: reviewId,
                review: newReview,
                updatedBand: {
                    safetyStatus: band.safetyStatus,
                    reviewCount: band.reviewCount
                }
            })
        };

    } catch (error) {
        context.log(`Error in ReviewBand: ${error}`);
        
        // Handle specific Azure Table Storage errors
        if (error.message && error.message.includes('EntityAlreadyExists')) {
            return {
                status: 409,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Conflict',
                    message: 'Review with this ID already exists'
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
                message: 'Failed to submit review'
            })
        };
    }
};

app.http('ReviewBand', {
    methods: ['POST'],
    authLevel: 'function',
    handler: ReviewBand,
    route: 'bands/{bandId}/review'
});
