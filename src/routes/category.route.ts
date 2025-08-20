import { Hono } from "hono";
import { Bindings } from "../types/binding";
import { create, listCategories } from "../controller/category.controller";



const categoryRoute = new Hono<{ Bindings: Bindings }>();

categoryRoute.post("/", create)
categoryRoute.get("/", listCategories)


export default categoryRoute;