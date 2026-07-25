import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Fetches current air quality + weather from Open-Meteo (no API key required),
 * persists a snapshot for the user, and returns the parsed reading.
 *
 * If the external service fails the function returns a typed fallback so the
 * dashboard can render gracefully instead of throwing.
 */

const inputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().max(120).optional(),
});

export type EnvironmentSnapshot = {
  latitude: number;
  longitude: number;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  temperature_c: number | null;
  humidity: number | null;
  pollen: number | null;
  weather_summary: string | null;
  captured_at: string;
  source: string;
  label?: string;
};

async function fetchOpenMeteo(lat: number, lon: number) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,alder_pollen,birch_pollen,grass_pollen,ragweed_pollen&timezone=auto`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl, { signal: AbortSignal.timeout(8000) }),
    fetch(airUrl, { signal: AbortSignal.timeout(8000) }),
  ]);

  if (!weatherRes.ok || !airRes.ok) throw new Error("upstream_error");

  const weather = (await weatherRes.json()) as {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      weather_code: number;
      wind_speed_10m: number;
    };
  };
  const air = (await airRes.json()) as {
    current: {
      us_aqi: number | null;
      pm2_5: number | null;
      pm10: number | null;
      ozone: number | null;
      alder_pollen: number | null;
      birch_pollen: number | null;
      grass_pollen: number | null;
      ragweed_pollen: number | null;
    };
  };

  const pollenParts = [
    air.current.alder_pollen,
    air.current.birch_pollen,
    air.current.grass_pollen,
    air.current.ragweed_pollen,
  ].filter((v): v is number => v != null);
  const pollen = pollenParts.length
    ? pollenParts.reduce((a, b) => a + b, 0) / pollenParts.length
    : null;

  return {
    aqi: air.current.us_aqi ?? null,
    pm25: air.current.pm2_5 ?? null,
    pm10: air.current.pm10 ?? null,
    ozone: air.current.ozone ?? null,
    pollen,
    temperature_c: weather.current.temperature_2m ?? null,
    humidity: weather.current.relative_humidity_2m ?? null,
    weather_summary: describeWeatherCode(weather.current.weather_code),
  };
}

function describeWeatherCode(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    80: "Rain showers",
    95: "Thunderstorm",
  };
  return map[code] ?? "Mixed conditions";
}

export const getLiveEnvironment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ snapshot: EnvironmentSnapshot | null; error?: string }> => {
    try {
      const reading = await fetchOpenMeteo(data.latitude, data.longitude);
      const snapshot: EnvironmentSnapshot = {
        latitude: data.latitude,
        longitude: data.longitude,
        ...reading,
        source: "open-meteo",
        captured_at: new Date().toISOString(),
        label: data.label,
      };

      await context.supabase.from("environment_snapshots").insert({
        user_id: context.userId,
        latitude: snapshot.latitude,
        longitude: snapshot.longitude,
        aqi: snapshot.aqi,
        pm25: snapshot.pm25,
        pm10: snapshot.pm10,
        ozone: snapshot.ozone,
        temperature_c: snapshot.temperature_c,
        humidity: snapshot.humidity,
        pollen: snapshot.pollen,
        weather_summary: snapshot.weather_summary,
        source: snapshot.source,
      });

      return { snapshot };
    } catch (err) {
      console.error("[env] fetch failed", err);
      return { snapshot: null, error: "Environment service unavailable" };
    }
  });
