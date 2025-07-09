import axios from 'axios';

export default async function req(method, url, formdata = null, header = null) {
    const option = {
        url,
        method,
        maxBodyLength: Infinity,
        headers: header,
        data: formdata
    };

    return await axios.request(option)
        .then(response => response.data)
        .catch(err => err);
}
