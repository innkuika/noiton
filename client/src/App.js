import './css/reset.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './css/App.css';
import '@draft-js-plugins/inline-toolbar/lib/plugin.css'
import './index.css';
import {useEffect, useState} from "react";
import {get} from "./useAsyncFetch";
import SimpleInlineToolbarEditor from './SimpleInlineToolbarEditor'
import {postBlock} from "./postBlock";

const rootPageId = "root_page"

function App() {
    const [pageData, setPageData] = useState([]);
    // we use array to handle the tree structure
    // pros: easier to render (don't require tree-array conversion, saves memory); easy to iterate through
    // cons: non-intuitive, need to keep track of depth
    useEffect(function () {
        get(`/page/?uuid=${rootPageId}`, (result) => {
            if (result.length === 1) {
                // if there is nothing, create a empty block and push it to db
                postBlock(null, result, setPageData, 1, rootPageId)
            } else {
                setPageData(result);
            }
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
    for (const [, value] of props.pageData.entries()) {
        items.push(<Block key={value.uuid} data={value} pageData={props.pageData} setPageData={props.setPageData}
                          root={value.depth === 0}/>)
    }
    return (<div className='p-12'>
        {items}
    </div>)
}

const Block = (props) => {
    const depth = props.data.depth
    const onAddBlockClick = async () => {
        postBlock(props.data.uuid, props.pageData, props.setPageData, props.data.depth, props.data.parent)
    }
    const indentationPadding = 20
    return (
        <div className='block-wrap' style={{marginLeft: `${depth*indentationPadding}px`}}>
            {props.root ? undefined :
                <button className='add-block-button flex-none' onClick={onAddBlockClick}>+</button>
            }
            <SimpleInlineToolbarEditor
                data={props.data}
                root={props.root}
                pageData={props.pageData}
                setPageData={props.setPageData}
            />
        </div>
    )
}

export default App;
