import axios from 'axios';

export default function req(method, url, formdata = null, header = null) {
    const option = {
        url,
        method,
        maxBodyLength: Infinity,
        headers: header,
        data: formdata
    };

    return axios.request(option)
        .then(response => response.data)
        .catch(err => err);
}
