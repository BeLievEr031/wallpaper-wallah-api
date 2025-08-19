import { Context } from "hono";
import { Bindings } from "../types/binding";
import { createCategorySchema } from "../validators/category.validator";

export const create = async (c: Context<{ Bindings: Bindings; }>) => {
    try {
        const categoryData = await c.req.json()
        const result = createCategorySchema.safeParse(categoryData)

        if (!result.success) {
            const message = result.error.message;
            console.log(result.error);
            return c.json({ error: result.error })
        }

        const obj = {
            ...categoryData,
            created_at: Date.now(),
            id: Date.now()
        }

        await c.env.WALLPAPER_WALLAH_KV.put(`category:${obj.id}`, JSON.stringify(obj))

        return c.json({
            message: "Category created successfully!!!"
        })

    } catch (error) {
        console.log("line 🔥🔥", error);
        return c.json({
            error
        })
    }
}