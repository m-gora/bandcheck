import type { BandServiceImpl, ReviewServiceImpl } from '../../core/services/band.service';

export async function getBands(service: BandServiceImpl, req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || undefined;
  const genre = url.searchParams.get('genre') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const result = await service.getAllBands({ search, genre, limit, offset });
  return Response.json(result);
}

export async function getBandDetails(service: BandServiceImpl, req: Request, bandId: string) {
  const result = await service.getBandDetails(bandId);
  
  if (!result) {
    return Response.json(
      { error: 'Not Found', message: 'Band not found' },
      { status: 404 }
    );
  }

  return Response.json(result);
}

export async function createBand(service: BandServiceImpl, req: Request, user: any) {
  const body = await req.json();
  
  if (!body.name || !body.description || !body.genres || body.genres.length === 0) {
    return Response.json(
      { error: 'Bad Request', message: 'Name, description, and at least one genre are required' },
      { status: 400 }
    );
  }

  try {
    const band = await service.createBand(body, user.sub);
    return Response.json(band, { status: 201 });
  } catch (error: any) {
    if (error.message === 'A band with this name already exists') {
      return Response.json(
        { error: 'Conflict', message: error.message },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function createReview(service: ReviewServiceImpl, req: Request, bandId: string, user: any) {
  const body = await req.json();
  
  if (!body.safetyAssessment || !body.comment) {
    return Response.json(
      { error: 'Bad Request', message: 'Safety assessment and comment are required' },
      { status: 400 }
    );
  }

  try {
    const userName = user.name || user.email || 'Anonymous User';
    const review = await service.createReview(bandId, body, user.sub, userName, user.picture);
    return Response.json(review, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Band not found') {
      return Response.json(
        { error: 'Not Found', message: error.message },
        { status: 404 }
      );
    }
    throw error;
  }
}
