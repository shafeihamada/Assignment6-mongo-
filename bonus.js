
function romanToInt(s) {
   
    const romanMap = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };

    let total = 0;

  
    for (let i = 0; i < s.length; i++) {
        let currentVal = romanMap[s[i]];
        let nextVal = romanMap[s[i + 1]];

        
        if (nextVal && currentVal < nextVal) {
            total -= currentVal;
        } else {
            
            total += currentVal;
        }
    }

    return total;
}


console.log("III ->", romanToInt("III"));     
console.log("LVIII ->", romanToInt("LVIII")); 
console.log("MCMXCIV ->", romanToInt("MCMXCIV")); 


module.exports = romanToInt;