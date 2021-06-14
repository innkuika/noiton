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
    const editor = useRef < Editor | null > (null);
    const [plugins, InlineToolbar] = useMemo(() => {
        const inlineToolbarPlugin = createInlineToolbarPlugin();
        return [[inlineToolbarPlugin], inlineToolbarPlugin.InlineToolbar];
    }, []);
    const [hasUpdated, setHasUpdated] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(JSON.parse(props.data.properties.title))))
    const updateInterval = 1000;
    // save content every updateInterval seconds to db if there is an update
    useEffect(() => {
        const interval = setInterval(() => {
            if (hasUpdated) {
                const path = "/update-block"
                const contentState = editorState.getCurrentContent()
                const data = {uuid: props.data.uuid, title: JSON.stringify(convertToRaw(contentState))}
                console.log("saving...")
                put(path, () => {
                }, () => {
                }, data)
                setHasUpdated(false)
            }
        }, updateInterval);
        return () => clearInterval(interval);
    });

    const onChange = (newEditorState) => {
        const currentContent = editorState.getCurrentContent()
        const newContent = newEditorState.getCurrentContent()

        if (currentContent !== newContent) {
            setHasUpdated(true)
        }
        setEditorState(newEditorState);
    };

    const focus = () => {
        editor.current?.focus();
    };

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
            />
            <InlineToolbar/>
        </div>
    );
};

export default SimpleInlineToolbarEditor;
