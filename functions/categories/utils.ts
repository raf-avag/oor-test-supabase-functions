import { createResponse } from "../_utils/tools.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";
import { CategoryItem } from "../_utils/interfaces.ts";
import { AWS_BUCKET_MEDIA_LINK } from "../_shared/config.ts";

export async function getCategories(t0: number, endpoint: string) {
  const { data, error } = await supabaseAdmin
    .from("category")
    .select("name,slug,directus_files(filename_disk)")
    .eq("visible", true);

  if (error || !data) {
    return createResponse({
      responseData: "Internal Server Error",
      status: 500,
      t0,
      endpoint,
      error,
    });
  }
  const category = data as unknown as CategoryItem[];

  const modifiedArray = category.map((item) => {
    const { directus_files, ...rest } = item;
    const filename_disk = directus_files?.filename_disk;
    // Check if filename_disk exists and is not empty
    if (filename_disk && filename_disk.length > 0) {
      return {
        ...rest,
        "icon": AWS_BUCKET_MEDIA_LINK + filename_disk,
      };
    } else {
      return {
        ...rest,
        "icon": AWS_BUCKET_MEDIA_LINK + "default_filename.svg", // Provide a default filename or handle the case where directus_files is empty.
      };
    }
  });

  return modifiedArray;
}
