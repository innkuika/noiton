import './css/reset.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './css/App.css';
import '@draft-js-plugins/inline-toolbar/lib/plugin.css'
import './index.css';
import {useEffect, useState} from "react";
import {post, get} from "./useAsyncFetch";
import {v4 as uuidv4} from 'uuid';
import {ContentState, convertToRaw} from 'draft-js';
import SimpleInlineToolbarEditor from './SimpleInlineToolbarEditor'


function App() {
    const [pageData, setPageData] = useState([]);
    useEffect(function () {
        get('/page', (result) => {
            if (result.length === 0) {
                console.log("page is empty")
                // if there is nothing, create a empty block and push it to db
                const path = "/post-block"
                const uuid = uuidv4();

                const contentState = ContentState.createFromText("empty page block")

                result.push({
                    uuid: uuid,
                    properties: {
                        title: JSON.stringify(convertToRaw(contentState))
                    },
                })

                // make call to db to insert block
                const data = {after_uuid: null, uuid: uuid, title: JSON.stringify(convertToRaw(contentState))}
                post(path, (result) => {
                    console.log(result);
                }, (error) => {
                    console.log(error);
                }, data)
            }
            setPageData(result);
        }, () => {
        });
    }, []);

    return (
        <div className="App">
            <PageContent pageData={pageData} setPageData={setPageData}/>
        </div>
    );

}

const PageContent = (props) => {
    const items = []
    for (const [index, value] of props.pageData.entries()) {
        items.push(<Block key={index} data={value} pageData={props.pageData} setPageData={props.setPageData}/>)
    }
    return (<div className='p-12'>
        {items}
    </div>)
}

const Block = (props) => {
    const onAddBlockClick = () => {
        const path = "/post-block"
        const uuid = uuidv4();

        // update pageData here, only insert in the front end, use uuid
        let newPageData = [...props.pageData];
        // TODO: find where to insert
        const contentState = ContentState.createFromText("new block")
        const title = JSON.stringify(convertToRaw(contentState))
        newPageData.push({
            uuid: uuid,
            properties: {
                title: title
            },
        })
        props.setPageData(newPageData);

        // make call to db to insert block
        const data = {after_uuid: props.data.uuid, uuid: uuid, title: title}
        post(path, () => {
        }, () => {
        }, data)


    }
    return (
        <div className='block-wrap'>
            <button className='add-block-button flex-none' onClick={onAddBlockClick}>+</button>
            <SimpleInlineToolbarEditor
                data={props.data}
            />
        </div>
    )
}

export default App;
