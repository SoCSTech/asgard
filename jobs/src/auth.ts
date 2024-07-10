import axios from "axios";

const apiUrl = process.env.API_URL as string;
const botUser = process.env.BOT_USER as string;
const botPass = process.env.BOT_PASS as string;

export const loginAsBotUser = async () => {
    axios
        .post(
            apiUrl + "/v2/auth/login",
            {
                username: botUser,
                password: botPass
            },
            {
                timeout: 15000, // 15 seconds timeout
                headers: { "Cache-Control": "no-cache" },
            }
        )
        .then(function (response) {
            console.log(response.data.TOKEN);

        })
        .catch(function (error) {
            console.log(error);
            if (error.code === "ECONNABORTED") {
                console.error(
                    "The request took too long - please try again later."
                );
            } else {
                console.error(
                    error.response?.data?.message || "An unknown error occurred"
                );
            }
        });
}