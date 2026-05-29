export type BrandAssetKind = "logo" | "mark" | "badge" | "atmosphere";

export type BrandAsset = {
  id: string;
  src: string;
  kind: BrandAssetKind;
  alt: string;
  recommendedUse: string;
};

const basePath = "/brand/signal-workshop";

export const signalWorkshopAssets = {
  primaryLogo: {
    id: "signal-workshop-primary-logo",
    src: `${basePath}/signal-workshop-primary-logo.png`,
    kind: "logo",
    alt: "Signal Workshop primary logo with bar chart and connected signal nodes.",
    recommendedUse: "Primary identity on light dashboard surfaces.",
  },
  digitalStudioBadge: {
    id: "signal-workshop-digital-studio-badge",
    src: `${basePath}/signal-workshop-digital-studio-badge.png`,
    kind: "badge",
    alt: "Signal Workshop Digital Studio circular badge with workshop and broadcast signal icon.",
    recommendedUse: "Secondary brand seal for internal docs and profile-style surfaces.",
  },
  studioDashboardMockup: {
    id: "signal-workshop-studio-dashboard-mockup",
    src: `${basePath}/signal-workshop-studio-dashboard-mockup.png`,
    kind: "atmosphere",
    alt: "Signal Workshop studio desk with branded wall sign, laptop, and dashboard monitor.",
    recommendedUse: "Curated dashboard atmosphere for private operating surfaces.",
  },
  operationsDesk: {
    id: "signal-workshop-operations-desk",
    src: `${basePath}/signal-workshop-operations-desk.png`,
    kind: "atmosphere",
    alt: "Signal Workshop workspace with website, content calendar, and workflow setup screens.",
    recommendedUse: "Automation and Run Today context image.",
  },
  brandSystemsDesk: {
    id: "signal-workshop-brand-systems-desk",
    src: `${basePath}/signal-workshop-brand-systems-desk.png`,
    kind: "atmosphere",
    alt: "Signal Workshop brand systems desk with laptop, mobile view, notebook, and printed brand materials.",
    recommendedUse: "Brand systems and planning context image.",
  },
  swMonogram: {
    id: "signal-workshop-sw-monogram",
    src: `${basePath}/signal-workshop-sw-monogram.png`,
    kind: "mark",
    alt: "Signal Workshop SW monogram with signal waves.",
    recommendedUse: "Compact app mark and future favicon source.",
  },
} satisfies Record<string, BrandAsset>;

export const signalWorkshopAssetList = Object.values(signalWorkshopAssets);
