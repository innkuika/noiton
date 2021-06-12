import './App.css';
import {useEffect, useState} from "react";
import './index.css';
import {post, put, useAsyncFetch} from "./useAsyncFetch";
import {v4 as uuidv4} from 'uuid';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

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
                <PageContent pageData={pageData} setPageData={setPageData}/>
            </div>
        );
    } else {
        return (<div/>)
    }

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
    const contentState = ContentState.createFromText(props.data.properties.title)
    const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState))
    const [hasUpdated, setHasUpdated] = useState(false);
    const updateInterval = 1000;
    // save content every updateInterval seconds to db if there is an update
    useEffect(() => {
        const interval = setInterval(async () => {
            const path = "/update-block"
            const data = {uuid: props.data.uuid, title: editorState.getCurrentContent().getPlainText()}
            if (hasUpdated) {
                put(path, (result) => {
                    console.log(result);
                }, (error) => {
                    console.log(error);
                }, data)
            }

        }, updateInterval);
        return () => clearInterval(interval);
    });

    const onAddBlockClick = () => {
        console.log("clicked")
        const path = "/post-block"
        const uuid = uuidv4();

        // update pageData here, only insert in the front end, use uuid
        let newPageData = [...props.pageData];
        // TODO: find where to insert
        newPageData.push({
            uuid: uuid,
            properties: {
                title: ""
            },
        })
        props.setPageData(newPageData);

        // make call to db to insert block
        const data = {after_uuid: props.data.uuid, uuid: uuid}
        post(path, (result) => {
            console.log(result);
        }, (error) => {
            console.log(error);
        }, data)


    }

    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
        setHasUpdated(true);
    }
    return (
        <div className='block-wrap flex items-center'>
            <button className='flex-auto m-4 bg-blue-300 w-8 h-8' onClick={onAddBlockClick}>+</button>
            <Editor
                id={props.uuid}
                editorState={editorState}
                toolbarClassName="toolbarClassName"
                wrapperClassName="wrapperClassName"
                editorClassName="editorClassName"
                onEditorStateChange={onEditorStateChange}
            />
        </div>
    )
}

export default App;
