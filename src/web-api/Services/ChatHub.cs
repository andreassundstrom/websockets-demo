using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Unicode;
using web_api.Dtos;

namespace web_api.Services;

public class ChatHub
{
    private List<WebSocket> webSockets = new List<WebSocket>();

    public void AddConnection(WebSocket webSocket){
        webSockets.Add(webSocket);
    }

    public void RemoveConnection(WebSocket webSocket){
        webSockets.Remove(webSocket);
    }

    public void BroadcastMessage(ChatMessageDto message){
        foreach(var webSocket in webSockets){
            var stringMessage = JsonSerializer.Serialize(message);
            var bytes = Encoding.UTF8.GetBytes(stringMessage);
            webSocket.SendAsync(new ArraySegment<byte>(bytes),WebSocketMessageType.Text, true,CancellationToken.None);
        }
    }
}
