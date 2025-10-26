const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();


let PLACES_API_KEY;
try {
  const config = require('./config');
  PLACES_API_KEY = config.PLACES_API_KEY;
} catch (error) {
  console.error('config.js not found. Copy config.example.js to config.js and add your API key');
  PLACES_API_KEY = process.env.PLACES_API_KEY;
}

/**
 * AGENT 1: LEAD FINDER
 * Callable function that finds businesses using Google Places API
 */
exports.findLeads = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  
  try {
    // Get user preferences from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }

    const userData = userDoc.data();
    const { targetLocation, targetIndustry, leadsPerSearch = 20 } = userData;

    if (!targetLocation || !targetIndustry) {
      throw new HttpsError(
        'invalid-argument', 
        'Target location and industry are required in user profile'
      );
    }

    console.log(`Finding leads: ${targetIndustry} in ${targetLocation}`);

    // Search for businesses
    const leads = await searchBusinessesWithPlaces(
      targetLocation, 
      targetIndustry, 
      leadsPerSearch
    );
    
    // Save leads to Firestore
    let savedCount = 0;
    let skippedCount = 0;

    for (const lead of leads) {
      // Check for duplicates using placeId
      const existingLead = await db.collection('leads')
        .where('userId', '==', userId)
        .where('placeId', '==', lead.placeId)
        .limit(1)
        .get();

      if (existingLead.empty) {
        await db.collection('leads').add({
          userId: userId,
          businessName: lead.businessName,
          address: lead.address,
          phone: lead.phone,
          website: lead.website,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          googleMapsUrl: lead.googleMapsUrl,
          category: lead.category,
          placeId: lead.placeId,
          status: 'found', // This triggers next agent
          priority: lead.website ? 'MEDIUM' : 'HIGH', // No website = higher priority
          foundAt: admin.firestore.FieldValue.serverTimestamp(),
          searchQuery: `${targetIndustry} in ${targetLocation}`
        });
        savedCount++;
        console.log(`Saved: ${lead.businessName}`);
      } else {
        skippedCount++;
        console.log(`Skipped duplicate: ${lead.businessName}`);
      }
    }

    return {
      success: true,
      savedCount,
      skippedCount,
      totalFound: leads.length,
      message: `Found ${savedCount} new leads, skipped ${skippedCount} duplicates`
    };

  } catch (error) {
    console.error('Error finding leads:', error);
    throw new HttpsError('internal', `Failed to find leads: ${error.message}`);
  }
});

/**
 * Search for businesses using Google Places API
 */
async function searchBusinessesWithPlaces(location, industry, limit = 20) {
  if (!PLACES_API_KEY || PLACES_API_KEY === 'YOUR_PLACES_API_KEY_HERE') {
    throw new Error('Places API key not configured in code');
  }

  try {
    // STEP 1: Geocode the location to get lat/lng
    console.log(`Geocoding: ${location}`);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${PLACES_API_KEY}`;
    
    const geoResponse = await axios.get(geocodeUrl, { 
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      throw new Error(`Could not geocode location: ${location}`);
    }

    const { lat, lng } = geoResponse.data.results[0].geometry.location;
    console.log(`Geocoded to: ${lat}, ${lng}`);

    // STEP 2: Search for nearby businesses
    const businessType = mapIndustryToPlaceType(industry);
    console.log(`Searching for type: ${businessType}`);
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8000&type=${businessType}&key=${PLACES_API_KEY}`;
    
    const searchResponse = await axios.get(searchUrl, { 
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    if (searchResponse.data.status !== 'OK' && searchResponse.data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', searchResponse.data);
      throw new Error(`Places API returned: ${searchResponse.data.status}`);
    }

    const places = searchResponse.data.results || [];
    console.log(`Found ${places.length} places from Nearby Search`);

    if (places.length === 0) {
      return [];
    }

    // STEP 3: Get detailed info for each place (including website)
    const businesses = [];
    const placesToFetch = places.slice(0, Math.min(limit, 20)); // Limit API calls

    for (const place of placesToFetch) {
      try {
        // Get place details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,url,rating,user_ratings_total,business_status&key=${PLACES_API_KEY}`;
        
        const detailsResponse = await axios.get(detailsUrl, { 
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        });
        
        if (detailsResponse.data.status === 'OK') {
          const details = detailsResponse.data.result;
          
          // Only include operational businesses
          if (details.business_status === 'OPERATIONAL' || !details.business_status) {
            businesses.push({
              businessName: details.name || 'Unknown Business',
              address: details.formatted_address || '',
              phone: details.formatted_phone_number || null,
              website: details.website || null,
              rating: details.rating || null,
              reviewCount: details.user_ratings_total || 0,
              googleMapsUrl: details.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
              category: businessType,
              placeId: place.place_id,
              source: 'google_places'
            });
            
            console.log(`Added: ${details.name} ${details.website ? '(has website)' : '(no website)'}`);
          }
        } else {
          console.warn(`Failed to get details for place ${place.place_id}: ${detailsResponse.data.status}`);
        }
        
        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error fetching details for place ${place.place_id}:`, error.message);
        // Continue with next place
      }
    }

    console.log(`Successfully processed ${businesses.length} businesses`);
    return businesses;

  } catch (error) {
    console.error('Places API error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Map industry name to Google Places type
 */
function mapIndustryToPlaceType(industry) {
  const mapping = {
    'business': 'establishment',
    'all': 'establishment',
    'restaurant': 'restaurant',
    'restaurants': 'restaurant',
    'cafe': 'cafe',
    'coffee': 'cafe',
    'coffee shop': 'cafe',
    'bar': 'bar',
    'bars': 'bar',
    'pub': 'bar',
    'bakery': 'bakery',
    'plumber': 'plumber',
    'plumbing': 'plumber',
    'electrician': 'electrician',
    'lawyer': 'lawyer',
    'attorney': 'lawyer',
    'law firm': 'lawyer',
    'dentist': 'dentist',
    'dental': 'dentist',
    'doctor': 'doctor',
    'physician': 'doctor',
    'salon': 'beauty_salon',
    'beauty salon': 'beauty_salon',
    'hair salon': 'hair_care',
    'barber': 'hair_care',
    'gym': 'gym',
    'fitness': 'gym',
    'fitness center': 'gym',
    'real estate': 'real_estate_agency',
    'realtor': 'real_estate_agency',
    'accountant': 'accounting',
    'accounting': 'accounting',
    'cpa': 'accounting',
    'store': 'store',
    'shop': 'store',
    'retail': 'store',
    'boutique': 'clothing_store',
    'clothing': 'clothing_store'
  };

  const normalized = industry.toLowerCase().trim();
  return mapping[normalized] || 'establishment'; // Default fallback
}

/**
 * Firestore Trigger - Runs when a new lead is created
 */
exports.onLeadCreated = onDocumentCreated('leads/{leadId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    console.log('No data in snapshot');
    return null;
  }
  
  const lead = snap.data();
  const leadId = event.params.leadId;
  
  console.log(`🎯 New lead created: ${lead.businessName} (${leadId})`);
  
  if (lead.website && lead.status === 'found') {
    console.log(`✅ Lead has website: ${lead.website} - Ready for Agent 2 analysis`);
    // Agent 2 (Website Analyzer) will pick this up
  } else if (!lead.website && lead.status === 'found') {
    console.log(`⚠️  Lead has no website - Skipping to mock generation`);
    await snap.ref.update({
      status: 'ready_for_mock',
      note: 'No existing website - will generate from scratch'
    });
  }
  
  return null;
});

/**
 * TEST ENDPOINT - For debugging and demos
 * Access via: https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/testLeadFinder?location=Austin,TX&industry=cafe&limit=5
 */
exports.testLeadFinder = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const location = req.query.location || 'Gainesville, FL';
    const industry = req.query.industry || 'business';
    const limit = parseInt(req.query.limit) || 10;

    console.log(`🧪 Test: Finding ${industry} in ${location} (limit: ${limit})`);
    
    const businesses = await searchBusinessesWithPlaces(location, industry, limit);
    
    res.json({
      success: true,
      query: `${industry} in ${location}`,
      count: businesses.length,
      businesses: businesses,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});