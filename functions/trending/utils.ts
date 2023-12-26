import { createResponse } from "../_utils/tools.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";
import { TrendingItem } from "../_utils/interfaces.ts";
import { AWS_BUCKET_MEDIA_LINK } from "../_shared/config.ts";

export async function getTrending(t0: number, endpoint: string) {
  const { data, error } = await supabaseAdmin
    .from("trending")
    .select("name,slug,text_color,directus_files(filename_disk)")
    .eq("visible", true);

  if (error || !data) {
    return createResponse({
      responseData: error,
      status: 400,
      t0: t0,
      endpoint: endpoint,
    });
  }
  const trending = data as unknown as TrendingItem[];

  const modifiedArray = trending.map((item) => {
    const { directus_files, ...rest } = item;
    const filename_disk = directus_files?.filename_disk;
    // Check if filename_disk exists and is not empty
    if (filename_disk && filename_disk.length > 0) {
      return {
        ...rest,
        "background": AWS_BUCKET_MEDIA_LINK + filename_disk,
      };
    } else {
      return {
        ...rest,
        "background": null,
      };
    }
  });

  return modifiedArray;
}
