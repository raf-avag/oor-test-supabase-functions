import { supabaseAdmin } from "../_utils/supabase.ts";
import { CapacityItem, DataItem } from "../_utils/interfaces.ts";

export function TypeActivityConstructor(
  data: DataItem[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const item of data) {
    const activityName = item.activity.name;
    const typeName = item.type.name;

    if (typeName in result) {
      if (!result[typeName].includes(activityName)) {
        result[typeName].push(activityName);
      }
    } else {
      result[typeName] = [activityName];
    }
  }

  return result;
}

export async function getCapacity() {
  const CapacityQuery = supabaseAdmin
    .from("directus_fields")
    .select("options")
    .eq("collection", "locations")
    .eq("field", "capacity");

  try {
    const { data, error } = await CapacityQuery;

    if (error) {
      return { error };
    }

    const options = data as unknown as CapacityItem[];
    const capacity = options[0].options.choices;
    return { capacity };
  } catch (error) {
    return { error };
  }
}

export async function getActivityTypes() {
  const OptionsQuery = supabaseAdmin
    .from("activity_type")
    .select("activity(name),type(name)");

  try {
    const { data, error } = await OptionsQuery;

    if (error) {
      return { error };
    }

    const typed_data = data as unknown as DataItem[];
    // const uniqueTypes = [
    //   ...new Set(
    //     typed_data.flatMap((item) =>
    //       Array.isArray(item.type)
    //         ? item.type.map((a) => a.name)
    //         : [item.type.name]
    //     ),
    //   ),
    // ] as string[];

    const activity_types = TypeActivityConstructor(typed_data);
    const uniqueTypes = Object.keys(activity_types);

    return { activity_types, uniqueTypes };
  } catch (error) {
    return { error };
  }
}
