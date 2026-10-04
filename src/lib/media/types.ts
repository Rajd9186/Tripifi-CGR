export type MediaSource = "local" | "unsplash" | "fallback";
export type MediaType = "image" | "video";
export type EnvironmentalEffect = "clouds" | "mist" | "water" | "light" | "dust" | "snow" | "haze";

export interface Photographer {
  name: string;
  profileUrl: string;
}

export interface MediaAsset {
  id: string;
  type: MediaType;
  src: string;
  alt: string;
  source: MediaSource;
  photographer?: Photographer;
  /** Canonical Unsplash page for the photo (with UTM). */
  sourceUrl?: string;
  /** Raw download_location endpoint — server use only, never rendered. */
  downloadLocation?: string;
  attributionRequired?: boolean;
  width?: number;
  height?: number;
  dominantColor?: string;
}

export interface DestinationMedia {
  destination: string;
  hero?: MediaAsset;
  mobileHero?: MediaAsset;
  heroVideo?: MediaAsset;
  heroPoster?: MediaAsset;
  gallery?: MediaAsset[];
  effects?: EnvironmentalEffect[];
  /** Where the hero came from in the priority chain. */
  resolvedFrom?: "local" | "unsplash" | "fallback";
}

export interface MediaQueryOptions {
  placement?: "hero" | "gallery" | "card";
  orientation?: "landscape" | "portrait";
  minWidth?: number;
  signal?: AbortSignal;
}

export interface MediaProvider {
  readonly name: string;
  getDestinationMedia(destination: string, options?: MediaQueryOptions): Promise<DestinationMedia | null>;
}
