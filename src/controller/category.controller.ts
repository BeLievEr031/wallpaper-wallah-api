import { Context } from "hono";
import { Bindings } from "../types/binding";
import { createCategorySchema } from "../validators/category.validator";

export const create = async (c: Context<{ Bindings: Bindings; }>) => {
    try {
        const categoryData = await c.req.text()

        if (!categoryData) {
            return c.json({ error: "category required!!" }, 400)
        }
        let data = JSON.parse(categoryData)

        const result = createCategorySchema.safeParse(data)

        if (!result.success) {
            const message = result.error.message;
            return c.json({ error: message }, 400)
        }

        const obj = {
            ...data,
            created_at: Date.now(),
            id: Date.now()
        }

        await c.env.WALLPAPER_WALLAH_KV.put(`category:${obj.id}`, JSON.stringify(obj))

        return c.json({
            message: "Category created successfully!!!",
            obj
        })

    } catch (error) {
        return c.json({
            error: error instanceof Error ? error.message : String(error)
        }, 400)
    }
}


export const listCategories = async (c: Context<{ Bindings: Bindings }>) => {
    try {
        const limit = Number(c.req.query("limit") || 10)
        const cursor = c.req.query("cursor")

        const cache = caches.default
        const cacheKey = new Request(c.req.url)

        let response = await cache.match(cacheKey)
        if (response) {
            return response;
        }


        const list = await c.env.WALLPAPER_WALLAH_KV.list({
            prefix: "category:",
            limit,
            cursor: cursor || undefined
        })

        const categories = await Promise.all(
            list.keys.map((k) => c.env.WALLPAPER_WALLAH_KV.get(k.name, "json"))
        )

        response = Response.json({ categories })

        response.headers.append("Cache-Control", "max-age=84000")
        await cache.put(cacheKey, response.clone())

        return response

    } catch (error) {
        return c.json({
            error: error instanceof Error ? error.message : String(error)
        }, 400)
    }
}


export const deleteCategory = async (c: Context<{ Bindings: Bindings }>) => {
    try {
        const id = c.req.param("id"); // assuming route like /categories/:id

        if (!id) {
            return c.json({ error: "Category ID required" }, 400);
        }

        const key = `category:${id}`;

        // check if category exists
        const existing = await c.env.WALLPAPER_WALLAH_KV.get(key);
        if (!existing) {
            return c.json({ error: "Category not found" }, 404);
        }

        // delete from KV
        await c.env.WALLPAPER_WALLAH_KV.delete(key);

        // also clear cache for this route if needed
        const cache = caches.default;
        const cacheKey = new Request(c.req.url);
        await cache.delete(cacheKey);

        return c.json({
            message: "Category deleted successfully!",
            id,
        });
    } catch (error) {
        return c.json(
            {
                error: error instanceof Error ? error.message : String(error),
            },
            400
        );
    }
};
