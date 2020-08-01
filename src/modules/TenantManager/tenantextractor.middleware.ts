import { Request, Response } from 'express';

export function tenantExtractorMiddleware(
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/ban-types
  next: Function,
): void {
  const headerTenantAlias = req.header('x-tenant');
  if (headerTenantAlias) (req as any).tenantAlias = headerTenantAlias;
  else (req as any).tenantAlias = req.hostname;
  next();
}
