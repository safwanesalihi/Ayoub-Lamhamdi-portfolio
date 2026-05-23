"use server";

const REPO = process.env.GITHUB_REPO ?? "safwanesalihi/Ayoub-Lamhamdi-portfolio";
const BRANCH = "main";
const FILE_PATH = "data/projects.json";

type Result = { success: boolean; error?: string };

function authorize(formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }
}

export async function verifyLogin(_: unknown, formData: FormData): Promise<Result> {
  const password = formData.get("password") as string;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Wrong password" };
  }
  return { success: true };
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

export async function addProject(_: unknown, formData: FormData): Promise<Result> {
  try {
    authorize(formData);

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

    const { content, sha } = await getFile();
    const key = format === "film" ? "films" : "reels";
    content[key] = [...content[key], project];
    await putFile(content, sha, `Add project: ${title} (${client})`);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteProject(_: unknown, formData: FormData): Promise<Result> {
  try {
    authorize(formData);
    const slug = formData.get("slug") as string;

    const { content, sha } = await getFile();
    content.films = (content.films as { slug: string }[]).filter((p) => p.slug !== slug);
    content.reels = (content.reels as { slug: string }[]).filter((p) => p.slug !== slug);
    await putFile(content, sha, `Remove project: ${slug}`);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
