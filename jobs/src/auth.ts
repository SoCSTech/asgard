import axios from "axios";

require('dotenv').config();
const apiUrl = process.env.API_URL as string;
const botUser = process.env.BOT_USER as string;
const botPass = process.env.BOT_PASS as string;

export const loginAsBotUser = async (): Promise<string> => {
    return axios
        .post(
            apiUrl + "/v2/auth/login",
            {
                username: botUser,
                password: botPass
            },
            {
                timeout: 5000, // 5 seconds timeout
                headers: { "Cache-Control": "no-cache" },
            }
        )
        .then(function (response) {
            return response.data.TOKEN;
        })
        .catch(function (error) {
            console.log(error);
            if (error.code === "ECONNABORTED") {
                console.error(
                    "Could not connect to asgard api! The request took too long... API Url is " + apiUrl
                );
            } else {
                console.error(
                    error.response?.data?.message || "An unknown error occurred"
                );
            }
            return "ERROR"
        });
    return "ERROR"
}