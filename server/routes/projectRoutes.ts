import express from "express";
import {
  createProject,
  createVideo,
  deleteProject,
  getAllPublishedProjects,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/auth.js";
import upload from "../configs/multer.js";
console.log("PROJECT ROUTES LOADED");
const projectRouter = express.Router();
console.log("PROJECT ROUTES LOADED");
projectRouter.get("/test", (req, res) => {
  res.json({ message: "Project router is working" });
});

projectRouter.post(
  "/create",
  upload.array("images", 2),
  protect,
  createProject,
);
projectRouter.post("/video", protect, createVideo);
projectRouter.get("/published", getAllPublishedProjects);
projectRouter.delete("/:projectId", protect, deleteProject);

export default projectRouter;
