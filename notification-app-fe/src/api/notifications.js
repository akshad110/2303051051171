const axios  = require('axios');
require('dotenv').config();

const BASE_URL = "http://4.224.186.213/evaluation-service/notifications";

export async function fetchNotifications(page = 1, filter = "All") {
  const token = process.env.TOKEN; // Put your access token here

  const params = {
    page,
    limit: 10,
  };

  if (filter !== "All") {
    params.notification_type = filter;
  }

  const response = await axios.get(BASE_URL, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}