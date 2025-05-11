import { useEffect, useRef, useState } from "react"
type ChatMessageDto = {
    SenderId : string
    Body : string
    // SentTime:string
}
export const Chat = () => {
    const [messages, setMessages] = useState<ChatMessageDto[]>([])
    const [online, setOnline] = useState<boolean>(false)
    const [name,setName] = useState<string>('')
    const connection = useRef<WebSocket>(null)

    useEffect(() => {        
        return (() => {
            connection.current?.close()
        })
    },[])

    const connect = () => {
        connection.current = new WebSocket('ws://localhost:5134/ws')
        connection.current.onopen = () => {
            setOnline(true)
        }
        connection.current.onmessage = event => {
            const message = JSON.parse(event.data) as ChatMessageDto;
            setMessages(prev => [...prev, message])
        }
    }

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
    const disconnect = () => {
        connection.current?.close()
        connection.current = null;
        setOnline(false)
    }
    
    return <div style={{display:'flex', flexDirection:'column'}}>
        <h1>{online ? '🟢' : '🔴'} Chat</h1>
        <p>Enter your name and connect</p>
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <input disabled={online} style={{flexGrow:1}} type="text" placeholder="Your name" value={name} onChange={(e => setName(e.target.value))}/>
            {online ? 
            <button onClick={disconnect}>Disconnect</button>
            : <button onClick={() => connect()}>Connect</button>
            }
        </div>
        <div style={{
            minHeight:'500px',
            maxHeight:'500px',
            overflow:'scroll',
            border:'1px solid black',
            padding:'1em',
            margin: '0.75em 0em',
            display:'flex',
            flexDirection:'column'
            }}>
                {messages.map((m,i) => <ChatMessage message={m} key={i} self={m.SenderId == name} />)}
        </div>
        <div style={{display:'flex'}}>
            <input  disabled={!online} id="chat-input" type="text" style={{flexGrow:1}} />
            <button disabled={!online} onClick={() => sendMessage()}>Send</button>
        </div>
    </div>
}

const ChatMessage = ({message, self} : {message:ChatMessageDto,self: boolean}) => {
    return <div style={{
        background: 'linear-gradient(45deg, rgba(0, 79, 248, 0.25),rgba(196, 11, 103, 0.62))',
        margin:'0.25em',
        padding:'0.25em',
        maxWidth:'50%',
        borderRadius: '4px',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.25)',
        alignSelf: self ? 'end' : 'start'
    }}
        >
            <p style={{margin:'0px'}}>{message.SenderId}: {message.Body}</p>
        </div>
}