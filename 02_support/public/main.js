let request = {
    get(url) {
        return fetch(url);
    },
    postQueryString(url, parameters) {
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
    },
    postJSON(url, parameters) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(parameters)
        });
    }
};

let el = {
    id(id) {
        return document.getElementById(id);
    },
    className(className) {
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