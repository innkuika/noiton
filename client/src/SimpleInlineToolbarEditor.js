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
    const [plugins, InlineToolbar] = useMemo(() => {
        const inlineToolbarPlugin = createInlineToolbarPlugin();
        return [[inlineToolbarPlugin], inlineToolbarPlugin.InlineToolbar];
    }, []);
    const [hasUpdated, setHasUpdated] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(JSON.parse(props.data.properties.title))))
    const updateInterval = 500;
    // save content every updateInterval seconds to db if there is an update
    useEffect(() => {
        const interval = setInterval(async () => {
            const path = "/update-block"
            const contentState = editorState.getCurrentContent()
            const data = {uuid: props.data.uuid, title: JSON.stringify(convertToRaw(contentState))}
            if (hasUpdated) {
                put(path, (result) => {
                    console.log("saved! ", result);
                }, (error) => {
                    console.log("save errored ", error);
                }, data)
            }

        }, updateInterval);
        return () => clearInterval(interval);
    });

    const editor = useRef < Editor | null > (null);
    const onChange = (value) => {
        setEditorState(value);
        setHasUpdated(true);
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
            />
            <InlineToolbar/>
        </div>
    );
};

export default SimpleInlineToolbarEditor;
