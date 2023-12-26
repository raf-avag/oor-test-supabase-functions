// deno-lint-ignore-file no-explicit-any
import { LocationItem } from "../_utils/interfaces.ts";
import { AWS_BUCKET_MEDIA_LINK } from "../_shared/config.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";

function transformLocation(location: any) {
  return {
    ...location,
    ...location.address,
    address: location.address.address, // Combine address properties into a single "address" property
    location_images: location.locations_files.map(
      (locationFile: any) =>
        AWS_BUCKET_MEDIA_LINK + locationFile.directus_files.filename_disk,
    ),
    is_blacklist: location.user_locations?.[0]?.is_blacklist ?? null,
    is_favorite: location.user_locations?.[0]?.is_favorite ?? null,
    user_locations: undefined,
    cities: undefined,
    locations_files: undefined,
    locations_by_trending: undefined,
    locations_by_category: undefined,
  };
}

export function transformLocationData(data: any) {
  const initial = data as unknown as LocationItem[];
  return initial.map((location) => ({
    ...transformLocation(location),
    coordinates: location.address.coordinates.coordinates.reverse(), // Revert once Google Maps is installed in CMS
    city: location.address.cities.name, // Replace "cities" object with "city" property
  }));
}

export function transformLocationDataPaginated(data: any) {
  const initial = data as unknown as LocationItem[];
  return initial.map((location) => ({
    ...transformLocation(location),
  }));
}

export async function randomLocationID() {
  const { count, error } = await supabaseAdmin
    .from("locations")
    .select("id", { count: "exact" });

  if (error) return null;
  else if (!count) return null;
  else {
    return Math.floor(Math.random() * count) + 1;
  }
}

export function locationID(endpoint: string, pathname: string, action: string) {
  const idStartIndex = `${endpoint}/`.length + 1;
  const idEndIndex = pathname.length - `/${action}`.length;
  const location_id = parseInt(
    pathname.substring(idStartIndex, idEndIndex),
    10,
  );
  return { location_id };
}

export const columns_single =
  `id,name,capacity,rating,trusted,description,links,slug,open_hours,
      address(address,coordinates,cities(name),navigator_link),
      locations_files(directus_files(filename_disk))`;

export const columns_paginated = `id,name,rating,trusted,slug,open_hours,
      address(address,navigator_link),locations_files(directus_files(filename_disk))`;

export const columns_auth = `,user_locations(is_blacklist,is_favorite)`;
