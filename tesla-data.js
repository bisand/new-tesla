const axios = require('axios');

// Fetch data from Tesla API
async function fetchData() {
    const url = 'https://www.tesla.com/inventory/api/v4/inventory-results?query={"query":{"model":"m3","condition":"used","options":{"TRIM":["LRAWD"],"INTERIOR":["PREMIUM_BLACK"],"ADL_OPTS":["TOWING","PERFORMANCE_UPGRADE"]},"arrangeby":"Odometer","order":"asc","market":"NO","language":"no","lng":10.7343,"lat":59.9016,"zip":"3173","range":0,"region":"NO"},"offset":0,"count":50,"outsideOffset":0,"outsideSearch":false,"isFalconDeliverySelectionEnabled":false,"version":null}';
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
        }
    };
    try {
        const response = await axios.get(url, options);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return { results: [] };
    }
}

// Function to format numbers with commas
function formatNumber(number) {
    return number.toLocaleString('nb-NO', { minimumFractionDigits: 0 });
}

// Function to get wheel size
function getWheelSize(wheels) {
    if (typeof wheels !== 'string') {
        return "N/A";
    }
    const upperCaseWheels = wheels.toUpperCase();
    if (upperCaseWheels === "EIGHTEEN") {
        return "18\"";
    } else if (upperCaseWheels === "NINETEEN") {
        return "19\"";
    } else if (upperCaseWheels === "TWENTY") {
        return "20\"";
    } else if (upperCaseWheels === "TWENTY_ONE") {
        return "21\"";
    } else {
        return "N/A";
    }
}


function prepareData(data) {
    let resultsArray = [];

    // Check if results is an array or has a nested structure
    if (Array.isArray(data.results)) {
        resultsArray = data.results; // If results is a flat array, use it directly
    } else if (data.results && (data.results.exact || data.results.approximate || data.results.approximateOutside)) {
        // Combine exact, approximate, and approximateOutside into one array
        resultsArray = [
            ...(data.results.exact || []),
            ...(data.results.approximate || []),
            ...(data.results.approximateOutside || [])
        ];
    }

    // Sort resultsArray by Odometer and Price
    resultsArray.sort((a, b) => {
        let odometerA = parseFloat(a.Odometer) || 0;
        let odometerB = parseFloat(b.Odometer) || 0;
        let priceA = parseFloat(a.Price) || 0;
        let priceB = parseFloat(b.Price) || 0;

        if (odometerA !== odometerB) {
            return odometerA - odometerB;
        }
        return priceA - priceB;
    });

    // Filter resultsArray to include only records with TRIM that includes "LRAWD"
    resultsArray = resultsArray.filter(result => result.TRIM?.includes("LRAWD"));

    var visualizerData = {
        results: resultsArray.map((result) => {
            let isTowing = result.ADL_OPTS?.includes("TOWING") || false;
            let isPerformance = result.TrimCode === "$MT304";
            let isBlackAndTowing = isTowing && result.PAINT?.includes("BLACK");
            let isTowingOnly = isTowing && !result.PAINT?.includes("BLACK");

            // Ensure PAINT is an array, then check if any color in PAINT is a dark color
            let darkColors = ['BLACK', 'DARK BLUE', 'BLUE', 'DARK GREEN', 'NAVY', 'CHARCOAL'];
            let isDarkPaint = Array.isArray(result.PAINT) && result.PAINT.some(paintColor => darkColors.includes(paintColor.toUpperCase()));

            return {
                VIN: result.VIN || "N/A",
                FactoryCode: result.FactoryCode || "N/A",
                Model: result.Model || "N/A",
                Year: result.Year || "N/A",
                Price: formatNumber(result.Price) || "N/A",
                Odometer: formatNumber(result.Odometer) || "N/A",
                City: result.City,
                PAINT: Array.isArray(result.PAINT) ? result.PAINT.join(', ') : "N/A",
                WHEELS: getWheelSize(result.WHEELS[0]),
                Towing: isTowing,
                isBlackAndTowing: isBlackAndTowing,
                isTowingOnly: isTowingOnly,
                isDarkPaint: isDarkPaint,
                isPerformance: isPerformance,
                OptionCodeList: result.OptionCodeList || "N/A",
                Link: `https://www.tesla.com/no_NO/${result.Model}/order/${result.VIN}?region=NO&titleStatus=used&redirect=no#overview`
            };
        })
    };
    return visualizerData;
}

module.exports = {
    fetchData,
    prepareData
};