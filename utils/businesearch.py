import requests
import time
import random

def find_local_businesses(
    api_key: str,
    location: str,
    radius: int = 5000,
    business_type: str = "restaurant",
    max_results: int = 20,
    randomize_location: bool = True
):
    """
    Find local businesses using Google Places API with randomized results.

    Args:
        api_key (str): Your Google Places API key.
        location (str): "latitude,longitude" of the search center.
        radius (int): Search radius in meters (max 50,000).
        business_type (str): Type of business (see Google Places types).
        max_results (int): Maximum number of businesses to return.
        randomize_location (bool): Slightly randomize location to vary results.

    Returns:
        List[dict]: Each dict contains name, address, rating, user_ratings_total, website, google_maps_url
    """

    def jitter_location(lat_lng, radius_meters=5000):
        """Slightly jitter the lat/lng to get different nearby search results."""
        lat, lng = map(float, lat_lng.split(","))
        delta_deg = radius_meters / 111_000  # approx. degrees per meter
        lat += random.uniform(-delta_deg / 2, delta_deg / 2)
        lng += random.uniform(-delta_deg / 2, delta_deg / 2)
        return f"{lat},{lng}"

    def get_place_details(place_id):
        """Fetch detailed info for a place including website."""
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_address,website,rating,user_ratings_total,url",
            "key": api_key
        }
        resp = requests.get(url, params=params)
        if resp.status_code != 200:
            return {}
        return resp.json().get("result", {})

    # Optionally randomize location
    search_location = jitter_location(location, radius) if randomize_location else location

    all_businesses = []
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": search_location,
        "radius": radius,
        "type": business_type,
        "key": api_key
    }

    # Fetch all available pages (up to 3)
    while url and len(all_businesses) < 60:
        response = requests.get(url, params=params if url.endswith("json") else None)
        if response.status_code != 200:
            break
        data = response.json()

        for place in data.get("results", []):
            place_id = place.get("place_id")
            if not place_id:
                continue

            details = get_place_details(place_id)
            all_businesses.append({
                "name": details.get("name"),
                "address": details.get("formatted_address"),
                "rating": details.get("rating"),
                "user_ratings_total": details.get("user_ratings_total"),
                "website": details.get("website"),
                "google_maps_url": details.get("url")
            })
            time.sleep(0.1)  # avoid rate limit

        # Check if there’s another page
        next_page_token = data.get("next_page_token")
        if next_page_token:
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {"pagetoken": next_page_token, "key": api_key}
            time.sleep(2)  # wait for token to activate
        else:
            url = None

    # Randomly sample from all businesses
    if not all_businesses:
        return []

    if len(all_businesses) > max_results:
        return random.sample(all_businesses, max_results)

    return all_businesses


# ------------------------------
# Test case
# ------------------------------
if __name__ == "__main__":
    API_KEY = "Replace with Google API Key"  # Replace with your real API key
    location = "29.6516,-82.3248"  # Gainesville, FL
    radius = 5000  # 5 km
    business_type = "restaurant"
    max_results = 10

    print(f"Fetching {max_results} random {business_type}s near {location}...\n")
    businesses = find_local_businesses(API_KEY, location, radius, business_type, max_results)

    if not businesses:
        print("No businesses found or API request failed.")
    else:
        for i, biz in enumerate(businesses, 1):
            print(f"{i}. {biz['name']} - {biz['address']}")
            print(f"   Rating: {biz.get('rating', 'N/A')} ({biz.get('user_ratings_total', 0)} reviews)")
            print(f"   Website: {biz.get('website', 'N/A')}")
            print(f"   Google Maps: {biz.get('google_maps_url', 'N/A')}\n")
