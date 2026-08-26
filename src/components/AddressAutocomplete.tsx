/// <reference types="google.maps" />
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export type AddressAutocompleteValue = {
  /** The full formatted address as returned by Google Places. */
  formattedAddress: string;
  /** Individual address components, when available. */
  addressLine?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | null = null;

function loadPlacesLibrary(apiKey: string) {
  if (!placesLibraryPromise) {
    setOptions({ key: apiKey, v: "weekly" });
    placesLibraryPromise = importLibrary("places");
  }
  return placesLibraryPromise;
}

export function AddressAutocomplete({
  label,
  required,
  placeholder = "Start typing your address…",
  value,
  onChange,
  onSelect,
  error,
}: {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: AddressAutocompleteValue) => void;
  error?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [loadError, setLoadError] = useState(!apiKey);

  useEffect(() => {
    if (!apiKey || !inputRef.current) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;
    let cancelled = false;

    loadPlacesLibrary(apiKey)
      .then(({ Autocomplete }) => {
        if (cancelled || !inputRef.current) return;
        autocomplete = new Autocomplete(inputRef.current, {
          fields: ["formatted_address", "address_components", "geometry"],
        });
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          if (!place) return;

          const components = place.address_components ?? [];
          const getComponent = (type: string) =>
            components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes(type))
              ?.long_name;

          const streetNumber = getComponent("street_number");
          const route = getComponent("route");
          const addressLine = [streetNumber, route].filter(Boolean).join(" ") || undefined;

          const formattedAddress = place.formatted_address ?? "";
          onChange(formattedAddress);
          onSelect({
            formattedAddress,
            addressLine,
            city: getComponent("locality") ?? getComponent("postal_town"),
            region: getComponent("administrative_area_level_1"),
            postalCode: getComponent("postal_code"),
            country: getComponent("country"),
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          });
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      listener?.remove();
      autocomplete = null;
    };
  }, [apiKey, onChange, onSelect]);

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 text-sm text-near-black">
      {label && (
        <span>
          {label} {required && <span className="text-error-red">*</span>}
        </span>
      )}
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
      />
      {error && <p className="text-[13px] text-error-red">{error}</p>}
      {loadError && (
        <p className="text-[13px] text-near-black/60">
          Address suggestions are unavailable right now — you can still type your address manually.
        </p>
      )}
    </label>
  );
}
