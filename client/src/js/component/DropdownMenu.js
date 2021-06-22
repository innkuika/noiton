import '../../css/reset.css'
import '../../css/DropodownMenuStyle.css'

const DropdownMenu = (props) => {
    const options = [
        {name: 'Heading 1', description: 'Big section heading.', value: 'h1', img: 'h1-icon.png'},
        {name: 'Heading 2', description: 'Medium section heading.', value: 'h2', img: 'h2-icon.png'},
    ];

    return(
        <div className='dropdown-menu'>
            {options.map((o, i)=> {
                return <DropdownMenuItem key={i} name={o.name} description={o.description} img={o.img} value={o.value} setSelection={props.setSelection}/>
            })}
        </div>
    )
}

const DropdownMenuItem = (props) => {
    return (
        <div className='dropdown-option'
            onClick={e => {
            e.preventDefault()
            props.setSelection(props.value)
        }}>
            <span className='option-img'>
                <img src={`img/${props.img}`}/>
            </span>
            <span className='option-description'>
                <div className='text-sm font-medium option-title'>{props.name}</div>
                <div className='text-xs font-light  option-detail'>{props.description}</div>
            </span>
        </div>
    )
}

export {DropdownMenu}
