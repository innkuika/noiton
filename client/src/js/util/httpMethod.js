const url = process.env.REACT_APP_API_ENDPOINT

const put = (path, thenFun, catchFun, data) => {
    const options = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetchData(path, options, thenFun, catchFun);
}

const post = (path, thenFun, catchFun, data) => {
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    fetchData(path, options, thenFun, catchFun);
}

const get = (path, thenFun, catchFun) => {
    fetchData(path, {}, thenFun, catchFun);
}

async function fetchData(path, options, thenFun, catchFun) {
    const route = url + path
    try {
        const res = await fetch(route, options);
        if (res.status !== 200) {
            throw new Error(`Server refused! ${path}`)
        }
        const json = await res.json();
        console.log(`Got fetch ${path}: `, json);
        thenFun(json);
    } catch (error) {
        console.log(`Errored fetch ${path}: ${error}`);
        catchFun(error);
    }
}

export {put, get, post};
