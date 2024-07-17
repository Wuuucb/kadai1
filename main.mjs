import fs from "node:fs";
import express from "express";
import { PrismaClient } from "@prisma/client";
import escapeHTML from "escape-html";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
const prisma = new PrismaClient();

const template = fs.readFileSync("./template.html", "utf-8");
app.get("/", async (request, response) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const html = template.replace(
    "<!-- posts -->",
    posts.map((post) => 
      `<li>
        <strong>${escapeHTML(post.author)}</strong> 
        at ${new Date(post.createdAt).toLocaleString()}:
        ${escapeHTML(post.message)}
      </li>`
    ).join("")
  );
  response.send(html);
});

app.post("/send", async (request, response) => {
  const { message, author } = request.body;
  await prisma.post.create({
    data: { message, author },
  });
  response.redirect("/");
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});