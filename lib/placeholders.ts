// Placeholder property photos, used until the backend supports image upload
// (planned: Cloudinary). These are generic interior/building shots already used
// by the mock data, hosted on images.unsplash.com (allowed in next.config.ts).

const PLACEHOLDER_PHOTO_IDS = [
  "1502672260266-1c1ef2d93688",
  "1522708323590-d24dbb6b0267",
  "1493809842364-78817add7ffb",
  "1484154218962-a197022b5858",
  "1505691938895-1758d7feb511",
  "1507089947368-19c1da9775ae",
  "1515263487990-61b07816b324",
  "1536376072261-38c75010e6c9",
] as const;

/** How many placeholder photos each property gets, so the gallery UI still has something to show. */
const PHOTOS_PER_PROPERTY = 3;

const photoUrl = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

/** Small, stable string hash so the same property always gets the same photos. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic placeholder photos for a property (stable across renders and server/client). */
export function placeholderImages(propertyId: string): string[] {
  const start = hash(propertyId) % PLACEHOLDER_PHOTO_IDS.length;
  return Array.from({ length: PHOTOS_PER_PROPERTY }, (_, i) =>
    photoUrl(PLACEHOLDER_PHOTO_IDS[(start + i) % PLACEHOLDER_PHOTO_IDS.length]),
  );
}
