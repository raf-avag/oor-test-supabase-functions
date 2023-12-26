import { createResponse } from "../_utils/tools.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";
import { getEmbedding, getZeroShot } from "./utils.ts";
import { getUserTopicLocations } from "../users/tools.ts";
import { SearchRequest } from "../_utils/interfaces.ts";

export async function get_top_choices(
  {
    prompt,
    t0,
    endpoint,
    exclude_list,
    user_list,
    personality_id,
    access_token,
    coordinates,
    labels,
  }: SearchRequest,
) {
  if (labels) {
    try {
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
            match_count: 9, // Choose the number of matches to be returned
            exclude_list, // Location ids that may be excluded from the search
            user_list, // Location ids to be excluded from the search
            capacity_threshold,
          },
        );

      if (initialError) {
        return createResponse({
          responseData: "DB Search error",
          status: 404,
          t0,
          endpoint,
          error: initialError,
        });
      }

      return initialRequest;
    } catch (error) {
      return createResponse({
        responseData: "Internal Server Error",
        status: 500,
        t0,
        endpoint,
        error,
      });
    }
  }

  try {
    let log, lat, city, country;

    const [zero_shot, embedding] = await Promise.all([
      getZeroShot({ prompt }),
      getEmbedding({ prompt }),
    ]);

    const { error: error_zero_shot } = zero_shot;
    const { error: error_embedding } = embedding;

    if (error_embedding || error_zero_shot) {
      return createResponse({
        responseData: "AI Search error",
        status: 404,
        t0,
        endpoint,
        error: `Embedding Error: ${error_embedding}
Zero-Shot Error: ${error_zero_shot}`,
      });
    }

    // deno-lint-ignore no-explicit-any
    const response_embedding: any = embedding.response;
    // deno-lint-ignore no-explicit-any
    const response_zero_shot: any = zero_shot.response;

    const { Topic, Nearby, Location, Place, Proximity } = response_zero_shot;

    if (
      Topic === "Similarity" && Nearby === false && Proximity === false &&
      Location === null
    ) {
      const { data: similar_locations, error: similar_locations_error } =
        await supabaseAdmin.rpc("get_similar_locations", {
          input_name: Place,
        });
      if (similar_locations_error || !similar_locations) {
        console.error(
          "Similar locations function error",
          similar_locations_error,
        );
      } else {
      }
      ///do simple search for given location categories and return
    }

    if (Proximity) {
      const { data: similar_locations, error: similar_locations_error } =
        await supabaseAdmin.rpc("get_similar_locations", {
          input_name: Place,
        });

      if (similar_locations_error || !similar_locations) {
        console.error(
          "Similar locations function error",
          similar_locations_error,
        );
      } else {
        const top_id = similar_locations[0];

        const { data, error } = await supabaseAdmin
          .rpc("location_coordinates", { id: top_id });

        if (error) {
          console.error("Similar locations function error", error);
        } else {
          log = data.log;
          lat = data.lat;
        }
      }
    }

    if (Topic && access_token) {
      // deno-lint-ignore no-explicit-any
      const user_topic_locations: any = await getUserTopicLocations({
        access_token,
        t0,
        endpoint,
        Topic: "Topic",
      });
      exclude_list.push(user_topic_locations);
    }

    if (Nearby) {
      lat = coordinates?.[0] || null;
      log = coordinates?.[1] || null;
    }

    if (Location) {
      ///find city or country id
    }

    const query_embedding = await response_embedding.json();
    const { data: initialRequest, error: initialError } = await supabaseAdmin
      .rpc(
        "match_locations_complex",
        {
          query_embedding, // Pass the embedding you want to compare
          match_threshold: 0.75, // Choose an appropriate threshold for your data
          match_count: 9, // Choose the number of matches to be returned
          exclude_list, // Location ids that may be excluded from the search
          user_list, // Location ids to be excluded from the search
          mbti_id: personality_id, // User personality
          city,
          country,
          log, // User current logitude
          lat, // User current latitude
        },
      );

    if (initialError) {
      return createResponse({
        responseData: "AI Search error",
        status: 404,
        t0,
        endpoint,
        error: initialError,
      });
    }
    return initialRequest;
  } catch (error) {
    return createResponse({
      responseData: "Internal Server Error",
      status: 500,
      t0,
      endpoint,
      error,
    });
  }
}
