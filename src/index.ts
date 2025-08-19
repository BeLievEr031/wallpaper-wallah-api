import { Hono } from 'hono'
import categoryRoute from './routes/category.route'

const app = new Hono()

app.route("/category", categoryRoute)

export default app
