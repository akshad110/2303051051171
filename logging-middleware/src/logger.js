const axios = require('axios');
require('dotenv').config();
const LOG_API = 'http://4.226.186.213/evaluation-service/logs'
const TOKEN = process.env.ACCESS_TOKEN;

async function log(stack,level,package,message){
    try{
        const res = await axios.post(
            LOG_API,{
                stack,
                level,
                package:package,
                message
            },
            { 
            headers:{
             Authorization:`Bearer ${TOKEN}`,
             "Content-Type":"application/json"
            }
           }
        )

        return res.data;
    }catch(err){
        console.log("Logging Failed!");
        if(err.res){
            console.error(err.res.data);
        }else{
            console.error(err.message);
        }
    }
}

module.exports = log;