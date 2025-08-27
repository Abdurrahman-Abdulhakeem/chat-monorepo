import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}