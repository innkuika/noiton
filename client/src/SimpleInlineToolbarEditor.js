import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import editorStyles from './css/editorStyle.css';
import {put} from "./useAsyncFetch";


const SimpleInlineToolbarEditor = (props) => {
    console.log("hasUpdated ", props.hasUpdated)
    const [plugins, InlineToolbar] = useMemo(() => {
        const inlineToolbarPlugin = createInlineToolbarPlugin();
        return [[inlineToolbarPlugin], inlineToolbarPlugin.InlineToolbar];
    }, []);

    const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(JSON.parse(props.data.properties.title))))
    const updateInterval = 1000;
    // save content every updateInterval seconds to db if there is an update
    useEffect(async () => {
        const interval = setInterval(async () => {
            const path = "/update-block"
            const contentState = editorState.getCurrentContent()
            const data = {uuid: props.data.uuid, title: JSON.stringify(convertToRaw(contentState))}
            if (props.hasUpdated) {
                console.log("hasUpdated in if ", props.hasUpdated)
                console.log("saving...")
                await put(path, (result) => {
                    console.log("saved! in then func ", result);
                }, (error) => {
                    console.log("save errored ", error);
                }, data)
                props.setHasUpdated(false)
                console.log("saved")
            }

        }, updateInterval);
        return () => clearInterval(interval);
    });

    const editor = useRef < Editor | null >(null);
    const onChange = (value) => {
        console.log("onchange")
        setEditorState(value);

    };

    const focus = () => {
        editor.current?.focus();
    };

    console.log("class name ", editorStyles.editor)
    return (
        <div className={editorStyles.editor + " simple-editor"} onClick={focus}>
            <Editor
                editorKey="SimpleInlineToolbarEditor"
                editorState={editorState}
                onChange={onChange}
                plugins={plugins}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
                onEditorStateChange={() => {
                    console.log('on editor stage change')
                    props.setHasUpdated(true);
                }}
            />
            <InlineToolbar/>
        </div>
    );
};

export default SimpleInlineToolbarEditor;
