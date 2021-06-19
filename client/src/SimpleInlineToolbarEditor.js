import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import Draft from 'draft-js'
import Editor from '@draft-js-plugins/editor';
import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import editorStyles from './css/editorStyle.css';
import {put} from "./useAsyncFetch";
import {getBlockIndex} from "./postBlock";


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
        if (props.root) {
            names.push("root-page-block")
        }
        return names.join(" ")
    }

    const handleTabKeyDown = (event) => {
        event.preventDefault(); // stops its action
        let index = getBlockIndex(props.pageData, props.data.uuid)
        if (index !== null && index > 1) {
            // check the depth of block before it
            let blockBefore = props.pageData[index - 1]
            let blockBeforeDepth = blockBefore.depth
            if (blockBeforeDepth >= props.data.depth) {
                // valid operation, handle tab
                // update depth in front end
                let newPageData = [...props.pageData]
                const updatedBlockDepth = props.data.depth + 1
                // todo: remove current block from original parent
                const parentUuid = newPageData[index].parent
                const parent = newPageData[getBlockIndex(newPageData, parentUuid)]
                const blockParentContentIndex = parent.content.indexOf(props.data.uuid)
                if (blockParentContentIndex !== -1) {
                    parent.content.splice(blockParentContentIndex, 1);
                }

                // todo: add block to new parent
                // figure out new parent
                let newParentUuid = null
                if (blockBeforeDepth === updatedBlockDepth) {
                    // they share the same parent now, block should go after block before
                    newParentUuid = blockBefore.parent
                    const newParent = props.pageData[getBlockIndex(props.pageData, newParentUuid)]
                    for (let i = 0; i < newParent.content.length; i++) {
                        if (newParent.content[i] === blockBefore.uuid) {
                            newParent.content.splice(i + 1, 0, props.data.uuid)
                            break
                        }
                    }
                } else if (blockBeforeDepth > updatedBlockDepth) {
                    // traverse backwards in the array from where the block currently is,
                    // the first block with smaller depth is new parent
                    // OR the first block's parent with the same depth is new parent
                    // whichever comes first
                    for (let i = index - 1; i > 0; i--) {
                        if (props.pageData[i].depth < updatedBlockDepth) {
                            newParentUuid = props.pageData[i].uuid
                            break
                        }
                        if (props.pageData[i].depth === updatedBlockDepth) {
                            newParentUuid = props.pageData[i].parent
                            break
                        }
                    }

                    const newParent = props.pageData[getBlockIndex(props.pageData, newParentUuid)]
                    for (let i = 0; i < newParent.content.length; i++) {
                        if (newParent.content[i] === blockBefore.uuid) {
                            newParent.content.splice(i + 1, 0, props.data.uuid)
                            break
                        }
                    }

                } else {
                    // block before becomes the new parent, block becomes first child
                    newParentUuid = blockBefore.uuid
                    blockBefore.content.splice(0, 0, props.data.uuid)
                }

                newPageData[index].depth = updatedBlockDepth
                newPageData[index].parent = newParentUuid
                props.setPageData(newPageData)

                console.log("new page data: ", newPageData)
                console.log("new parent uuid: ", newParentUuid)
                console.log("new parent content: ", props.pageData[getBlockIndex(newPageData, newParentUuid)].content)

                // todo: make call to backend
                const path = "/move-block"
                const data = {
                    fromUuid: parentUuid,
                    toUuid: newParentUuid,
                    moveUuid: props.data.uuid,
                    fromUuidContent: parent.content,
                    toUuidContent: props.pageData[getBlockIndex(newPageData, newParentUuid)].content
                }
                put(path, () => {
                }, () => {
                }, data)
            }
        }

    }

    const handleEnterKeyDown = (event) => {
        console.log('Enter key down!, content state: ', editorState.getCurrentContent().getBlocksAsArray())
        event.preventDefault(); // stops its action


        // get second block in current content state
        // delete it
        // create new block using it
        // if root use root as parent

        // move cursor to beginning of the new block
    }


    function keyBindingFn(event) {
        if (event.key === 'Enter') {
            handleEnterKeyDown(event)
        } else if (event.key === "Tab") {
            handleTabKeyDown(event)
        }

        // This wasn't the delete key, so we return Draft's default command for this key
        return Draft.getDefaultKeyBinding(event)
    }

    function handleKeyCommand(command) {
        if (command === 'delete-me') {
            // Do what you want to here, then tell Draft that we've taken care of this command
            return 'handled'
        }

        // This wasn't the 'delete-me' command, so we want Draft to handle it instead.
        // We do this by telling Draft we haven't handled it.
        return 'not-handled'
    }


    //onKeyDown={handleKeyDown}
    return (
        <div className={editorClassName()} onClick={focus}>
            <Editor
                editorKey="SimpleInlineToolbarEditor"
                editorState={editorState}
                onChange={onChange}
                placeholder={props.root ? "Untitled" : "Start typing"}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
                blockStyleFn={myBlockStyleFn}
                plugins={props.root ? undefined : plugins}
                keyBindingFn={keyBindingFn}
                handleKeyCommand={handleKeyCommand}
            />
            {props.root ? undefined : <InlineToolbar/>}
        </div>
    );
};

export default SimpleInlineToolbarEditor;
