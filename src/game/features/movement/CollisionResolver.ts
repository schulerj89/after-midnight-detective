export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionBody {
  halfWidth: number;
  halfHeight: number;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function bodyRect(position: Point, body: CollisionBody): Rect {
  return {
    x: position.x - body.halfWidth,
    y: position.y - body.halfHeight,
    width: body.halfWidth * 2,
    height: body.halfHeight * 2,
  };
}

function clampPoint(
  point: Point,
  body: CollisionBody,
  bounds: Rect,
): Point {
  return {
    x: Math.min(
      bounds.x + bounds.width - body.halfWidth,
      Math.max(bounds.x + body.halfWidth, point.x),
    ),
    y: Math.min(
      bounds.y + bounds.height - body.halfHeight,
      Math.max(bounds.y + body.halfHeight, point.y),
    ),
  };
}

export function resolveMovement(
  position: Point,
  delta: Point,
  body: CollisionBody,
  bounds: Rect,
  obstacles: readonly Rect[],
): Point {
  let next = clampPoint({ x: position.x + delta.x, y: position.y }, body, bounds);
  if (obstacles.some((obstacle) => overlaps(bodyRect(next, body), obstacle))) {
    next = { ...position };
  }

  const vertical = clampPoint({ x: next.x, y: position.y + delta.y }, body, bounds);
  if (!obstacles.some((obstacle) => overlaps(bodyRect(vertical, body), obstacle))) {
    next = vertical;
  }

  return next;
}
