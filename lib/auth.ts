import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export const authenticateToken = async (request: NextRequest): Promise<JWTPayload | null> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    return null;
  }
};

type RouteHandler<Params = unknown> = (
  request: NextRequest,
  ctx: { params?: Params }
) => Promise<NextResponse> | NextResponse;

export const requireAuth = <Params = unknown>(handler: RouteHandler<Params>, allowedRoles?: string[]) => {
  return async (request: NextRequest, ctx?: { params?: Params }) => {
    const user = await authenticateToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Add user to request
    (request as AuthenticatedRequest).user = user;
    
    return await handler(request, (ctx ?? {}) as { params?: Params });
  };
};

export const requireRole = (roles: string[]) => {
  return <Params = unknown>(handler: RouteHandler<Params>) => requireAuth<Params>(handler, roles);
};
