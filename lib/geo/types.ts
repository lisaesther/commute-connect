export type ConfirmedLocation = {
  displayName: string;
  latitude: number;
  longitude: number;
};

export type LocationSearchResult =
  ConfirmedLocation & {
    osmType: string | null;
    osmId: string | null;
  };
