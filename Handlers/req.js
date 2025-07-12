import axios from 'axios';

export default async function req(method, url, formdata = null, headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://yrizzz.my.id/',
    'Origin': 'https://yrizzz.my.id',
    'Cache-Control': 'no-cache',
}) {
    try {
        const option = {
            method,
            url,
            maxBodyLength: Infinity,
            headers
        };

        if (method !== 'GET' && formdata) {
            option.data = formdata;
        }

        const response = await axios.request(option);
        return response.data;

    } catch (error) {
        console.error('Axios Error:', {
            url,
            status: error?.response?.status,
            data: error?.response?.data,
            headers: error?.response?.headers
        });

        return {
            success: false,
            message: error?.response?.data?.message || error.message,
            status: error?.response?.status || 500,
            error: error?.response?.data || null
        };
    }
}
