import './App.css';
import {useState} from "react";
import './index.css';

function App() {
    const fakeDataArray = [
        {
            id: 0,
            properties: {
                title: "i'm the first block"
            },
        },
        {
            id: 1,
            properties: {
                title: "i'm the second block"
            },
        },
        {
            id: 2,
            properties: {
                title: "i'm the third block"
            },
        }
    ]
    return (
        <div className="App">
            <PageContent dataArray={fakeDataArray}/>
        </div>
    );
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
    const [value, setValue] = useState(props.data.properties.title);
    const onChange = event => {
        setValue(event.target.value)
    }
    return (
        <div className='block-wrap'>
            <input className='block' type="text" id={props.id} value={value} onChange={onChange}/>
        </div>
    )
}

export default App;
