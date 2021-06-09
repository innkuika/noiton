import './App.css';
import {useEffect, useState} from "react";
import './index.css';
import {put, useAsyncFetch} from "./useAsyncFetch";

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
    const updateInterval = 5000;
    useEffect(() => {
        const interval = setInterval(async () => {
            const path = "/update-block"
            const data = {id: props.data.id, title: title}
            if (hasUpdated) {
                console.log("update!")
                put(path, (result) => {
                    console.log(result);
                }, (error) => {
                    console.log(error);
                }, data)
            }

        }, updateInterval);
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
