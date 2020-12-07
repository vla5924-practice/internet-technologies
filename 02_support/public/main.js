let request = {
    get(url) {
        return fetch(url);
    },
    post(url, parameters) {
        let uri = encodeURIComponent;
        let queryString = Object.keys(parameters).map(key => uri(key) + '=' + uri(parameters[key])).join('&');
        console.log(queryString);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: queryString
        });
    }
};

let el = {
    id(id) {
        return document.getElementById(id);
    },
    cl(className) {
        return document.getElementsByClassName(className);
    },
    q(querySelector) {
        return document.querySelector(querySelector);
    },
    qAll(querySelector) {
        return document.querySelectorAll(querySelector);
    },
    tag(tag) {
        return document.getElementsByTagName(tag);
    }
};