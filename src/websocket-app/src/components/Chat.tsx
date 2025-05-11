import { useEffect, useRef, useState } from "react"
type ChatMessageDto = {
    SenderId : string
    Body : string
    // SentTime:string
}
export const Chat = () => {
    const [messages, setMessages] = useState<ChatMessageDto[]>([])
    const [name,setName] = useState<string>('')
    const connection = useRef<WebSocket>(null)

    useEffect(() => {
        connection.current = new WebSocket('ws://localhost:5134/ws')
        
        connection.current.onmessage = event => {
            console.log(event.data)
            const message = JSON.parse(event.data) as ChatMessageDto;
            setMessages(prev => [...prev, message])
        }
        
        return (() => {
            connection.current?.close()
        })
    },[])

    const sendMessage = () => {
        const input = document.querySelector<HTMLInputElement>("#chat-input")
        if(input && connection.current){
            const message = JSON.stringify({
                SenderId: name,
                Body: input.value
            } as ChatMessageDto)
            connection.current.send(message)

            input.value = "";
        }
    }
    
    return <div style={{display:'flex', flexDirection:'column'}}>
        <h1>Chat</h1>
        <input type="text" placeholder="Your name" value={name} onChange={(e => setName(e.target.value))}/>
        <div style={{
            minHeight:'500px',
            border:'1px solid black',
            margin:'1em',
            display:'flex',
            flexDirection:'column'
            }}>
                {messages.map((m,i) => <ChatMessage message={m} key={i} />)}
        </div>
        <div style={{display:'flex'}}>
            <input id="chat-input" type="text" style={{flexGrow:1}} />
            <button onClick={() => sendMessage()}>Send</button>
        </div>
    </div>
}

const ChatMessage = ({message} : {message:ChatMessageDto}) => {
    return <div style={{
        background: 'linear-gradient(45deg, rgba(0, 79, 248, 0.25),rgba(41, 49, 134, 0.38))',
        margin:'0.25em',
        padding:'0.25em',
        maxWidth:'50%',
        borderRadius: '4px',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.25)'

    }}
        >
            <p>{message.Body}</p>
            <p><small>{message.SenderId}</small></p>
        </div>
}