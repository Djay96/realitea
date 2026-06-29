/** True only when both AdSense client and slot are configured. */
export const adsEnabled = Boolean(
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT &&
    process.env.NEXT_PUBLIC_ADSENSE_SLOT,
);
