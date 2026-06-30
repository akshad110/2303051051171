require("dotenv").config();
const axios = require("axios");

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

const PRIORITY = {
    Placement: 3,
    Result: 2,
    Event: 1
};

async function getTopNotifications() {
    try {

        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });

        const notifications = response.data.notifications;

        const top10 = notifications
            .sort((a, b) => {

                const priorityDiff =
                    PRIORITY[b.Type] - PRIORITY[a.Type];

                if (priorityDiff !== 0)
                    return priorityDiff;

                return (
                    new Date(b.Timestamp) -
                    new Date(a.Timestamp)
                );
            })
            .slice(0, 10);

        console.table(
            top10.map(n => ({
                ID: n.ID,
                Type: n.Type,
                Message: n.Message,
                Timestamp: n.Timestamp
            }))
        );

    } catch (err) {

        console.log(err.response?.data || err.message);

    }
}

getTopNotifications();