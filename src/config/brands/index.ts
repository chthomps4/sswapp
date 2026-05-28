import alBrothers from "./al-brothers.json";
import businessSignalWorkshop from "./business-signal-workshop.json";
import localSignalWebsites from "./local-signal-websites.json";
import parallaxHearts from "./parallax-hearts.json";
import signalWorkshop from "./signal-workshop.json";
import sitesignal from "./sitesignal.json";

export type BrandConfig = {
  name: string;
  slug: string;
  positioning: string;
  audience: string;
  offers: string[];
  voice: string;
  visualStyle: string;
  forbiddenPhrases: string[];
  primaryPlatforms: string[];
  postingFrequency: string;
  contentPillars: string[];
  ctaOptions: string[];
  imageStyleRules: string[];
  promptGuardrails: string[];
  sampleHooks: string[];
  samplePostFormats: string[];
  filenamePrefix: string;
};

export const brandConfigs: BrandConfig[] = [
  signalWorkshop,
  businessSignalWorkshop,
  localSignalWebsites,
  sitesignal,
  parallaxHearts,
  alBrothers,
];

export function getBrandConfig(slug: string) {
  return brandConfigs.find((brand) => brand.slug === slug);
}
