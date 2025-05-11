using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using web_api.Dtos;
using web_api.Services;

namespace web_api.Controllers
{
    [Route("")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ChatHub _chatHub;

        public ChatController(ChatHub chatHub)
        {
            _chatHub = chatHub;
        }
        
        [HttpGet("ws")]
        public async Task Get(){
            if(HttpContext.WebSockets.IsWebSocketRequest){
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                _chatHub.AddConnection(webSocket);

                await ReceiveMessage(webSocket, (results, buffer) => {
                    if(results.MessageType == WebSocketMessageType.Text){
                        string message = Encoding.UTF8.GetString(buffer,0 , results.Count);
                        try{
                            var chatMessage = JsonSerializer.Deserialize<ChatMessageDto>(message);
                            _chatHub.BroadcastMessage(chatMessage);
                        }
                        catch{
                            //
                            var bytes = Encoding.UTF8.GetBytes("Blä");
                            webSocket.SendAsync(bytes,WebSocketMessageType.Text,true,CancellationToken.None);
                        }
                    }
                    else if(results.MessageType == WebSocketMessageType.Close || webSocket.State == WebSocketState.Aborted){
                        _chatHub.RemoveConnection(webSocket);
                        var closeStatus = results.CloseStatus ?? WebSocketCloseStatus.Empty;
                        webSocket.CloseAsync(closeStatus, results.CloseStatusDescription, CancellationToken.None);
                    }
                });
            }
            else{
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        [HttpGet("hello")]
        public ActionResult GetHttp(){
            return Ok("Hello!");
        }

        private async Task ReceiveMessage(WebSocket webSocket, Action<WebSocketReceiveResult, byte[]> handleMessage){
            var buffer = new byte[1024*4];
            while(webSocket.State == WebSocketState.Open){
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                handleMessage(result, buffer);
            }
        }

        private static async Task Echo(WebSocket webSocket){
            var buffer = new byte[1024 * 4];
            var receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None
            );

            while (!receiveResult.CloseStatus.HasValue){
                await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, receiveResult.Count),receiveResult.MessageType,receiveResult.EndOfMessage,CancellationToken.None);

                receiveResult = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            await webSocket.CloseAsync(receiveResult.CloseStatus.Value,receiveResult.CloseStatusDescription,CancellationToken.None);
        }
    }
}
