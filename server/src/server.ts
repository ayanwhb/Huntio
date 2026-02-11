import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import authRouter from "./routes/auth.route.js";
import applicationRouter from "./routes/applications.route.js";
import userRouter from "./routes/users.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(requestLogger);
app.use("/auth", authRouter);
app.use("/applications", applicationRouter);
app.use("/users", userRouter);

app.get("/", async (req: Request, res: Response) => {
	return res.status(StatusCodes.OK).json({ message: "Hello World!" });
});

export default app;
