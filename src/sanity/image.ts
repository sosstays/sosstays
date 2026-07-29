import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { projectId, dataset } from "./client";

const imageBuilder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
}
