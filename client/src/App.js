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
import {blockType} from "./shared/util.ts";

const rootPageId = "root_page"

function App() {
    const [pageData, setPageData] = useState([]);
    // we use array to handle the tree structure
    // pros: easier to render (don't require tree-array conversion, saves memory); easy to iterate through
    // cons: non-intuitive, need to keep track of depth
    useEffect(function () {
        get(`/page/?uuid=${rootPageId}`, (result) => {
            if (result.length === 1) {
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
                    type: blockType.text,
                    parent: rootPageId,
                    content: []
                })

                // make call to db to insert block
                const data = {
                    after_uuid: null,
                    uuid: uuid,
                    title: JSON.stringify(convertToRaw(contentState)),
                    type: blockType.text,
                    parent: rootPageId,
                }

                post(path, () => {}, () => {}, data)
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
        items.push(<Block key={value.uuid} data={value} pageData={props.pageData} setPageData={props.setPageData}/>)
    }
    return (<div className='p-12'>
        {items}
    </div>)
}

const Block = (props) => {
    const onAddBlockClick = () => {
        const path = "/post-block"
        const uuid = uuidv4();
        const insert_after_uuid = props.data.uuid

        // update pageData here, only insert in the front end, use uuid
        let newPageData = [...props.pageData];
        const contentState = ContentState.createFromText("new block")
        const title = JSON.stringify(convertToRaw(contentState))

        for (let i = 0; i < props.pageData.length; i++) {
            if (insert_after_uuid === props.pageData[i].uuid) {
                // spice won't throw even i+1 > props.pageData.length
                newPageData.splice(i + 1, 0,
                    {
                        uuid: uuid,
                        properties: {
                            title: title
                        },
                        type: blockType.text,
                        parent: rootPageId,
                        content: []
                    })
                break
            }
        }

        props.setPageData(newPageData);

        // make call to db to insert block
        const data = {
            after_uuid: insert_after_uuid,
            uuid: uuid,
            title: title,
            type: blockType.text,
            parent: rootPageId,
        }
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
