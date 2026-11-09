// Public categories (Postman folder "Public"). Admin category management lives in admin.ts.

import type { AxiosInstance } from "axios";
import type { CategoryDTO } from "../dto";
import { unwrap } from "../http";
import { toCategory, type MappedCategory } from "../mappers";

/** GET /api/categories (no auth). */
export async function listCategories(api: AxiosInstance): Promise<MappedCategory[]> {
  return (await unwrap<CategoryDTO[]>(api.get("/categories"))).map(toCategory);
}
