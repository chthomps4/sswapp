import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function makeAssetFilename(
  date: string,
  brand: string,
  platform: string,
  campaign: string,
  pillar: string,
  version = "v01",
  extension = "png",
) {
  return [date, brand, platform, campaign, pillar, version]
    .map(slugify)
    .filter(Boolean)
    .join("_")
    .concat(`.${extension.replace(/^\./, "")}`);
}

export function generateAssetFilename({
  date,
  brandSlug,
  platformSlug,
  contentPillarSlug,
  campaignSlug,
  version = 1,
  extension = "png",
  existingFilenames = [],
}: {
  date: string;
  brandSlug: string;
  platformSlug: string;
  contentPillarSlug: string;
  campaignSlug: string;
  version?: number | string;
  extension?: string;
  existingFilenames?: string[];
}) {
  const normalizedVersion =
    typeof version === "number" ? `v${String(version).padStart(2, "0")}` : version.startsWith("v") ? version : `v${version}`;
  const baseParts = [date, brandSlug, platformSlug, contentPillarSlug, campaignSlug].map(slugify).filter(Boolean);
  let filename = [...baseParts, normalizedVersion].join("_").concat(`.${extension.replace(/^\./, "")}`);

  if (!existingFilenames.includes(filename)) return filename;

  for (let nextVersion = 2; nextVersion < 100; nextVersion += 1) {
    filename = [...baseParts, `v${String(nextVersion).padStart(2, "0")}`].join("_").concat(`.${extension.replace(/^\./, "")}`);
    if (!existingFilenames.includes(filename)) return filename;
  }

  throw new Error("Unable to create a unique asset filename after 99 versions.");
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
