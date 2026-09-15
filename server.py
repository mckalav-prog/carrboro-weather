#!/usr/bin/env python3
"""
Carrboro Weather Live Dashboard Server
Pure live weather forecasting application with:
- 8 blocks per day (every 3 hours: 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm)
- Continuous blended Daylight solar spectrum (no text, warm orange day, dark blue night)
- Logical color ramps (Precipitation: light gray -> dark green, Cloud: sky blue -> white)
- Smaller, lighter typography and ultra-soft, clean blended aesthetic
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys
import time
import math
from datetime import datetime, timezone, timedelta

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CACHE = {}
CACHE_TTL = 300  # 5 minutes


def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return f"#{int(max(0, min(255, rgb[0]))):02x}{int(max(0, min(255, rgb[1]))):02x}{int(max(0, min(255, rgb[2]))):02x}"


def interpolate_color(val, stops):
    if val <= stops[0][0]:
        return stops[0][1]
    if val >= stops[-1][0]:
        return stops[-1][1]
    for i in range(len(stops) - 1):
        v1, c1 = stops[i]
        v2, c2 = stops[i + 1]
        if v1 <= val <= v2:
            factor = (val - v1) / (v2 - v1) if v2 > v1 else 0
            rgb1 = hex_to_rgb(c1)
            rgb2 = hex_to_rgb(c2)
            inter_rgb = [rgb1[j] + factor * (rgb2[j] - rgb1[j]) for j in range(3)]
            return rgb_to_hex(inter_rgb)
    return stops[-1][1]


def get_contrast_color(hex_str):
    rgb = hex_to_rgb(hex_str)
    lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255.0
    return "#0f172a" if lum > 0.62 else "#ffffff"


# --- Soft, Muted, Blended Organic Color Ramps ---

# Temperature: Soft muted pastel ramp
TEMP_STOPS = [
    (32, "#8fa3ba"),   # Muted dusty denim
    (45, "#a1b7c8"),   # Soft muted powder blue
    (55, "#a8c5bd"),   # Muted sage mist
    (65, "#bad4c3"),   # Soft eucalyptus
    (74, "#e5d3a3"),   # Soft muted warm sand
    (82, "#e5b689"),   # Soft muted peach-apricot
    (90, "#df9681"),   # Soft muted dusty coral
    (98, "#d47f78")    # Soft muted terracotta rose
]

# Humidity: Soft warm cream -> muted sage -> calm muted blue -> deep slate
HUM_STOPS = [
    (25, "#f5eedb"),   # Soft warm cream
    (40, "#dfebd9"),   # Pale muted sage
    (55, "#cde0e8"),   # Soft dusty light slate
    (70, "#a5c2d4"),   # Muted calm blue
    (85, "#7d9fb4"),   # Muted slate denim
    (100, "#5b778b")   # Soft deep slate
]

# Precipitation: 0% soft cream gray -> muted sage -> soft forest green
PRECIP_STOPS = [
    (0, "#ede8df"),    # Soft cream gray (blends seamlessly with cream white)
    (5, "#e2ddd3"),    # Gentle warm stone
    (15, "#cad7c4"),   # Soft pale sage mist
    (30, "#a4be9e"),   # Muted meadow
    (50, "#7d9e79"),   # Soft moss green
    (70, "#5c8358"),   # Muted forest green
    (85, "#446942"),   # Soft deep evergreen
    (100, "#325331")   # Muted dark forest
]

# Cloud Cover: 0% soft muted serene sky blue -> 100% pure overcast white
CLOUD_STOPS = [
    (0, "#8cb8d0"),    # Soft muted serene sky blue
    (15, "#a6c7da"),   # Gentle pale sky
    (30, "#c0d7e3"),   # Soft atmospheric haze
    (50, "#d7e5ec"),   # Light whisper mist
    (70, "#e8f0f3"),   # Soft cloud veil
    (85, "#f4f7f8"),   # Almost pure white
    (100, "#ffffff")   # Soft pure overcast white
]

# Muted, Soft Solar Cycle Continuum (24h) - True Dark Sky at Night
SOLAR_CYCLE_STOPS = [
    (0.0, "#1e293b"),   # 12:00 AM midnight dark sky
    (4.5, "#1e293b"),   # 4:30 AM late night dark sky
    (5.3, "#263345"),   # 5:18 AM pre-dawn first hint of light
    (6.0, "#484358"),   # 6:00 AM dawn twilight (soft muted plum)
    (6.6, "#785866"),   # 6:36 AM sunrise muted mauve/rose
    (7.2, "#a87560"),   # 7:12 AM sunrise muted warm peach
    (8.0, "#cc9064"),   # 8:00 AM morning soft warm amber
    (11.0, "#dfa36c"),  # 11:00 AM soft warm daytime
    (13.0, "#e2a770"),  # 1:00 PM solar noon soft warm daytime
    (16.0, "#dfa36c"),  # 4:00 PM afternoon soft warm daytime
    (18.0, "#ca8860"),  # 6:00 PM golden hour warm peach
    (19.0, "#986466"),  # 7:00 PM sunset muted rose/plum
    (19.8, "#5a485a"),  # 7:48 PM sunset twilight muted lavender
    (20.5, "#2e3749"),  # 8:30 PM dusk twilight dark blue
    (21.2, "#1e293b"),  # 9:12 PM night dark sky
    (24.0, "#1e293b")   # midnight dark sky
]


def get_temperature_color(temp_f):
    return interpolate_color(temp_f, TEMP_STOPS)


def get_humidity_color(hum):
    return interpolate_color(hum, HUM_STOPS)


def get_precip_color(pct):
    return interpolate_color(pct, PRECIP_STOPS)


def get_cloud_color(pct):
    return interpolate_color(pct, CLOUD_STOPS)


def get_solar_color_by_hour(hour_val):
    return interpolate_color(hour_val % 24.0, SOLAR_CYCLE_STOPS)


def get_solar_phase_desc(hour_val):
    h = hour_val % 24.0
    if 5.3 <= h < 6.4:
        return "Dawn Twilight (First Light)"
    elif 6.4 <= h < 7.8:
        return "Sunrise & Horizon Glow"
    elif 7.8 <= h < 11.5:
        return "Morning Warm Sunshine"
    elif 11.5 <= h < 15.5:
        return "Solar Noon (Daytime)"
    elif 15.5 <= h < 18.2:
        return "Afternoon Warm Sunshine"
    elif 18.2 <= h < 19.5:
        return "Golden Hour Sunset"
    elif 19.5 <= h < 20.8:
        return "Dusk Twilight (Evening Sky)"
    else:
        return "Night Sky (Dark Sky)"


def generate_row_gradient_css(colors):
    if not colors:
        return "transparent"
    n = len(colors)
    stops = [f"{colors[0]} 0%"]
    for i, c in enumerate(colors):
        pct = (i + 0.5) / n * 100
        stops.append(f"{c} {pct:.2f}%")
    stops.append(f"{colors[-1]} 100%")
    joined = ", ".join(stops)
    return f"linear-gradient(to right, {joined})"


def generate_solar_gradient_css(start_hour, total_hours, n_stops=120):
    stops_css = []
    for i in range(n_stops + 1):
        pct = i / float(n_stops)
        elapsed = pct * total_hours
        h_of_day = (start_hour + elapsed) % 24.0
        c = get_solar_color_by_hour(h_of_day)
        stops_css.append(f"{c} {pct * 100:.2f}%")
    joined = ", ".join(stops_css)
    return f"linear-gradient(to right, {joined})"


WEATHER_CODES = {
    0: ("Clear Sky", "clear_day"),
    1: ("Mainly Clear", "clear_day"),
    2: ("Partly Cloudy", "partly_cloudy_day"),
    3: ("Overcast", "cloudy"),
    45: ("Foggy", "fog"),
    48: ("Depositing Rime Fog", "fog"),
    51: ("Light Drizzle", "rain_light"),
    53: ("Moderate Drizzle", "rain"),
    55: ("Dense Drizzle", "rain_heavy"),
    61: ("Slight Rain", "rain_light"),
    63: ("Moderate Rain", "rain"),
    65: ("Heavy Rain", "rain_heavy"),
    71: ("Slight Snow", "snow"),
    73: ("Moderate Snow", "snow"),
    75: ("Heavy Snow", "snow_heavy"),
    80: ("Scattered Showers", "rain"),
    81: ("Moderate Showers", "rain"),
    82: ("Violent Showers", "thunderstorm"),
    95: ("Thunderstorm", "thunderstorm"),
    96: ("Thunderstorm with Hail", "thunderstorm")
}


def generate_moon_svg(elong_deg, phase_fraction, size=20):
    r = 7.5
    cx = size / 2.0
    cy = size / 2.0

    if phase_fraction < 0.02:
        return (
            f'<svg class="moon-icon" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="rgba(15,23,42,0.65)" stroke="rgba(255,255,255,0.35)" stroke-width="0.75" stroke-dasharray="1.5,1.5"/>'
            f'</svg>'
        )

    if phase_fraction > 0.98:
        return (
            f'<svg class="moon-icon" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fffef7" style="filter:drop-shadow(0 0 3px rgba(255,255,255,0.85));"/>'
            f'<circle cx="{cx-1.5}" cy="{cy-1.0}" r="1.8" fill="#cbd5e1" opacity="0.35"/>'
            f'<circle cx="{cx+2.0}" cy="{cy+1.5}" r="2.2" fill="#cbd5e1" opacity="0.3"/>'
            f'</svg>'
        )

    waxing = elong_deg < 180.0
    rx = abs(r * math.cos(math.radians(elong_deg)))
    yt = cy - r
    yb = cy + r

    outer_sweep = 1 if waxing else 0
    is_crescent = (elong_deg < 90.0) or (elong_deg > 270.0)
    term_sweep = (0 if waxing else 1) if is_crescent else (1 if waxing else 0)

    path_d = f"M {cx} {yt} A {r} {r} 0 0 {outer_sweep} {cx} {yb} A {rx:.2f} {r} 0 0 {term_sweep} {cx} {yt} Z"

    return (
        f'<svg class="moon-icon" viewBox="0 0 {size} {size}" width="{size}" height="{size}">'
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.25)" stroke-width="0.6"/>'
        f'<path d="{path_d}" fill="#fffef7" style="filter:drop-shadow(0 0 2.5px rgba(255,255,255,0.85));"/>'
        f'</svg>'
    )


def calculate_moon_position_and_phase(dt_utc, lat, lon):
    a = (14 - dt_utc.month) // 12
    y = dt_utc.year + 4800 - a
    m = dt_utc.month + 12 * a - 3
    jdn = dt_utc.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
    jd = jdn + (dt_utc.hour - 12) / 24.0 + dt_utc.minute / 1440.0 + dt_utc.second / 86400.0
    d = jd - 2451543.5

    w_s = math.radians(282.9404 + 4.70935e-5 * d)
    M_s = math.radians((356.0470 + 0.9856002585 * d) % 360)
    L_s = w_s + M_s
    sun_lon = L_s + math.radians(1.915 * math.sin(M_s) + 0.020 * math.sin(2 * M_s))

    N = math.radians((125.1228 - 0.0529538083 * d) % 360)
    i = math.radians(5.1454)
    w_m = math.radians((318.0634 + 0.1643573223 * d) % 360)
    M_m = math.radians((115.3654 + 13.0649929509 * d) % 360)

    E = M_m + 0.0549 * math.sin(M_m) * (1 + 0.0549 * math.cos(M_m))
    x = 60.2666 * (math.cos(E) - 0.0549)
    y = 60.2666 * (math.sqrt(1 - 0.0549**2) * math.sin(E))
    r = math.sqrt(x*x + y*y)
    v = math.atan2(y, x)

    xeclip = r * (math.cos(N) * math.cos(v + w_m) - math.sin(N) * math.sin(v + w_m) * math.cos(i))
    yeclip = r * (math.sin(N) * math.cos(v + w_m) + math.cos(N) * math.sin(v + w_m) * math.cos(i))
    zeclip = r * (math.sin(v + w_m) * math.sin(i))

    moon_lon = math.atan2(yeclip, xeclip)
    moon_lat = math.atan2(zeclip, math.sqrt(xeclip*xeclip + yeclip*yeclip))

    Lm = (math.degrees(N + w_m + M_m)) % 360
    Ls = (math.degrees(L_s)) % 360
    Mm = math.degrees(M_m) % 360
    Ms = math.degrees(M_s) % 360
    D = (Lm - Ls) % 360
    F = (Lm - math.degrees(N)) % 360

    d_lon = -1.274 * math.sin(math.radians(Mm - 2*D)) + \
            0.658 * math.sin(math.radians(2*D)) - \
            0.186 * math.sin(math.radians(Ms)) - \
            0.059 * math.sin(math.radians(2*Mm - 2*D)) - \
            0.057 * math.sin(math.radians(Mm - 2*D + Ms)) + \
            0.053 * math.sin(math.radians(Mm + 2*D)) + \
            0.046 * math.sin(math.radians(2*D - Ms)) + \
            0.041 * math.sin(math.radians(Mm - Ms)) - \
            0.035 * math.sin(math.radians(D)) - \
            0.031 * math.sin(math.radians(Mm + Ms))

    d_lat = -0.173 * math.sin(math.radians(F - 2*D)) - \
            0.055 * math.sin(math.radians(Mm - F - 2*D)) - \
            0.046 * math.sin(math.radians(Mm + F - 2*D)) + \
            0.033 * math.sin(math.radians(F + 2*D)) + \
            0.017 * math.sin(math.radians(2*Mm + F))

    moon_lon += math.radians(d_lon)
    moon_lat += math.radians(d_lat)

    ecl = math.radians(23.4393 - 3.563e-7 * d)

    x_eq = math.cos(moon_lat) * math.cos(moon_lon)
    y_eq = math.cos(moon_lat) * math.sin(moon_lon) * math.cos(ecl) - math.sin(moon_lat) * math.sin(ecl)
    z_eq = math.cos(moon_lat) * math.sin(moon_lon) * math.sin(ecl) + math.sin(moon_lat) * math.cos(ecl)

    ra = math.atan2(y_eq, x_eq)
    dec = math.atan2(z_eq, math.sqrt(x_eq*x_eq + y_eq*y_eq))

    GMST0 = (18.697374558 + 24.06570982441908 * d) % 24
    LST = (GMST0 * 15.0 + lon) % 360
    ha = math.radians(LST) - ra

    lat_rad = math.radians(lat)
    sin_alt = math.sin(lat_rad) * math.sin(dec) + math.cos(lat_rad) * math.cos(dec) * math.cos(ha)
    alt = math.asin(max(-1.0, min(1.0, sin_alt)))
    alt_deg = math.degrees(alt)

    elong = (moon_lon - sun_lon) % (2 * math.pi)
    phase_fraction = (1.0 - math.cos(elong)) / 2.0
    elong_deg = math.degrees(elong) % 360

    if elong_deg < 22.5 or elong_deg >= 337.5:
        phase_name = "New Moon"
    elif elong_deg < 67.5:
        phase_name = "Waxing Crescent"
    elif elong_deg < 112.5:
        phase_name = "First Quarter"
    elif elong_deg < 157.5:
        phase_name = "Waxing Gibbous"
    elif elong_deg < 202.5:
        phase_name = "Full Moon"
    elif elong_deg < 247.5:
        phase_name = "Waning Gibbous"
    elif elong_deg < 292.5:
        phase_name = "Last Quarter"
    else:
        phase_name = "Waning Crescent"

    visible = (alt_deg > 0.0)
    alt_pct = round(min(1.0, max(0.0, alt_deg / 72.0)), 3)

    svg = generate_moon_svg(elong_deg, phase_fraction, size=20)

    return {
        "visible": visible,
        "altitude": round(alt_deg, 1),
        "altitude_pct": alt_pct,
        "phase_fraction": round(phase_fraction, 3),
        "phase_name": phase_name,
        "elongation_deg": round(elong_deg, 1),
        "is_waxing": elong_deg < 180.0,
        "svg": svg
    }


def fetch_live_weather(lat, lon, units="fahrenheit", view="5day"):
    cache_key = f"weather_{lat}_{lon}_{units}_{view}"
    now = time.time()
    if cache_key in CACHE:
        ts, data = CACHE[cache_key]
        if now - ts < CACHE_TTL:
            return data

    api_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,is_day"
        f"&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,cloud_cover,apparent_temperature,weather_code,wind_speed_10m,is_day,direct_radiation"
        f"&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,precipitation_probability_max,weather_code"
        f"&temperature_unit={units}&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7"
    )

    req = urllib.request.Request(api_url, headers={"User-Agent": "CarrboroWeatherApp/2.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        raw = json.loads(resp.read().decode())

    hourly = raw.get("hourly", {})
    daily = raw.get("daily", {})
    current_raw = raw.get("current", {})

    temp_unit = "°F" if units == "fahrenheit" else "°C"
    times = hourly.get("time", [])

    # 8 blocks per day: every 3 hours (0, 3, 6, 9, 12, 15, 18, 21)
    if view == "5day":
        n_days = 5
        target_indices = [d * 24 + s * 3 for d in range(n_days) for s in range(8)]
        daily_times = daily.get("time", [])
        day_names = []
        for i in range(min(n_days, len(daily_times))):
            d_str = daily_times[i]
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            if i == 0:
                day_names.append("TODAY")
            elif i == 1:
                day_names.append("TOMORROW")
            else:
                day_names.append(dt.strftime("%A").upper())

        while len(day_names) < n_days:
            day_names.append("DAY")

        days_layout = [{"name": day_names[i], "span": 8, "start": i * 8, "end": (i + 1) * 8 - 1} for i in range(n_days)]
        divider_cols = [7, 15, 23, 31]
        col_count = 40

    elif view == "3day":
        n_days = 3
        target_indices = [d * 24 + s * 3 for d in range(n_days) for s in range(8)]
        daily_times = daily.get("time", [])
        day_names = []
        for i in range(min(n_days, len(daily_times))):
            d_str = daily_times[i]
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            if i == 0:
                day_names.append("TODAY")
            elif i == 1:
                day_names.append("TOMORROW")
            else:
                day_names.append(dt.strftime("%A").upper())

        days_layout = [{"name": day_names[i], "span": 8, "start": i * 8, "end": (i + 1) * 8 - 1} for i in range(n_days)]
        divider_cols = [7, 15]
        col_count = 24

    else:  # "24h"
        target_indices = list(range(24))
        days_layout = [
            {"name": "NEXT 12 HOURS", "span": 12, "start": 0, "end": 11},
            {"name": "LATER 12 HOURS", "span": 12, "start": 12, "end": 23}
        ]
        divider_cols = [11]
        col_count = 24

    utc_offset_seconds = raw.get("utc_offset_seconds", -14400)
    intervals = []
    temps = []
    humidities = []
    precips = []
    clouds = []
    slot_hours = []
    moon_list = []

    for idx, h_idx in enumerate(target_indices):
        if h_idx >= len(times):
            h_idx = len(times) - 1

        t_val = round(hourly.get("temperature_2m", [70])[h_idx])
        h_val = round(hourly.get("relative_humidity_2m", [50])[h_idx])
        p_val = round(hourly.get("precipitation_probability", [10])[h_idx])
        c_val = round(hourly.get("cloud_cover", [20])[h_idx])

        time_str = times[h_idx]
        dt = datetime.fromisoformat(time_str)
        hour_float = dt.hour + dt.minute / 60.0
        slot_hours.append(hour_float)

        dt_utc = dt - timedelta(seconds=utc_offset_seconds)
        moon_info = calculate_moon_position_and_phase(dt_utc, float(lat), float(lon))
        moon_list.append(moon_info)

        is_day = hourly.get("is_day", [1])[h_idx]
        wcode = hourly.get("weather_code", [0])[h_idx]
        cond_text, icon_name = WEATHER_CODES.get(wcode, ("Fair", "clear_day"))
        if not is_day and icon_name == "clear_day":
            icon_name = "clear_night"
        elif not is_day and icon_name == "partly_cloudy_day":
            icon_name = "partly_cloudy_night"

        time_display = dt.strftime("%I:%M %p").lstrip("0")
        day_str = dt.strftime("%a %b %d")

        temps.append(t_val)
        humidities.append(h_val)
        precips.append(p_val)
        clouds.append(c_val)

        solar_phase = get_solar_phase_desc(hour_float)

        intervals.append({
            "index": idx,
            "datetime": time_str,
            "time": time_display,
            "day": day_str,
            "period": f"{day_str} • {time_display}",
            "desc": cond_text,
            "icon": icon_name,
            "apparent_temp": round(hourly.get("apparent_temperature", [t_val])[h_idx]),
            "wind_speed": round(hourly.get("wind_speed_10m", [5])[h_idx]),
            "temp": t_val,
            "humidity": h_val,
            "precipitation": p_val,
            "cloud": c_val,
            "solar_phase": solar_phase,
            "hour": hour_float,
            "moon": moon_info
        })

    # Color & Contrast text
    temp_colors = [get_temperature_color(t if units == "fahrenheit" else t * 9/5 + 32) for t in temps]
    temp_text = [get_contrast_color(c) for c in temp_colors]

    hum_colors = [get_humidity_color(h) for h in humidities]
    hum_text = [get_contrast_color(c) for c in hum_colors]

    precip_colors = [get_precip_color(p) for p in precips]
    precip_text = [get_contrast_color(c) for c in precip_colors]

    solar_colors = [get_solar_color_by_hour(h) for h in slot_hours]
    cloud_colors = [get_cloud_color(c) for c in clouds]
    cloud_text = [get_contrast_color(c) for c in cloud_colors]

    start_hour = slot_hours[0] if slot_hours else 0.0
    total_hours = 120.0 if view == "5day" else (72.0 if view == "3day" else 24.0)
    solar_gradient = generate_solar_gradient_css(start_hour, total_hours)

    temp_gradient = generate_row_gradient_css(temp_colors)
    hum_gradient = generate_row_gradient_css(hum_colors)
    precip_gradient = generate_row_gradient_css(precip_colors)
    cloud_gradient = generate_row_gradient_css(cloud_colors)

    curr_wcode = current_raw.get("weather_code", 0)
    curr_cond, curr_icon = WEATHER_CODES.get(curr_wcode, ("Clear", "clear_day"))
    if not current_raw.get("is_day", 1) and curr_icon == "clear_day":
        curr_icon = "clear_night"

    sunrise_time = daily.get("sunrise", ["06:45"])[0].split("T")[-1] if daily.get("sunrise") else "06:45"
    sunset_time = daily.get("sunset", ["19:30"])[0].split("T")[-1] if daily.get("sunset") else "19:30"

    current_formatted = {
        "temperature": round(current_raw.get("temperature_2m", temps[0])),
        "temperature_unit": temp_unit,
        "apparent_temperature": round(current_raw.get("apparent_temperature", temps[0])),
        "condition": curr_cond,
        "weather_code": curr_wcode,
        "icon": curr_icon,
        "humidity": round(current_raw.get("relative_humidity_2m", humidities[0])),
        "wind_speed": round(current_raw.get("wind_speed_10m", 5)),
        "wind_speed_unit": "mph",
        "cloud_cover": round(current_raw.get("cloud_cover", clouds[0])),
        "precipitation_chance": precips[0],
        "solar_phase": get_solar_phase_desc(datetime.now().hour + datetime.now().minute / 60.0),
        "temp_max": round(daily.get("temperature_2m_max", [max(temps)])[0]),
        "temp_min": round(daily.get("temperature_2m_min", [min(temps)])[0]),
        "sunrise": sunrise_time,
        "sunset": sunset_time
    }

    result = {
        "title": "CARRBORO WEATHER",
        "units": units,
        "view": view,
        "col_count": col_count,
        "current": current_formatted,
        "days": days_layout,
        "divider_after_columns": divider_cols,
        "rows": [
            {
                "id": "temperature",
                "label": f"TEMPERATURE ({temp_unit})",
                "unit": temp_unit,
                "values": temps,
                "display_values": [str(t) for t in temps],
                "colors": temp_colors,
                "gradient_css": temp_gradient,
                "text_colors": temp_text
            },
            {
                "id": "humidity",
                "label": "HUMIDITY (%)",
                "unit": "%",
                "values": humidities,
                "display_values": [f"{h}%" for h in humidities],
                "colors": hum_colors,
                "gradient_css": hum_gradient,
                "text_colors": hum_text
            },
            {
                "id": "precipitation",
                "label": "PRECIPITATION CHANCE (%)",
                "unit": "%",
                "values": precips,
                "display_values": [f"{p}%" for p in precips],
                "colors": precip_colors,
                "gradient_css": precip_gradient,
                "text_colors": precip_text
            },
            {
                "id": "daylight",
                "label": "DAYLIGHT & SOLAR CYCLE",
                "unit": "hrs",
                "is_continuum": True,
                "values": slot_hours,
                "display_values": [""] * col_count,  # No text inside continuum
                "colors": solar_colors,
                "gradient_css": solar_gradient,
                "text_colors": ["transparent"] * col_count,
                "moon_data": moon_list
            },
            {
                "id": "cloud_cover",
                "label": "CLOUD COVER (%)",
                "unit": "%",
                "values": clouds,
                "display_values": [f"{c}%" for c in clouds],
                "colors": cloud_colors,
                "gradient_css": cloud_gradient,
                "text_colors": cloud_text
            }
        ],
        "intervals": intervals
    }

    CACHE[cache_key] = (now, result)
    return result


def search_locations(query):
    if not query or len(query.strip()) < 2:
        return []

    cache_key = f"geo_{query.strip().lower()}"
    now = time.time()
    if cache_key in CACHE:
        ts, data = CACHE[cache_key]
        if now - ts < 86400:
            return data

    encoded = urllib.parse.quote(query.strip())
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=6&language=en&format=json"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CarrboroWeatherApp/2.0"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            raw = json.loads(resp.read().decode())
            results = []
            for item in raw.get("results", []):
                results.append({
                    "name": item.get("name"),
                    "region": item.get("admin1") or item.get("country"),
                    "country": item.get("country"),
                    "latitude": item.get("latitude"),
                    "longitude": item.get("longitude"),
                    "display": f"{item.get('name')}, {item.get('admin1') or ''} {item.get('country') or ''}".replace(" ,", ",").strip()
                })
            CACHE[cache_key] = (now, results)
            return results
    except Exception as e:
        print(f"Geocoding error: {e}", file=sys.stderr)
def get_earth_image_data():
    img_path = os.path.join(BASE_DIR, "assets", "earth-latest.jpg")
    now = time.time()
    need_refresh = False
    if not os.path.exists(img_path) or os.path.getsize(img_path) == 0:
        need_refresh = True
    elif now - os.path.getmtime(img_path) > 900:  # 15 minutes
        need_refresh = True

    if need_refresh:
        try:
            url = "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/678x678.jpg"
            req = urllib.request.Request(url, headers={"User-Agent": "CarrboroWeatherApp/2.0"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
                with open(img_path, "wb") as f:
                    f.write(data)
                return data
        except Exception as e:
            print(f"Error fetching NOAA Earth image: {e}", file=sys.stderr)

    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            return f.read()
    return b""


def get_radar_data():
    cache_key = "radar_maps"
    now = time.time()
    if cache_key in CACHE:
        ts, data = CACHE[cache_key]
        if now - ts < 180:  # 3 min cache
            return data

    try:
        url = "https://api.rainviewer.com/public/weather-maps.json"
        req = urllib.request.Request(url, headers={"User-Agent": "CarrboroWeatherApp/2.0"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode())
            CACHE[cache_key] = (now, data)
            return data
    except Exception as e:
        print(f"Error fetching radar data: {e}", file=sys.stderr)
        return CACHE.get(cache_key, (now, {}))[1]


def get_flight_data(center_lat=35.9101, center_lon=-79.0753, radius_miles=150.0):
    """Fetch live ADS-B state vectors within radius_miles from OpenSky Network."""
    now = time.time()
    cache_key = f"flights_{round(center_lat, 2)}_{round(center_lon, 2)}_{int(radius_miles)}"

    if cache_key in CACHE:
        cached_time, cached_data = CACHE[cache_key]
        if now - cached_time < 9:
            return cached_data

    deg_lat = radius_miles / 69.0
    rad_lat = math.radians(center_lat)
    deg_lon = radius_miles / max(1.0, (69.0 * math.cos(rad_lat)))

    lamin = center_lat - deg_lat
    lamax = center_lat + deg_lat
    lomin = center_lon - deg_lon
    lomax = center_lon + deg_lon

    url = f"https://opensky-network.org/api/states/all?lamin={lamin:.4f}&lamax={lamax:.4f}&lomin={lomin:.4f}&lomax={lomax:.4f}"
    aircraft_list = []
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CarrboroAirspaceMonitor/2.0"})
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode())
            states = data.get("states") or []
            for s in states:
                lon = s[5]
                lat = s[6]
                if lon is None or lat is None:
                    continue

                dlat = math.radians(lat - center_lat)
                dlon = math.radians(lon - center_lon)
                a = math.sin(dlat / 2)**2 + math.cos(rad_lat) * math.cos(math.radians(lat)) * math.sin(dlon / 2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                dist_miles = 3958.8 * c

                if dist_miles > radius_miles:
                    continue

                callsign = (s[1] or "").strip()
                if not callsign:
                    callsign = (s[0] or "").upper()

                alt_m = s[7]
                alt_ft = int(alt_m * 3.28084) if alt_m is not None else 0
                vel_mps = s[9]
                speed_kts = int(vel_mps * 1.94384) if vel_mps is not None else 0
                heading = round(s[10], 1) if s[10] is not None else 0.0
                on_ground = bool(s[8])
                country = s[2] or "United States"

                y = math.sin(dlon) * math.cos(math.radians(lat))
                x = math.cos(rad_lat) * math.sin(math.radians(lat)) - math.sin(rad_lat) * math.cos(math.radians(lat)) * math.cos(dlon)
                bearing = (math.degrees(math.atan2(y, x)) + 360) % 360

                aircraft_list.append({
                    "icao": s[0],
                    "callsign": callsign,
                    "country": country,
                    "lat": round(lat, 4),
                    "lon": round(lon, 4),
                    "dist_mi": round(dist_miles, 1),
                    "bearing": round(bearing, 1),
                    "alt_ft": alt_ft,
                    "speed_kts": speed_kts,
                    "heading": heading,
                    "vert_rate": round(s[11] * 196.85, 0) if s[11] is not None else 0,
                    "on_ground": on_ground
                })

            aircraft_list.sort(key=lambda a: a["dist_mi"])
            result = {
                "center": {"lat": center_lat, "lon": center_lon, "radius_miles": radius_miles},
                "count": len(aircraft_list),
                "timestamp": int(now),
                "aircraft": aircraft_list
            }
            CACHE[cache_key] = (now, result)
            return result

    except Exception as e:
        print(f"Error fetching flight data: {e}", file=sys.stderr)
        if cache_key in CACHE:
            return CACHE[cache_key][1]
        return {
            "center": {"lat": center_lat, "lon": center_lon, "radius_miles": radius_miles},
            "count": 0,
            "timestamp": int(now),
            "aircraft": []
        }


class WeatherHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Fallback /api/snapshot redirect to live weather
        if path == "/api/snapshot" or path == "/api/weather":
            lat = float(query.get("lat", [35.9101])[0])
            lon = float(query.get("lon", [-79.0753])[0])
            city = query.get("city", ["Carrboro"])[0]
            units = query.get("units", ["fahrenheit"])[0]
            view = query.get("view", ["5day"])[0]

            try:
                data = fetch_live_weather(lat, lon, units, view)
                data["title"] = f"{city.upper()} WEATHER"
                data["location"] = {"name": city, "latitude": lat, "longitude": lon}
            except Exception as e:
                print(f"Error fetching weather: {e}", file=sys.stderr)
                data = fetch_live_weather(35.9101, -79.0753, units, "5day")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        if path == "/api/radar":
            data = get_radar_data()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        if path == "/api/earth":
            data = get_earth_image_data()
            if data:
                self.send_response(200)
                self.send_header("Content-Type", "image/jpeg")
                self.send_header("Cache-Control", "public, max-age=600")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404)
                self.end_headers()
            return

        if path == "/api/search":
            q = query.get("q", [""])[0]
            results = search_locations(q)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"results": results}).encode("utf-8"))
            return

        if path == "/api/flights":
            lat = float(query.get("lat", [35.9101])[0])
            lon = float(query.get("lon", [-79.0753])[0])
            radius = float(query.get("radius", [150.0])[0])
            data = get_flight_data(lat, lon, radius)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        return super().do_GET()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def run_server(port=PORT):
    current_port = port
    while current_port < port + 10:
        try:
            with ReusableTCPServer(("", current_port), WeatherHTTPRequestHandler) as httpd:
                print(f"Serving Carrboro Weather App on http://localhost:{current_port}")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if e.errno == 98:
                current_port += 1
                continue
            raise


if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(p)
