import axios from 'axios';

export default async function req(method, url, formdata = null, headers = {}) {
    try {
        const response = await axios.request({
            method,
            url,
            timeout: 3000,
            maxBodyLength: Infinity,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
                'Referer': 'https://yrizzz.my.id',
            },
            data: formdata
        });

        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message,
            status: error?.response?.status || 500,
            error: error?.response?.data || null
        };
    }
}
