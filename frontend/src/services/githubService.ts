// Server-side GitHub showcase data. Fetched with ISR-style revalidation so
// the public page never blocks on GitHub and unauthenticated rate limits
// (60 req/h) are a non-issue. Set GITHUB_TOKEN to raise the limit.

const GITHUB_API = "https://api.github.com";
const REVALIDATE_SECONDS = 3600;

export interface GitHubRepo {
  name: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
}

export interface GitHubShowcaseData {
  username: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  totalForks: number;
  topRepos: GitHubRepo[];
  /** Language → repo count, sorted descending, top 6 */
  languages: [string, number][];
}

interface RawRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  updated_at: string;
}

export function extractGitHubUsername(githubUrl: string | undefined | null): string | null {
  if (!githubUrl) return null;
  const match = githubUrl.match(/github\.com\/([A-Za-z0-9-]+)/i);
  return match ? match[1] : null;
}

export async function getGitHubShowcase(
  username: string
): Promise<GitHubShowcaseData | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-site",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}`, {
        headers,
        next: { revalidate: REVALIDATE_SECONDS },
      }),
      fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, {
        headers,
        next: { revalidate: REVALIDATE_SECONDS },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) return null;

    const user = (await userRes.json()) as {
      public_repos: number;
      followers: number;
      html_url: string;
    };
    const rawRepos = (await reposRes.json()) as RawRepo[];

    const ownRepos = rawRepos.filter((r) => !r.fork && !r.archived);

    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = ownRepos.reduce((sum, r) => sum + r.forks_count, 0);

    const languageCounts = new Map<string, number>();
    for (const repo of ownRepos) {
      if (repo.language) {
        languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
      }
    }

    const topRepos = [...ownRepos]
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          +new Date(b.updated_at) - +new Date(a.updated_at)
      )
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        description: r.description,
        htmlUrl: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.updated_at,
      }));

    return {
      username,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars,
      totalForks,
      topRepos,
      languages: [...languageCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    };
  } catch {
    return null;
  }
}
