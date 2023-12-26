// deno-lint-ignore-file no-explicit-any
import { createResponse } from "../_utils/tools.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";
import { getEmbedding, getZeroShot } from "./utils.ts";
import { getUserTopicLocations } from "../users/tools.ts";
import { SearchRequest } from "../_utils/interfaces.ts";

export async function get_top_choices({
  prompt,
  t0,
  endpoint,
  exclude_list,
  user_list,
  personality_id,
  access_token,
  coordinates,
  labels,
  match_count = 9,
  match_threshold = 0.75,
}: SearchRequest) {
  const handleSearchError = (
    error: any,
    status: number,
    errorMessage: string,
  ) => {
    return createResponse({
      responseData: errorMessage,
      status,
      t0,
      endpoint,
      error,
    });
  };

  const handleSimilarLocationsError = (error: any) => {
    handleSearchError(error, 404, "Similar locations function error");
  };

  let log, lat, city, country;

  try {
    if (labels) {
      const {
        activity: activity_ids,
        category: category_ids,
        capacity: capacity_threshold,
      } = labels;

      const { data: initialRequest, error: initialError } = await supabaseAdmin
        .rpc(
          "simple_search",
          {
            activity_ids,
            category_ids,
            match_count,
            exclude_list,
            user_list,
            capacity_threshold,
          },
        );

      if (initialError) {
        return handleSearchError(initialError, 404, "DB Search error");
      }

      return initialRequest;
    }

    if (prompt) {
      const [zero_shot, embedding] = await Promise.all([
        getZeroShot({ prompt }),
        getEmbedding({ prompt }),
      ]);

      const { error: error_zero_shot } = zero_shot;
      const { error: error_embedding } = embedding;

      if (error_embedding || error_zero_shot) {
        return handleSearchError(
          `Embedding Error: ${error_embedding}\nZero-Shot Error: ${error_zero_shot}`,
          403,
          "Error from AI functions",
        );
      }

      const response_embedding = embedding.response
        ? await embedding.response.json()
        : null;
      const response_zero_shot = zero_shot.response
        ? await zero_shot.response.json()
        : null;

      const { Topic, Nearby, Location, Place, Proximity } = response_zero_shot;

      if (
        Topic === "Similarity" && Proximity === false
      ) {
        const { data: similar_locations, error: similar_locations_error } =
          await supabaseAdmin.rpc("get_similar_locations", {
            input_name: Place,
          });

        if (similar_locations_error || !similar_locations) {
          handleSimilarLocationsError(similar_locations_error);
        }

        return similar_locations;
      }

      if (Proximity) {
        const { data: similar_locations, error: similar_locations_error } =
          await supabaseAdmin.rpc("get_similar_locations", {
            input_name: Place,
          });

        if (similar_locations_error || !similar_locations) {
          handleSimilarLocationsError(similar_locations_error);
        } else {
          const top_id = similar_locations[0];

          const { data, error } = await supabaseAdmin.rpc(
            "location_coordinates",
            { id: top_id },
          );

          if (error) {
            handleSimilarLocationsError(error);
          } else {
            log = data.log;
            lat = data.lat;
          }
        }
      }

      if (Topic && access_token) { //auth - is_registered
        const user_topic_locations: any = await getUserTopicLocations({
          access_token,
          Topic,
        });
        exclude_list.push(user_topic_locations);
      }

      if (Nearby) {
        lat = coordinates?.[0] || null;
        log = coordinates?.[1] || null;
      }

      if (Location) {
        // find city or country id
      }

      const { data: initialRequest, error: initialError } = await supabaseAdmin
        .rpc("match_locations_complex", {
          query_embedding: response_embedding,
          match_threshold,
          match_count,
          exclude_list,
          user_list,
          mbti_id: personality_id,
          city,
          country,
          log,
          lat,
        });

      if (initialError) {
        return handleSearchError(initialError, 404, "AI Search error");
      }
      return initialRequest;
    }
    return handleSearchError("Unable to invoke", 500, "Internal Server Error");
  } catch (error) {
    return handleSearchError(error, 500, "Internal Server Error");
  }
}
