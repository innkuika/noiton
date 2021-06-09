import './App.css';
import {useEffect, useState} from "react";
import './index.css';
import useAsyncFetch from "./useAsyncFetch";

function App() {
    const [pageData, setPageData] = useState([]);
    useAsyncFetch("/page", {}, (result) => {
        console.log(result)
        setPageData(result);
    }, (error) => {
        console.log(error);
    }, []);

    if (pageData) {
        return (
            <div className="App">
                <PageContent dataArray={pageData}/>
            </div>
        );
    } else {
        return (<div/>)
    }

}

const PageContent = (props) => {
    const items = []
    for (const [index, value] of props.dataArray.entries()) {
        items.push(<Block key={index} data={value}/>)
    }
    return (<div className='p-12'>
        {items}
    </div>)
}

const Block = (props) => {
    const [title, setTitle] = useState(props.data.properties.title);
    const [hasUpdated, setHasUpdated] = useState(false);
    useEffect(() => {
            const interval = setInterval(async () => {
                const url = "/update-block"
                const data = {id: props.data.id, title: title}
                if (hasUpdated) {
                    console.log("update!")
                    // TODO: abstract this
                    const route = "http://localhost:8000" + url
                    try {
                        const res = await fetch(route, {
                            method: "PUT",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });

                        setHasUpdated(false);
                        if (res.status !== 200) {
                            throw(`Server refused! ${url}`)
                        }
                        console.log(`Got fetch ${url}`);
                    } catch
                        (error) {
                        console.log(`Errored fetch ${url}, ${error}`);
                    }
                }

            }, 5000);
            return () => clearInterval(interval);
        });
    const onChange = event => {
        setTitle(event.target.value);
        setHasUpdated(true);
    }

    return (
        <div className='block-wrap'>
            <input className='block' type="text" id={props.id} value={title} onChange={onChange}/>
        </div>
    )
}

export default App;
