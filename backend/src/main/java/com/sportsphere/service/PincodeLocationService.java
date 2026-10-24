package com.sportsphere.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class PincodeLocationService {

    public record PincodeInfo(
            String pincode,
            double latitude,
            double longitude,
            String area,
            String city,
            String state
    ) {}

    private final Map<String, PincodeInfo> exactPincodes = new HashMap<>();
    private final Map<String, PincodeInfo> prefixFallbacks = new HashMap<>();
    private final Map<String, PincodeInfo> dynamicCache = new ConcurrentHashMap<>();

    public PincodeLocationService() {
        initExactPincodes();
        initPrefixFallbacks();
    }

    private void initExactPincodes() {
        // Mumbai & Suburban (400xxx)
        add("400050", 19.0596, 72.8295, "Bandra West", "Mumbai", "Maharashtra");
        add("400053", 19.1363, 72.8277, "Andheri West", "Mumbai", "Maharashtra");
        add("400058", 19.1200, 72.8350, "Versova / Andheri", "Mumbai", "Maharashtra");
        add("400069", 19.1197, 72.8631, "Andheri East", "Mumbai", "Maharashtra");
        add("400076", 19.1176, 72.9060, "Powai / Hiranandani", "Mumbai", "Maharashtra");
        add("400064", 19.1860, 72.8485, "Malad West", "Mumbai", "Maharashtra");
        add("400001", 18.9322, 72.8347, "Fort / South Mumbai", "Mumbai", "Maharashtra");
        add("400005", 18.9067, 72.8147, "Colaba", "Mumbai", "Maharashtra");
        add("400018", 19.0166, 72.8167, "Worli", "Mumbai", "Maharashtra");
        add("400052", 19.0688, 72.8340, "Khar West", "Mumbai", "Maharashtra");
        add("400054", 19.0800, 72.8400, "Santacruz West", "Mumbai", "Maharashtra");
        add("400055", 19.0850, 72.8550, "Santacruz East", "Mumbai", "Maharashtra");
        add("400056", 19.1020, 72.8370, "Vile Parle West", "Mumbai", "Maharashtra");
        add("400072", 19.1060, 72.8870, "Sakinaka / Marol", "Mumbai", "Maharashtra");
        add("400092", 19.2307, 72.8567, "Borivali West", "Mumbai", "Maharashtra");
        add("400097", 19.1800, 72.8600, "Malad East", "Mumbai", "Maharashtra");
        add("400101", 19.2050, 72.8650, "Kandivali East", "Mumbai", "Maharashtra");
        add("400104", 19.1650, 72.8450, "Goregaon West", "Mumbai", "Maharashtra");

        // Bangalore (560xxx)
        add("560038", 12.9784, 77.6408, "Indiranagar", "Bangalore", "Karnataka");
        add("560034", 12.9352, 77.6245, "Koramangala", "Bangalore", "Karnataka");
        add("560095", 12.9372, 77.6271, "Koramangala 8th Block", "Bangalore", "Karnataka");
        add("560102", 12.9121, 77.6446, "HSR Layout", "Bangalore", "Karnataka");
        add("560066", 12.9698, 77.7500, "Whitefield", "Bangalore", "Karnataka");
        add("560001", 12.9756, 77.6094, "MG Road / Central", "Bangalore", "Karnataka");
        add("560025", 12.9660, 77.6060, "Richmond Town", "Bangalore", "Karnataka");
        add("560008", 12.9780, 77.6220, "Ulsoor / Halasuru", "Bangalore", "Karnataka");
        add("560076", 12.8940, 77.5990, "Bannerghatta Road", "Bangalore", "Karnataka");
        add("560078", 12.9063, 77.5857, "JP Nagar", "Bangalore", "Karnataka");
        add("560041", 12.9250, 77.5930, "Jayanagar", "Bangalore", "Karnataka");
        add("560003", 13.0030, 77.5700, "Malleshwaram", "Bangalore", "Karnataka");
        add("560017", 12.9600, 77.6600, "HAL Old Airport Rd", "Bangalore", "Karnataka");
        add("560087", 12.9550, 77.7100, "Varthur / Marathahalli", "Bangalore", "Karnataka");
        add("560100", 12.8450, 77.6600, "Electronic City", "Bangalore", "Karnataka");

        // Delhi NCR (110xxx, 122xxx, 201xxx)
        add("110001", 28.6304, 77.2177, "Connaught Place", "New Delhi", "Delhi");
        add("110016", 28.5494, 77.2001, "Hauz Khas", "New Delhi", "Delhi");
        add("110020", 28.5300, 77.2700, "Okhla Phase 3", "New Delhi", "Delhi");
        add("110024", 28.5700, 77.2400, "Lajpat Nagar", "New Delhi", "Delhi");
        add("110070", 28.5200, 77.1500, "Vasant Kunj", "New Delhi", "Delhi");
        add("110085", 28.7100, 77.1100, "Rohini", "New Delhi", "Delhi");
        add("110017", 28.5350, 77.2100, "Malviya Nagar", "New Delhi", "Delhi");
        add("110049", 28.5600, 77.2200, "South Extension", "New Delhi", "Delhi");

        add("122001", 28.4601, 77.0300, "Old Gurgaon", "Gurugram", "Haryana");
        add("122002", 28.4800, 77.0900, "DLF Phase 1 / 2", "Gurugram", "Haryana");
        add("122003", 28.4900, 77.0880, "DLF Cyber City / Ph 3", "Gurugram", "Haryana");
        add("122018", 28.4100, 77.0400, "Sohna Road", "Gurugram", "Haryana");

        add("201301", 28.6280, 77.3649, "Sector 62", "Noida", "Uttar Pradesh");
        add("201304", 28.5100, 77.4100, "Sector 137 Expressway", "Noida", "Uttar Pradesh");
        add("201307", 28.5800, 77.3400, "Sector 34", "Noida", "Uttar Pradesh");

        // Hyderabad (500xxx)
        add("500081", 17.4435, 78.3772, "Hitec City / Madhapur", "Hyderabad", "Telangana");
        add("500032", 17.4401, 78.3489, "Gachibowli", "Hyderabad", "Telangana");
        add("500034", 17.4156, 78.4350, "Banjara Hills", "Hyderabad", "Telangana");
        add("500033", 17.4319, 78.4073, "Jubilee Hills", "Hyderabad", "Telangana");
        add("500003", 17.4399, 78.4983, "Secunderabad", "Hyderabad", "Telangana");
        add("500084", 17.4600, 78.3600, "Kondapur", "Hyderabad", "Telangana");

        // Pune (411xxx)
        add("411001", 18.5289, 73.8744, "Pune Station / Camp", "Pune", "Maharashtra");
        add("411014", 18.5679, 73.9143, "Viman Nagar", "Pune", "Maharashtra");
        add("411038", 18.5074, 73.8077, "Kothrud", "Pune", "Maharashtra");
        add("411057", 18.5913, 73.7389, "Hinjawadi IT Park", "Pune", "Maharashtra");
        add("411006", 18.5500, 73.8900, "Yerawada / Kalyani Nagar", "Pune", "Maharashtra");
        add("411028", 18.5000, 73.9300, "Magarpatta / Hadapsar", "Pune", "Maharashtra");

        // Chennai (600xxx)
        add("600001", 13.0900, 80.2900, "George Town", "Chennai", "Tamil Nadu");
        add("600028", 13.0200, 80.2600, "R.A. Puram", "Chennai", "Tamil Nadu");
        add("600040", 13.0850, 80.2100, "Anna Nagar", "Chennai", "Tamil Nadu");
        add("600096", 12.9600, 80.2400, "Perungudi / OMR", "Chennai", "Tamil Nadu");

        // Kolkata (700xxx)
        add("700091", 22.5800, 88.4200, "Salt Lake Sector V", "Kolkata", "West Bengal");
        add("700019", 22.5200, 88.3600, "Ballygunge", "Kolkata", "West Bengal");
        add("700001", 22.5700, 88.3500, "BBD Bagh / Central", "Kolkata", "West Bengal");
        add("700156", 22.5850, 88.4600, "New Town Action Area 1", "Kolkata", "West Bengal");
    }

    private void initPrefixFallbacks() {
        prefixFallbacks.put("400", new PincodeInfo("400xxx", 19.0760, 72.8777, "Greater Mumbai", "Mumbai", "Maharashtra"));
        prefixFallbacks.put("411", new PincodeInfo("411xxx", 18.5204, 73.8567, "Pune City", "Pune", "Maharashtra"));
        prefixFallbacks.put("560", new PincodeInfo("560xxx", 12.9716, 77.5946, "Bangalore Metro", "Bangalore", "Karnataka"));
        prefixFallbacks.put("110", new PincodeInfo("110xxx", 28.6139, 77.2090, "Delhi NCR", "New Delhi", "Delhi"));
        prefixFallbacks.put("122", new PincodeInfo("122xxx", 28.4595, 77.0266, "Gurugram Hub", "Gurugram", "Haryana"));
        prefixFallbacks.put("201", new PincodeInfo("201xxx", 28.5355, 77.3910, "Noida Express", "Noida", "Uttar Pradesh"));
        prefixFallbacks.put("500", new PincodeInfo("500xxx", 17.3850, 78.4867, "Hyderabad Cyberabad", "Hyderabad", "Telangana"));
        prefixFallbacks.put("600", new PincodeInfo("600xxx", 13.0827, 80.2707, "Chennai Urban", "Chennai", "Tamil Nadu"));
        prefixFallbacks.put("700", new PincodeInfo("700xxx", 22.5726, 88.3639, "Kolkata Metro", "Kolkata", "West Bengal"));
        prefixFallbacks.put("380", new PincodeInfo("380xxx", 23.0225, 72.5714, "Ahmedabad Central", "Ahmedabad", "Gujarat"));
        prefixFallbacks.put("302", new PincodeInfo("302xxx", 26.9124, 75.7873, "Jaipur Pink City", "Jaipur", "Rajasthan"));
    }

    private void add(String pin, double lat, double lon, String area, String city, String state) {
        exactPincodes.put(pin, new PincodeInfo(pin, lat, lon, area, city, state));
    }

    /**
     * Resolves an Indian PIN code to geographical coordinates and area data.
     * Checks exact match -> prefix cluster -> cached lookups.
     */
    public Optional<PincodeInfo> resolvePincode(String pincode) {
        if (!StringUtils.hasText(pincode)) {
            return Optional.empty();
        }
        String cleanPin = pincode.trim().replaceAll("\\D", "");
        if (cleanPin.length() < 3) {
            return Optional.empty();
        }

        // 1. Check exact 6-digit match
        if (exactPincodes.containsKey(cleanPin)) {
            return Optional.of(exactPincodes.get(cleanPin));
        }

        // 2. Check dynamic cache
        if (dynamicCache.containsKey(cleanPin)) {
            return Optional.of(dynamicCache.get(cleanPin));
        }

        // 3. Check 3-digit regional prefix (e.g. 400 for Mumbai, 560 for Bangalore)
        String prefix = cleanPin.substring(0, 3);
        if (prefixFallbacks.containsKey(prefix)) {
            PincodeInfo fallback = prefixFallbacks.get(prefix);
            PincodeInfo adapted = new PincodeInfo(cleanPin, fallback.latitude(), fallback.longitude(),
                    fallback.area() + " (Sector " + cleanPin.substring(3) + ")", fallback.city(), fallback.state());
            dynamicCache.put(cleanPin, adapted);
            return Optional.of(adapted);
        }

        // 4. Check 2-digit state prefix (e.g., 40 for Maharashtra, 56 for Karnataka, 11 for Delhi)
        String prefix2 = cleanPin.substring(0, 2);
        for (Map.Entry<String, PincodeInfo> entry : prefixFallbacks.entrySet()) {
            if (entry.getKey().startsWith(prefix2)) {
                PincodeInfo fallback = entry.getValue();
                PincodeInfo adapted = new PincodeInfo(cleanPin, fallback.latitude(), fallback.longitude(),
                        fallback.city() + " Region", fallback.city(), fallback.state());
                dynamicCache.put(cleanPin, adapted);
                return Optional.of(adapted);
            }
        }

        return Optional.empty();
    }
}
