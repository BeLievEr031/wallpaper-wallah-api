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
            message: "Category created successfully!!!"
        })

    } catch (error) {
        return c.json({
            error: error instanceof Error ? error.message : String(error)
        }, 400)
    }
}