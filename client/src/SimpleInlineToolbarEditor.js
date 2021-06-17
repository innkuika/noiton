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

    const myBlockStyleFn = () => {
        if (props.root) {
            return 'header-zero';
        }
    }

    const editorClassName = () => {
        let names = [editorStyles.editor, "simple-editor"]
        if(props.root) {
            names.push("root-page-block")
        }
        return names.join(" ")
    }

    const handleEnterKeyDown = (event) => {
        console.log('Enter key down!')
        // get second block in current content state
        // delete it
        // create new block using it
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleEnterKeyDown(event)
        }
    }


    return (
        <div className={editorClassName()} onClick={focus} onKeyDown={handleKeyDown}>
            <Editor
                editorKey="SimpleInlineToolbarEditor"
                editorState={editorState}
                onChange={onChange}
                placeholder={props.root? "Untitled" : "Start typing"}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
                blockStyleFn={myBlockStyleFn}
                plugins={props.root ? undefined : plugins}
            />
            {props.root ? undefined : <InlineToolbar/>}
        </div>
    );
};

export default SimpleInlineToolbarEditor;
