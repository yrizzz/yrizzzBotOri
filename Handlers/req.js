import axios from 'axios';

export default async function req(method, url, formdata = null, headers = {}) {
    try {
        const response = await axios.request({
            method,
            url,
            timeout: 3000,
            maxBodyLength: Infinity,
            headers,
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
