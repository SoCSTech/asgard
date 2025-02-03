export const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
export const Y2_URL = import.meta.env.PUBLIC_Y2_URL || "https://yggdrasil.socstech.support";
export const PUBLIC_ROUTES = [ "/login", "/forgot-password", "/change-password" ]

// * remove for debug *
// console.log("+---------------+")
// console.log("API:\t", API_URL)
// console.log("Y2:\t", Y2_URL)
// console.log("+---------------+")