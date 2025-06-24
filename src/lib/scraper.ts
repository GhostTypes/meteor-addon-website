
import { promises as fs } from 'fs';
import path from 'path';
import type { Addon } from '@/types';

const GITHUB_API_URL = 'https://api.github.com';

const INVITE_RE = /((?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li|com)|discordapp\.com\/invite|dsc\.gg)\/[a-zA-Z0-9-]+)/g;
const FEATURE_RE = /(?:add\(new )([A-Z][A-Za-z0-9_]+)(?:\s*\(.*\)\s*)/g;

async function readJsonFile(filePath: string, defaultValue: any = []) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

// This function's only job is to scrape everything from GitHub.
// It does not read or write to the local addon file.
export const scrapeAllAddons = async (): Promise<Addon[]> => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable not set.');
  }
  
  const HEADERS = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MeteorAddons/1.0',
  };

  const fetchOptions = { headers: HEADERS };
  const fetchOptionsNoHeaders = {};

  console.log('Starting full scrape from GitHub...');

  const verifiedPath = path.join(process.cwd(), 'src', 'data', 'verified.json');
  const injectPath = path.join(process.cwd(), 'src', 'data', 'inject.json');
  const blacklistPath = path.join(process.cwd(), 'src', 'data', 'blacklist.json');

  const [verifiedList, injectData, blacklist] = await Promise.all([
    readJsonFile(verifiedPath),
    readJsonFile(injectPath, {}),
    readJsonFile(blacklistPath),
  ]);

  let repos = new Set<string>(verifiedList);

  const queries = [
    'q=entrypoints+meteor+extension:json+filename:fabric.mod.json+in:file&per_page=100',
    'q=extends+MeteorAddon+language:java+in:file&per_page=100',
  ];

  for (const query of queries) {
    let page = 1;
    while (page <= 10) { 
      try {
        const url = `${GITHUB_API_URL}/search/code?${query}&page=${page}`;
        const res = await fetch(url, fetchOptions);
        if (!res.ok) {
           const errorBody = await res.json().catch(() => ({}));
           console.error(`GitHub API error for query "${query}" on page ${page}: ${res.status} ${res.statusText}`, errorBody);
           break;
        }
        const data = await res.json();
        for (const item of data.items) {
          if (item.repository && !item.repository.private) {
            repos.add(item.repository.full_name);
          }
        }
        if (data.items.length < 100) break;
        page++;
      } catch (e) {
        console.error(`Failed to fetch page ${page} for query: ${query}`, e);
        break;
      }
    }
  }

  const repoList = Array.from(repos).filter(name => name && !blacklist.includes(name));
  const addons: Addon[] = [];
  const BATCH_SIZE = 10;
  console.log(`Found ${repoList.length} unique repos. Processing in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < repoList.length; i += BATCH_SIZE) {
    const batch = repoList.slice(i, i + BATCH_SIZE);
    const promises = batch.map(repoName =>
      parseRepo(repoName, verifiedList.includes(repoName), injectData, fetchOptions, fetchOptionsNoHeaders)
        .catch(e => {
          console.error(`Error processing repo ${repoName}:`, e);
          return null;
        })
    );
    
    const results = await Promise.all(promises);
    for (const addon of results) {
        if (addon) {
            addons.push(addon);
        }
    }
    console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(repoList.length/BATCH_SIZE)}. Total addons so far: ${addons.length}`);
  }

  console.log(`Scraping finished. Total valid addons found: ${addons.length}`);
  
  // Handle duplicates
  console.log('Deduplicating addons...');
  const addonGroups = new Map<string, Addon[]>();

  for (const addon of addons) {
      if (!addon.name) continue; // Skip addons without a name
      const key = addon.name.toLowerCase();
      if (!addonGroups.has(key)) {
          addonGroups.set(key, []);
      }
      addonGroups.get(key)!.push(addon);
  }

  const finalAddons: Addon[] = [];
  for (const group of addonGroups.values()) {
      if (group.length === 1) {
          finalAddons.push(group[0]);
      } else {
          // Sort to find the "best" one
          group.sort((a, b) => {
              // Higher stars is better
              if (b.stars !== a.stars) return b.stars - a.stars;
              // Higher downloads is better
              if (b.downloads !== a.downloads) return b.downloads - a.downloads;
              // Newer update is better
              return new Date(b.last_update).getTime() - new Date(a.last_update).getTime();
          });
          console.log(`Found duplicate for "${group[0].name}". Keeping ${group[0].id}, removing ${group.slice(1).map(a => a.id).join(', ')}.`);
          finalAddons.push(group[0]);
      }
  }
  
  console.log(`Deduplication complete. Final addon count: ${finalAddons.length}`);

  return finalAddons;
};


async function parseRepo(name: string, isVerified: boolean, injectData: any, fetchOptions: any, fetchOptionsNoHeaders: any): Promise<Addon | null> {
  try {
    const repoRes = await fetch(`${GITHUB_API_URL}/repos/${name}`, fetchOptions);
    if (!repoRes.ok) {
        console.warn(`Skipping ${name}: Failed to fetch repo data (Status: ${repoRes.status})`);
        return null;
    }
    const repo = await repoRes.json();

    const fabricModUrl = `https://raw.githubusercontent.com/${name}/${repo.default_branch}/src/main/resources/fabric.mod.json`;
    const fabricRes = await fetch(fabricModUrl, fetchOptionsNoHeaders);
    if (!fabricRes.ok) return null;
    
    const fabric = await fabricRes.json();
    if (!fabric.entrypoints || !fabric.entrypoints.meteor) return null;
    
    // Explicitly ignore "Addon Template" by name
    if (fabric.name === 'Addon Template') {
        console.log(`Filtering out exact match 'Addon Template' from repo '${name}'.`);
        return null;
    }

    let authors = fabric.authors?.filter((a: any) => typeof a === 'string') || [];
    if (authors.length === 0) authors.push(repo.owner.login);

    const links: Addon['links'] = { github: repo.html_url };
    const summary = repo.description || fabric.description || 'No description available.';

    const releasesRes = await fetch(`${GITHUB_API_URL}/repos/${name}/releases`, fetchOptions);
    let downloads = 0;
    if (releasesRes.ok) {
        const releases = await releasesRes.json();
        for (const release of releases) {
            const asset = release.assets?.find((a: any) => a.name.endsWith('.jar') && !a.name.endsWith('-dev.jar') && !a.name.endsWith('-sources.jar'));
            if (asset) {
                links.download = asset.browser_download_url;
                downloads = releases.reduce((sum: number, r: any) => sum + (r.assets?.find((a:any) => a.name.endsWith('.jar'))?.download_count || 0), 0);
                break;
            }
        }
    }

    let icon: string | null = null;
    const iconPath = fabric.icon ? `https://raw.githubusercontent.com/${name}/${repo.default_branch}/src/main/resources/${fabric.icon}` : null;
    if (iconPath) {
      try {
        const iconRes = await fetch(iconPath, fetchOptionsNoHeaders);
        if (iconRes.ok) {
          const buffer = Buffer.from(await iconRes.arrayBuffer());
          const iconDir = path.join(process.cwd(), 'public', 'addon-icons');
          await fs.mkdir(iconDir, { recursive: true });
          const sanitizedName = name.replace(/[\/\\]/g, '_');
          const contentType = iconRes.headers.get('content-type') || 'image/png';
          const extension = contentType.includes('gif') ? 'gif' : 'png';
          const iconFilename = `${sanitizedName}.${extension}`;
          const publicIconPath = `/addon-icons/${iconFilename}`;
          const fullDiskPath = path.join(iconDir, iconFilename);
          await fs.writeFile(fullDiskPath, buffer);
          icon = publicIconPath;
        }
      } catch (e: any) {
        // non-critical error
      }
    }

    const readmeRes = await fetch(`https://raw.githubusercontent.com/${name}/${repo.default_branch}/README.md`, fetchOptionsNoHeaders);
    if (readmeRes.ok) {
        const readmeText = await readmeRes.text();
        const invites = readmeText.match(INVITE_RE);
        if (invites && invites[0]) links.discord = invites[0];
    }
    if(repo.homepage && !INVITE_RE.test(repo.homepage)) links.homepage = repo.homepage;

    let features: string[] = [];
    let feature_count = 0;
    let allFeatures: string[] = [];
    try {
      const entrypointPath = fabric.entrypoints.meteor[0].replace(/\./g, '/');
      const entrypointUrl = `https://raw.githubusercontent.com/${name}/${repo.default_branch}/src/main/java/${entrypointPath}.java`;
      const entrypointRes = await fetch(entrypointUrl, fetchOptionsNoHeaders);
      if (entrypointRes.ok) {
        const entrypointText = await entrypointRes.text();
        allFeatures = [...entrypointText.matchAll(FEATURE_RE)].map(m => m[1]);
        feature_count = allFeatures.length;
        features = allFeatures.slice(0, 50);
        if(feature_count > 50) features.push(`...and ${feature_count - 50} more`);
      }
    } catch(e) {
      // non-critical
    }

    const lowerCaseName = (fabric.name || '').toLowerCase();
    const isPotentiallyTemplate = lowerCaseName.includes('example') || lowerCaseName.includes('template');
    if (isPotentiallyTemplate) {
        const hasOnlyExampleFeatures = feature_count > 0 && allFeatures.every(f => f.toLowerCase().includes('example'));
        if (feature_count === 0 || hasOnlyExampleFeatures) {
            console.log(`Filtering out template/example repo '${name}' during scrape.`);
            return null;
        }
    }
    
    let mc_version: string | null = null;
    const MCVER_RE = /(?:minecraft_version|minecraftVersion)\s*=\s*["']?([^"'\n\r]+)["']?/;
    const gradleFileUrls = [
      `https://raw.githubusercontent.com/${name}/${repo.default_branch}/build.gradle`,
      `https://raw.githubusercontent.com/${name}/${repo.default_branch}/build.gradle.kts`,
      `https://raw.githubusercontent.com/${name}/${repo.default_branch}/gradle.properties`
    ];
    for (const url of gradleFileUrls) {
      try {
        const buildGradleRes = await fetch(url, fetchOptionsNoHeaders);
        if (buildGradleRes.ok) {
          const buildGradleText = await buildGradleRes.text();
          const match = buildGradleText.match(MCVER_RE);
          if (match && match[1]) {
            mc_version = match[1];
            break;
          }
        }
      } catch(e) {/* non-critical */}
    }
    
    const result: Addon = {
      id: repo.full_name,
      name: fabric.name,
      authors,
      summary,
      icon,
      links,
      features,
      feature_count,
      stars: repo.stargazers_count,
      downloads,
      last_update: repo.pushed_at,
      mc_version,
      status: { archived: repo.archived },
      verified: isVerified,
      ... (injectData[repo.full_name] || {})
    };
    return result;

  } catch (error) {
    console.error(`Error parsing repo ${name}:`, error);
    return null;
  }
}
