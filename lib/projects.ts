import fs from "fs";
import path from "path";
import matter, { type GrayMatterFile } from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "projects");

export function getAllProjectIds(): Array<string> {
  const fileNames = fs.readdirSync(projectsDirectory);

  return fileNames.map((fileName) => fileName.replace(/\.md$/, ""));
}

export type Project = {
  id: string | string[];
  content: string;
  title: string;
  date: string;
  type: string;
} | null;

export function getProjectData(id: string | string[] | undefined): Project {
  if (id == null) return null;

  const fullPath = path.join(projectsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Combine the data with the id
  return {
    id,
    content: matterResult.content,
    ...matterResult.data,
  } as Project;
}
