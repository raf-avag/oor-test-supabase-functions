export interface CategoryItem {
  name: string;
  directus_files: {
    filename_disk: string;
  };
}

export interface TrendingItem {
  name: string;
  text_color: string;
  directus_files: {
    filename_disk: string;
  };
}

export interface LocationItem {
  id: number;
  category?: [{
    slug: string;
  }];
  trending?: [{
    slug: string;
  }];
  name: string;
  capacity: number;
  rating: null | number;
  trusted: boolean;
  description: string;
  slug: string;
  links: {
    title: null | string;
    type: string;
    link: string;
  }[];
  open_hours: {
    weekday: string;
    open: string;
    close: string;
  }[];
  user_locations: {
    is_blacklist: boolean;
    is_favorite: boolean;
  }[];
  locations_files: [
    {
      directus_files: {
        filename_disk: string;
      };
    },
  ];
  address: {
    address: string;
    coordinates: {
      type: string;
      crs: {
        type: string;
        properties: {
          name: string;
        };
      };
      coordinates: number[]; // Array containing two numbers
    };
    cities: {
      name: string;
    };
    navigator_link: null | string;
  };
}

interface Choice {
  text: string;
  value: number;
}

interface Options {
  choices: Choice[];
  icon: string;
  placeholder: string;
}

export interface CapacityItem {
  options: Options;
}

export interface DataItem {
  activity: {
    name: string;
  };
  type: {
    name: string;
  };
}

export interface UpsertRowArgs {
  tableName: string;
  // deno-lint-ignore no-explicit-any
  record: Record<string, any>[];
  access_token: string;
  onConflict: string;
}

export interface UpdateRowArgs {
  tableName: string;
  // deno-lint-ignore no-explicit-any
  record: Record<string, any>[];
  access_token: string;
  // deno-lint-ignore no-explicit-any
  match: Record<string, any>;
}

export interface InsertRowArgs {
  tableName: string;
  // deno-lint-ignore no-explicit-any
  record: Record<string, any>[];
  access_token: string;
}

export interface UserProfile {
  username: string;
  first_name: string;
  last_name: string;
  sex: number;
  birthday: Date;
  zodiac: string;
  rating: number;
  personality_id: number;
}

export interface ZeroShotClassifier {
  Topic: null | string;
  Nearby: boolean;
  Location: null | string;
  Place: null | string;
  Proximity: boolean;
}

interface Labels {
  activity: number[];
  category: number[];
  capacity: number;
}

export interface SearchRequest {
  prompt?: string;
  t0: number;
  endpoint: string;
  exclude_list: number[];
  user_list: number[];
  personality_id?: number | null;
  access_token: string;
  coordinates?: number[];
  labels?: Labels;
  match_count?: number;
  match_threshold?: number;
}

export interface SearchResult {
  id: number;
  set: number;
  subset: number;
  _next?: number | null;
}
