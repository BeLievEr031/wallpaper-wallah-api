import { Hono } from "hono";
import { Bindings } from "../types/binding";
import { create } from "../controller/category.controller";



const categoryRoute = new Hono<{ Bindings: Bindings }>();

categoryRoute.post("/", create)


export default categoryRoute;