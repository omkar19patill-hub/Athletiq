import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet default icon path issues with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom glowing HTML markers for Athletiq Dark Aesthetic
const createTurfMarkerIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-turf-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: ${isSelected ? '#00FF87' : '#0B0F17'};
        border: 2px solid ${isSelected ? '#ffffff' : '#00FF87'};
        border-radius: 50%;
        box-shadow: 0 0 18px ${isSelected ? 'rgba(0, 255, 135, 0.8)' : 'rgba(0, 255, 135, 0.35)'};
        cursor: pointer;
        transition: all 0.25s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#0B0F17' : '#00FF87'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
};

const createCenterMarkerIcon = (label = 'Your PIN') => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
      ">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          background: rgba(0, 229, 255, 0.3);
          border-radius: 50%;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          background: #00E5FF;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.8);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B0F17" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
};

export const TurfLocationMap = ({ 
  venues = [], 
  centerCoords = null, 
  pincodeInfo = null,
  selectedVenueId = null,
  onSelectVenue = null,
  height = '500px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const centerMarkerRef = useRef(null);

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Bangalore center if no coordinates provided yet
      const initialLat = centerCoords?.lat || 12.9716;
      const initialLng = centerCoords?.lng || 77.5946;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control on top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap Tiles with Sleek Dark Stadium Filter (100% Free, No Watermark, Zero API Key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'dark-stadium-tiles',
      }).addTo(map);

      // Marker cluster or layer group
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle center coordinate changes (PIN code or GPS update)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (centerCoords && centerCoords.lat && centerCoords.lng) {
      map.flyTo([centerCoords.lat, centerCoords.lng], 13, { duration: 1.2 });

      if (centerMarkerRef.current) {
        centerMarkerRef.current.remove();
      }

      const pinLabel = pincodeInfo?.pincode ? `PIN: ${pincodeInfo.pincode}` : 'Your Location';
      const marker = L.marker([centerCoords.lat, centerCoords.lng], {
        icon: createCenterMarkerIcon(pinLabel),
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; color: #E2E8F0; padding: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #00E5FF; text-transform: uppercase; letter-spacing: 0.05em;">Search Radar Origin</div>
          <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-top: 2px;">${pincodeInfo?.area || 'Custom Location'}</div>
          <div style="font-size: 12px; color: #94A3B8;">${pincodeInfo?.city || ''} ${pincodeInfo?.pincode ? '• PIN ' + pincodeInfo.pincode : ''}</div>
        </div>
      `, {
        className: 'dark-leaflet-popup'
      });

      centerMarkerRef.current = marker;
    }
  }, [centerCoords, pincodeInfo]);

  // Update Turf Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validVenues = venues.filter(v => v.latitude && v.longitude);
    const bounds = [];

    if (centerCoords && centerCoords.lat && centerCoords.lng) {
      bounds.push([centerCoords.lat, centerCoords.lng]);
    }

    validVenues.forEach((venue) => {
      const isSelected = selectedVenueId === venue.id;
      const marker = L.marker([venue.latitude, venue.longitude], {
        icon: createTurfMarkerIcon(isSelected),
      });

      const primaryImg = venue.imageUrls && venue.imageUrls.length > 0 
        ? venue.imageUrls[0] 
        : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600';

      const gmapUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;

      const popupHtml = `
        <div style="font-family: inherit; width: 220px; color: #F1F5F9; border-radius: 12px; overflow: hidden;">
          <div style="width: 100%; height: 110px; overflow: hidden; position: relative;">
            <img src="${primaryImg}" alt="${venue.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            <div style="position: absolute; top: 6px; right: 6px; background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(4px); padding: 2px 7px; border-radius: 100px; border: 1px solid rgba(255, 255, 255, 0.15); font-size: 11px; font-weight: 700; color: #F59E0B; display: flex; align-items: center; gap: 3px;">
              ★ ${venue.averageRating ? venue.averageRating.toFixed(1) : '4.8'}
            </div>
            ${venue.distanceKm !== undefined && venue.distanceKm !== null ? `
              <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0, 255, 135, 0.9); color: #0B0F17; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 800; letter-spacing: 0.02em;">
                ${venue.distanceKm < 1 ? '< 1 km' : venue.distanceKm.toFixed(1) + ' km away'}
              </div>
            ` : ''}
          </div>
          <div style="padding: 10px 10px 8px 10px; background: #0B0F17;">
            <div style="font-size: 13px; font-weight: 800; color: #ffffff; line-height: 1.3; margin-bottom: 2px;">
              ${venue.name}
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
              📍 ${venue.address || venue.city} (PIN ${venue.pincode || 'N/A'})
            </div>
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <a href="/venues/${venue.id}" style="flex: 1; text-align: center; background: #00FF87; color: #0B0F17; font-size: 11px; font-weight: 700; padding: 6px 8px; border-radius: 8px; text-decoration: none; display: inline-block;">
                Book Slot &rarr;
              </a>
              <a href="${gmapUrl}" target="_blank" rel="noopener noreferrer" title="Get Directions in Google Maps" style="display: flex; align-items: center; justify-content: center; width: 28px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #38BDF8; text-decoration: none;">
                🧭
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-leaflet-popup',
        maxWidth: 240,
      });

      marker.on('click', () => {
        if (onSelectVenue) onSelectVenue(venue);
      });

      marker.addTo(markersLayer);
      bounds.push([venue.latitude, venue.longitude]);
    });

    // If no explicit center, fit bounds of available venues
    if (!centerCoords && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [venues, selectedVenueId, centerCoords]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000000] bg-slate-950" style={{ height }}>
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Radar Status HUD */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0F17] border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-bold text-white">
        <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87] border border-black animate-pulse" />
        <span>
          {pincodeInfo ? `Radar: PIN ${pincodeInfo.pincode} (${pincodeInfo.area || pincodeInfo.city})` : 'Live Stadium Radar'}
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-[#00FF87] font-black">{venues.length} Arenas Active</span>
      </div>

      {/* Google Maps External Directions Bar */}
      <div className="absolute bottom-3 right-3 z-[400]">
        <a 
          href={
            centerCoords 
              ? `https://www.google.com/maps/search/sports+turf/@${centerCoords.lat},${centerCoords.lng},13z` 
              : "https://www.google.com/maps/search/sports+turf"
          }
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-black text-[#00E5FF] transition-all group"
        >
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          <span>Open in Google Maps</span>
        </a>
      </div>
    </div>
  );
};
