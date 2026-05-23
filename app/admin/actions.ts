"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const REPO = process.env.GITHUB_REPO ?? "safwanesalihi/Ayoub-Lamhamdi-portfolio";
const BRANCH = "main";
const FILE_PATH = "data/projects.json";

async function checkAuth() {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || !process.env.ADMIN_SECRET || token !== process.env.ADMIN_SECRET) {
    redirect("/admin");
  }
}

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=Wrong+password");
  }
  (await cookies()).set("admin_token", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete("admin_token");
  redirect("/admin");
}

async function getFile() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status} — check GITHUB_TOKEN`);
  const data = await res.json();
  return {
    content: JSON.parse(Buffer.from(data.content, "base64").toString("utf-8")),
    sha: data.sha as string,
  };
}

async function putFile(content: unknown, sha: string, message: string) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(JSON.stringify(content, null, 2) + "\n").toString("base64"),
        sha,
        branch: BRANCH,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `GitHub API ${res.status}`);
  }
}

function slugify(title: string, client: string) {
  return `${title}-${client}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function addProject(formData: FormData) {
  await checkAuth();

  const format = formData.get("format") as string;
  const title = formData.get("title") as string;
  const client = formData.get("client") as string;
  const vimeoId = (formData.get("vimeoId") as string).trim();
  const year = parseInt(formData.get("year") as string, 10);
  const role = formData.get("role") as string;
  const layout = (formData.get("layout") as string) || "half";
  const blurb = ((formData.get("blurb") as string) ?? "").trim();

  const project: Record<string, unknown> = {
    slug: slugify(title, client),
    client,
    title,
    year,
    role,
    format,
    vimeoId,
    layout,
  };
  if (blurb) project.blurb = blurb;

  let errorMsg = "";
  try {
    const { content, sha } = await getFile();
    const key = format === "film" ? "films" : "reels";
    content[key] = [...content[key], project];
    await putFile(content, sha, `Add project: ${title} (${client})`);
  } catch (e) {
    errorMsg = (e as Error).message;
  }

  if (errorMsg) redirect(`/admin?error=${encodeURIComponent(errorMsg)}`);
  redirect("/admin?success=1");
}

export async function deleteProject(formData: FormData) {
  await checkAuth();
  const slug = formData.get("slug") as string;

  let errorMsg = "";
  try {
    const { content, sha } = await getFile();
    content.films = (content.films as { slug: string }[]).filter((p) => p.slug !== slug);
    content.reels = (content.reels as { slug: string }[]).filter((p) => p.slug !== slug);
    await putFile(content, sha, `Remove project: ${slug}`);
  } catch (e) {
    errorMsg = (e as Error).message;
  }

  if (errorMsg) redirect(`/admin?error=${encodeURIComponent(errorMsg)}`);
  redirect("/admin?success=1");
}
